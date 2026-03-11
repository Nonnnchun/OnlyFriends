using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

// using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Services;
using OnlyFriends.Models.DTOS.EventDTOS;
using Mapster;
using OnlyFriends.Models;

namespace OnlyFriends.ApiControllers
{
    [Route("/api/event")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly IEventService _activityService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<EventController> _logger;

        public EventController(IEventService activityService, INotificationService notificationService, ILogger<EventController> logger)
        {
            _activityService = activityService;
            _notificationService = notificationService;
            _logger = logger;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddEventAsync(CreateEventDTO activityToCreate)
        {
            try
            {
                var activity = await _activityService.AddEventAsync(activityToCreate);
                return Ok(activity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
        
        // Kaka Please do it. fuck
        // [HttpPost]
        // [ValidateAntiForgeryToken]
        // public IActionResult SendInvites([FromBody] InviteRequest req)
        // {
        //     // req.EventId, req.UserIds, req.Message
        //     return Json(new { success = true });
        // }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEventAsync(int id, UpdateEventDTO activityToUpdate)
        {
            if (id != activityToUpdate.Id)
            {
                return BadRequest($"id in parameter and id in body is different. id in parameter: {id}, id in body: {activityToUpdate.Id}");
            }
            try
            {
                GetEventDTO? activity = await _activityService.FindEventByIdAsync(id);
                if (activity == null)
                {
                    return NotFound();
                }
                await _activityService.UpdateEventAsync(activityToUpdate);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

         [Authorize]
         [HttpPost("{eventId}/join")]
         public async Task<IActionResult> JoinNow(int eventId, [FromBody] int userId)
         {
             try
             {
                var eventDto = await _activityService.FindEventByIdAsync(eventId);
                if (eventDto == null)
                    return NotFound("Event not found");

                if (eventDto.JointType == EnumJointType.Private)
                {
                    await _activityService.AddUserToEvent(new AddUserToEventDTO
                    {
                        EventId = eventId,
                        UserId = userId,
                        RequestStatus = EnumRequestStatus.Pending
                    });

                    // Notify the event owner about the join request
                    var requesterUsername = User.Identity?.Name ?? $"User#{userId}";
                    await _notificationService.AddJoinRequestNotificationAsync(
                        eventDto.Owner.Id, userId, requesterUsername, eventDto.Title, eventId);

                    return Ok(new { message = "Join request sent. Waiting for owner approval." });
                }
                else
                {
                    await _activityService.AddUserToEvent(new AddUserToEventDTO
                    {
                        EventId = eventId,
                        UserId = userId,
                        RequestStatus = EnumRequestStatus.Accepted
                    });
                    return Ok(new { message = "Joined successfully" });
                }
             }
             catch (Exception ex)
             {
                _logger.LogError(ex, ex.Message);
                return StatusCode(500, ex.Message);
             }
         }

         [Authorize]
         [HttpPost("{eventId}/accept/{userId}")]
         public async Task<IActionResult> AcceptJoinRequest(int eventId, int userId)
         {
             try
             {
                var eventDto = await _activityService.FindEventByIdAsync(eventId);
                if (eventDto == null)
                    return NotFound("Event not found");

                await _activityService.AcceptJoinRequest(eventId, userId);
                return Ok(new { message = "Join request accepted" });
             }
             catch (KeyNotFoundException ex)
             {
                return NotFound(ex.Message);
             }
             catch (Exception ex)
             {
                _logger.LogError(ex, ex.Message);
                return StatusCode(500, ex.Message);
             }
         }
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventByIdAsync(int id)
        {
            try
            {
                GetEventDTO? activity = await _activityService.FindEventByIdAsync(id);
                if (activity == null)
                {
                    return NotFound();
                }
                return Ok(activity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetEventsAsync([FromQuery] string? categoryIds = null)
        {
            try
            {
                var ids = ParseCategoryIds(categoryIds);
                IEnumerable<GetEventDTO> activities = await _activityService.GetEventsAsync(ids.Count > 0 ? ids : null);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        private static List<int> ParseCategoryIds(string? categoryIds)
        {
            if (string.IsNullOrWhiteSpace(categoryIds)) return new List<int>();
            return categoryIds
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(s => int.TryParse(s, out int id) ? id : (int?)null)
                .Where(id => id.HasValue)
                .Select(id => id!.Value)
                .Distinct()
                .ToList();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteByIdAsync(int id)
        {
            try
            {
                GetEventDTO? activity = await _activityService.FindEventByIdAsync(id);
                if (activity == null)
                {
                    return NotFound();
                }
                await _activityService.DeleteEventAsync(activity.Adapt<Event>());
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}