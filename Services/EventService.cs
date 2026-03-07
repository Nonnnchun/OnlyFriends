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
    Task<IEnumerable<GetEventDTO>> GetEventsAsync();
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

    public async Task<GetEventDTO> AddEventAsync(CreateEventDTO activityToCreate)
    {
        Event activity = activityToCreate.Adapt<Event>();

        // Get Category objects
        if (activityToCreate.CategoryIds != null && activityToCreate.CategoryIds.Any())
        {
            var categories = await _context.Categories
                .Where(c => activityToCreate.CategoryIds.Contains(c.Id))
                .ToListAsync();
            
            if (!categories.Any()) throw new KeyNotFoundException("No valid categories found!");
            
            activity.Categories = categories;
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
        var result = await _context.Events
                .Include(e => e.Categories)
                .Where(x => x.Id == id)
                .AsNoTracking()
                .ProjectToType<GetEventDTO>()
                .FirstOrDefaultAsync();
        return result;
    }

    public async Task<IEnumerable<GetEventDTO>> GetEventsAsync()
    {
        IEnumerable<GetEventDTO> activitys = await _context.Events
            .Include(e => e.Categories)
            .AsNoTracking()
            .OrderByDescending(e => e.StartAt)
            .ProjectToType<GetEventDTO>()
            .ToListAsync();
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
