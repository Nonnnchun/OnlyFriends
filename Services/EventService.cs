using OnlyFriends.Models;
using OnlyFriends.Models.DTOS.EventDTOS;
using OnlyFriends.Data;
using Microsoft.EntityFrameworkCore;
using Mapster;

namespace OnlyFriends.Services;

public interface IEventService
{
    Task<GetEventDTO> AddEventAsync(CreateEventDTO activityToCreate);
    Task UpdateEventAsync(UpdateEventDTO activityToUpdate);
    Task DeleteEventAsync(Event activity);

    Task<GetEventDTO?> FindEventByIdAsync(int id);
    Task<IEnumerable<GetEventDTO>> GetEventsAsync(IEnumerable<int>? categoryIds = null);
    Task AddUserToEvent(AddUserToEventDTO userEventToAdd);
    Task AcceptJoinRequest(int eventId, int userId);
    Task CancelJoinEvent(int userId, int eventId);
    Task ToggleRegistrationAsync(int eventId, bool isOpen);
    Task UpdateVisibilityAsync(int eventId, bool isPublic);
    Task UpdateParticipantStatusAsync(int eventId, int userId, EnumRequestStatus status);
    Task SendEventInvitesAsync(int eventId, List<int> userIds);
}
public sealed class EventService : IEventService
{
    private readonly ApplicationDbContext _context;

    public EventService(ApplicationDbContext context)
    {
        _context = context;
    }

