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
    Task AddParticipantManualAsync(AddUserToEventDTO userEventToAdd);
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

        // Get Category object
        activity.Category = await _context.Categories.FindAsync(activity.CategoryId)
        ?? throw new KeyNotFoundException($"Category with ID {activityToCreate} does not exist!");

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
        Event? activity = await _context.Events.Where(x => x.Id == id).AsNoTracking().FirstOrDefaultAsync();
        if (activity == null)
        {
            return null;
        }
        return activity.Adapt<GetEventDTO>();
    }

    public async Task<IEnumerable<GetEventDTO>> GetEventsAsync()
    {
        IEnumerable<GetEventDTO> activitys = await _context.Events
            .AsNoTracking()
            .OrderByDescending(e => e.StartAt)
            .Select(e => new GetEventDTO
            {
                Id = e.Id,
                Title = e.Title,
                Info = e.Info,
                Location = e.Location,
                EventType = e.EventType,
                EventStatus = e.EventStatus,
                JointType = e.JointType,
                Capacity = e.Capacity,
                PosterUrl = e.PosterUrl,
                StartAt = e.StartAt,
                EndAt = e.EndAt,
                TimeZone = e.TimeZone,
                Latitude = e.Latitude,
                Longitude = e.Longitude,
                Users = new List<User>(),
                UserEvents = e.UserEvents.Select(ue => new UserEvent
                {
                    UserId = ue.UserId,
                    EventId = ue.EventId,
                    RequestStatus = ue.RequestStatus
                }).ToList(),
                Owner = new Models.DTOS.UserDTOS.GetUserDTO
                {
                    Id = e.Owner.Id,
                    Username = e.Owner.Username,
                    FirstName = e.Owner.FirstName,
                    LastName = e.Owner.LastName,
                    ProfilePictureUrl = e.Owner.ProfilePictureUrl,
                    Bio = e.Owner.Bio,
                    Email = e.Owner.Email,
                    Password = e.Owner.Password,
                    Events = new List<Event>()
                },
                Category = new Models.DTOS.CategoryDTOS.GetCategoryDTO
                {
                    Id = e.Category.Id,
                    CategoryName = e.Category.CategoryName
                }
            })
            .ToListAsync();
        return activitys;
    }

    public async Task UpdateEventAsync(UpdateEventDTO activityToUpdate)
    {
        var activity = await _context.Events.FindAsync(activityToUpdate.Id);
        if (activity == null)
        {
            return;
        }
        activityToUpdate.Adapt(activity);
        await _context.SaveChangesAsync();
    }

    // TODO:
    public async Task AddUserToEvent(AddUserToEventDTO userEventToAdd)
    {
        //Event activity = _context.Events.Where(e => userEventToAdd.EventId == e.Id)
    }

    public async Task AddParticipantManualAsync(AddUserToEventDTO userEventToAdd)
    {
        var ue = await _context.UserEvents
        .FirstOrDefaultAsync(x => x.EventId == userEventToAdd.EventId && x.UserId == userEventToAdd.UserId);

        if (ue == null)
        {
            _context.UserEvents.Add(new UserEvent
            {
                EventId = userEventToAdd.EventId,
                UserId = userEventToAdd.UserId,
                RequestStatus = EnumRequestStatus.Pending
            });
        }
        else
        {
            ue.RequestStatus = EnumRequestStatus.Pending;
        }

        await _context.SaveChangesAsync();
    }
}