    private async Task CloseExpiredRegistrationEventsAsync()
    {
        var nowUtc = DateTime.UtcNow;
        var expiredOpenEvents = await _context.Events
            .Where(e =>
                e.EventStatus == EnumEventStatus.Open &&
                e.RegistrationDeadline.HasValue &&
                e.RegistrationDeadline.Value <= nowUtc)
            .ToListAsync();

        if (expiredOpenEvents.Count == 0) return;

        foreach (var ev in expiredOpenEvents)
        {
            ev.EventStatus = EnumEventStatus.Closed;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<GetEventDTO> AddEventAsync(CreateEventDTO activityToCreate)
    {
        Event activity = activityToCreate.Adapt<Event>();

        var categoryNames = (activityToCreate.CategoryNames ?? [])
            .Select(name => (name ?? string.Empty).Trim())
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (categoryNames.Count > 0)
        {
            var existingCategories = await _context.Categories
                .Where(c => categoryNames.Contains(c.CategoryName))
                .ToListAsync();

            var existingNameSet = existingCategories
                .Select(c => c.CategoryName)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var newCategories = categoryNames
                .Where(name => !existingNameSet.Contains(name))
                .Select(name => new Category { CategoryName = name })
                .ToList();

            if (newCategories.Count > 0)
            {
                _context.Categories.AddRange(newCategories);
            }

            activity.Categories = existingCategories
                .Concat(newCategories)
                .ToList();
        }
        else
        {
            var categoryIds = (activityToCreate.CategoryIds ?? [])
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            if (categoryIds.Count > 0)
            {
                var categories = await _context.Categories
                    .Where(c => categoryIds.Contains(c.Id))
                    .ToListAsync();

                if (!categories.Any()) throw new KeyNotFoundException("No valid categories found!");
                activity.Categories = categories;
            }
        }

        _context.Events.Add(activity);
        await _context.SaveChangesAsync();
        return activity.Adapt<GetEventDTO>();
    }

    public async Task DeleteEventAsync(Event activity)
    {
        _context.Events.Remove(activity);
        await _context.SaveChangesAsync();
    }

    public async Task<GetEventDTO?> FindEventByIdAsync(int id)
    {
        await CloseExpiredRegistrationEventsAsync();

        var result = await _context.Events
                .Include(e => e.Categories)
                .Where(x => x.Id == id)
                .AsNoTracking()
                .ProjectToType<GetEventDTO>()
                .FirstOrDefaultAsync();
        return result;
    }

    public async Task<IEnumerable<GetEventDTO>> GetEventsAsync(IEnumerable<int>? categoryIds = null)
    {
        await CloseExpiredRegistrationEventsAsync();

        IQueryable<Event> query = _context.Events
            .Include(e => e.Categories)
            .AsNoTracking();

        List<int> categoryIdList = categoryIds?
            .Distinct()
            .ToList() ?? [];

        List<GetEventDTO> activitys = await query
            .OrderByDescending(e => e.StartAt)
            .ProjectToType<GetEventDTO>()
            .ToListAsync();

        if (categoryIdList.Count > 0)
        {
            HashSet<int> categoryIdSet = categoryIdList.ToHashSet();

            activitys = activitys
                .Where(e => (e.Categories ?? [])
                    .Any(c => categoryIdSet.Contains(c.Id)))
                .ToList();
        }

        return activitys;
    }

    public async Task UpdateEventAsync(UpdateEventDTO activityToUpdate)
    {
        var activity = await _context.Events
            .Include(e => e.Categories)
            .FirstOrDefaultAsync(e => e.Id == activityToUpdate.Id);

        if (activity == null)
        {
            return;
        }
        activityToUpdate.Adapt(activity);

        if (activityToUpdate.CategoryIds != null)
        {
            var newCategories = await _context.Categories
                .Where(c => activityToUpdate.CategoryIds.Contains(c.Id))
                .ToListAsync();
            activity.Categories.Clear();
            foreach (var cat in newCategories)
            {
                activity.Categories.Add(cat);
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task AddUserToEvent(AddUserToEventDTO userEventToAdd)
    {
        var status = userEventToAdd.RequestStatus ?? EnumRequestStatus.Pending;
        var ue = await _context.UserEvents
            .FirstOrDefaultAsync(x => x.EventId == userEventToAdd.EventId && x.UserId == userEventToAdd.UserId);

        if (ue == null)
        {
            _context.UserEvents.Add(new UserEvent
            {
                EventId = userEventToAdd.EventId,
                UserId = userEventToAdd.UserId,
                RequestStatus = status
            });
        }
        else
        {
            ue.RequestStatus = status;
        }

        await _context.SaveChangesAsync();
    }

    public async Task AcceptJoinRequest(int eventId, int userId)
    {
        var ue = await _context.UserEvents
            .FirstOrDefaultAsync(x => x.EventId == eventId && x.UserId == userId)
            ?? throw new KeyNotFoundException($"No pending request found for user {userId} in event {eventId}");

        ue.RequestStatus = EnumRequestStatus.Accepted;
        await _context.SaveChangesAsync();
    }

    public async Task CancelJoinEvent(int userId, int eventId)
    {
        var ue = await _context.UserEvents
            .FirstOrDefaultAsync(x => x.EventId == eventId && x.UserId == userId);

        if (ue != null)
        {
            _context.UserEvents.Remove(ue);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ToggleRegistrationAsync(int eventId, bool isOpen)
    {
        var ev = await _context.Events.FindAsync(eventId)
            ?? throw new KeyNotFoundException($"Event {eventId} not found");
        ev.EventStatus = isOpen ? EnumEventStatus.Open : EnumEventStatus.Closed;
        await _context.SaveChangesAsync();
    }

    public async Task UpdateVisibilityAsync(int eventId, bool isPublic)
    {
        var ev = await _context.Events.FindAsync(eventId)
            ?? throw new KeyNotFoundException($"Event {eventId} not found");
        ev.JointType = isPublic ? EnumJointType.Public : EnumJointType.Private;
        await _context.SaveChangesAsync();
    }

    public async Task UpdateParticipantStatusAsync(int eventId, int userId, EnumRequestStatus status)
    {
        var ue = await _context.UserEvents
            .FirstOrDefaultAsync(x => x.EventId == eventId && x.UserId == userId)
            ?? throw new KeyNotFoundException($"No UserEvent found for user {userId} in event {eventId}");
        ue.RequestStatus = status;
        await _context.SaveChangesAsync();
    }

    public async Task SendEventInvitesAsync(int eventId, List<int> userIds)
    {
        foreach (var userId in userIds)
        {
            var ue = await _context.UserEvents
                .FirstOrDefaultAsync(x => x.EventId == eventId && x.UserId == userId);
            if (ue == null)
            {
                _context.UserEvents.Add(new UserEvent
                {
                    EventId = eventId,
                    UserId = userId,
                    RequestStatus = EnumRequestStatus.Accepted
                });
            }
            else
            {
                ue.RequestStatus = EnumRequestStatus.Accepted;
            }
        }
        await _context.SaveChangesAsync();
    }
}
