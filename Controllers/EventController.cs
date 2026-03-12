using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;
using OnlyFriends.ApiControllers;
using OnlyFriends.Models.DTOS.EventDTOS;
using OnlyFriends.Services;
using Microsoft.AspNetCore.Authorization;
using EntityFramework.Exceptions.Common;
using System.Security.Claims;
using Mapster;



namespace OnlyFriends.Controllers
{
    public class EventController : Controller
    {
        private readonly IEventService _activityService;
        private readonly ICategoryService _categoryService;
        private readonly INotificationService _notificationService;
        private readonly IUserService _userService;
        private readonly ILogger<EventController> _logger;

        public EventController(IEventService activityService, ICategoryService categoryService, INotificationService notificationService, IUserService userService, ILogger<EventController> logger)
        {
            _activityService = activityService;
            _categoryService = categoryService;
            _notificationService = notificationService;
            _userService = userService;
            _logger = logger;
        }


        [Route("/event/view/{id}")]
        public async Task<IActionResult> Details(int id)
        {
            IEnumerable<GetEventDTO> activities = await _activityService.GetEventsAsync();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim != null && int.TryParse(userIdClaim, out var userId))
            {
                var friends = await _userService.GetFriendsAsync(userId);
                ViewData["Friends"] = friends;
            }
            return View("Details", activities.FirstOrDefault(a => a.Id == id));
        }

        [Route("/event/manage/{id}")]
        public async Task<IActionResult> ManageDetails(int id)
        {
            try
            {
                var activity = await _activityService.FindEventByIdAsync(id);
                if (activity == null)
                {
                    return NotFound("Event not found!");
                }
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
if (string.IsNullOrEmpty(userIdClaim))
    return Unauthorized("User not authenticated");
var userId = Int32.Parse(userIdClaim);
                if (userId != activity.Owner.Id)
                {
                    return Unauthorized("Only owner can edit this event!");
                }
                var friends = await _userService.GetFriendsAsync(userId);
                ViewData["Friends"] = friends;
                return View("ManageDetails", activity);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize]
        [HttpPut("event/manage/{id}")]
        public async Task<IActionResult> Update(int id,[FromBody] UpdateEventDTO activityToUpdate)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(activityToUpdate);
            }
            var activity = await _activityService.FindEventByIdAsync(id);
            if (activity == null)
            {
                return NotFound("Event not found!");
            }
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
if (string.IsNullOrEmpty(userIdClaim))
    return Unauthorized("User not authenticated");
var userId = Int32.Parse(userIdClaim);
            if (userId != activity.Owner.Id)
            {
                return Unauthorized("Only owner can update this event!");
            }

            await _activityService.UpdateEventAsync(activityToUpdate);
            // return NotFound(activityToUpdate);
            // return RedirectToAction("Homepage", "Home");
            return Ok();


        }

        [Authorize]
        [HttpPost("/event/join/{eventId}")]
        public async Task<IActionResult> JoinActivity(int eventId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var activity = await _activityService.FindEventByIdAsync(eventId);
            var isDeadlinePassed = activity.RegistrationDeadline.HasValue &&
                                   activity.RegistrationDeadline.Value <= DateTime.UtcNow;
            if (isDeadlinePassed)
            {
                if (activity.EventStatus != EnumEventStatus.Closed)
                {
                    await _activityService.ToggleRegistrationAsync(eventId, false);
                }
                return Conflict("Registration deadline has passed");
            }

            var acceptedCount = activity.UserEvents.Count(ue => ue.RequestStatus == EnumRequestStatus.Accepted);
            var isCapacityFull = activity.Capacity > 0 && acceptedCount >= activity.Capacity;
            if (userId == activity.Owner.Id)
            {
                return BadRequest("You cant join your own event!");
            }
            else if (activity.EventStatus == EnumEventStatus.Closed || isCapacityFull)
            {
                return Conflict("This event is not accepting new participants");
            }

            if (activity.JointType == EnumJointType.Private)
            {
                await _activityService.AddUserToEvent(new AddUserToEventDTO
                {
                    UserId = userId,
                    EventId = eventId,
                    RequestStatus = EnumRequestStatus.Pending
                });
                var requesterUsername = User.FindFirst(ClaimTypes.Name)?.Value ?? $"User#{userId}";
                await _notificationService.AddJoinRequestNotificationAsync(
                    activity.Owner.Id, userId, requesterUsername, activity.Title, eventId);
                return Ok(new { message = "Join request sent. Waiting for owner approval." });
            }
            else
            {
                await _activityService.AddUserToEvent(new AddUserToEventDTO
                {
                    UserId = userId,
                    EventId = eventId,
                    RequestStatus = EnumRequestStatus.Accepted
                });
                return Ok(new { message = "Joined successfully" });
            }
        }

        [Authorize]
        [HttpPost("/event/accept/{eventId}/{userId}")]
        public async Task<IActionResult> AcceptJoinRequest(int eventId, int userId)
        {
            try
            {
                var activity = await _activityService.FindEventByIdAsync(eventId);
                if (activity == null)
                    return NotFound("Event not found");

                var ownerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                if (ownerId != activity.Owner.Id)
                    return Unauthorized("Only the event owner can accept join requests");

                var acceptedCount = activity.UserEvents.Count(ue => ue.RequestStatus == EnumRequestStatus.Accepted);
                var isCapacityFull = activity.Capacity > 0 && acceptedCount >= activity.Capacity;
                if (isCapacityFull)
                    return Conflict("Event is already full");

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
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize]
        [HttpDelete("/event/join/{eventId}")]
        public async Task<IActionResult> CancelJoin(int eventId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _activityService.CancelJoinEvent(userId, eventId);
            await _notificationService.DeleteJoinRequestNotificationAsync(userId, eventId);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            var categories = await _categoryService.GetCategoriesAsync();
            ViewData["Categories"] = categories;
            return View();
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEventDTO activityToCreate)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
if (string.IsNullOrEmpty(userIdClaim))
    return Unauthorized("User not authenticated");
var userId = Int32.Parse(userIdClaim);
                // Normalize incoming datetime values to UTC.
                // If client sends "unspecified" kind, treat it as local server time first.
                static DateTime ToUtc(DateTime dt) => dt.Kind switch
                {
                    DateTimeKind.Utc => dt,
                    DateTimeKind.Local => dt.ToUniversalTime(),
                    _ => DateTime.SpecifyKind(dt, DateTimeKind.Local).ToUniversalTime()
                };

                activityToCreate.StartAt = ToUtc(activityToCreate.StartAt);
                activityToCreate.EndAt = ToUtc(activityToCreate.EndAt);
                if (activityToCreate.RegistrationDeadline.HasValue)
                {
                    activityToCreate.RegistrationDeadline = ToUtc(activityToCreate.RegistrationDeadline.Value);
                    if (activityToCreate.RegistrationDeadline.Value < DateTime.UtcNow)
                    {
                        return BadRequest("Registration deadline cannot be in the past");
                    }
                    if (activityToCreate.RegistrationDeadline.Value > activityToCreate.StartAt)
                    {
                        return BadRequest("Registration deadline cannot be after the event starts");
                    }
                }
                activityToCreate.OwnerId = userId;
                await _activityService.AddEventAsync(activityToCreate);
                return Json(new {redirectUrl = Url.Action("Homepage", "Home")});
            }
            catch (UniqueConstraintException ex)
            {
                ModelState.AddModelError(ex.ConstraintName, ex.ConstraintProperties[0]);

                return View("Homepage", "Home");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create event");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("/Event/ToggleRegistration")]
        public async Task<IActionResult> ToggleRegistration([FromBody] ToggleRegistrationDTO dto)
        {
            try
            {
                var activity = await _activityService.FindEventByIdAsync(dto.Id);
                if (activity == null) return NotFound("Event not found");
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                if (userId != activity.Owner.Id) return Unauthorized("Only the event owner can do this");
                await _activityService.ToggleRegistrationAsync(dto.Id, dto.IsOpen);

                // When closing a private event, notify all pending users they weren't accepted
                if (!dto.IsOpen && activity.JointType == EnumJointType.Private)
                {
                    var pendingUserIds = activity.UserEvents
                        .Where(ue => ue.RequestStatus == EnumRequestStatus.Pending)
                        .Select(ue => ue.UserId);

                    foreach (var pendingUserId in pendingUserIds)
                    {
                        await _notificationService.AddParticipantStatusNotificationAsync(
                            pendingUserId, activity.Title, "Rejected", dto.Id);
                    }
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("/Event/UpdateVisibility")]
        public async Task<IActionResult> UpdateVisibility([FromBody] UpdateVisibilityDTO dto)
        {
            try
            {
                var activity = await _activityService.FindEventByIdAsync(dto.EventId);
                if (activity == null) return NotFound("Event not found");
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                if (userId != activity.Owner.Id) return Unauthorized("Only the event owner can do this");
                await _activityService.UpdateVisibilityAsync(dto.EventId, dto.IsPublic);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("/Event/UpdateParticipantStatus")]
        public async Task<IActionResult> UpdateParticipantStatus([FromBody] UpdateParticipantStatusDTO dto)
        {
            try
            {
                var activity = await _activityService.FindEventByIdAsync(dto.EventId);
                if (activity == null) return NotFound("Event not found");
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                if (userId != activity.Owner.Id) return Unauthorized("Only the event owner can do this");

                var status = dto.Status switch
                {
                    "Accepted" => EnumRequestStatus.Accepted,
                    "Rejected" => EnumRequestStatus.Rejected,
                    _ => EnumRequestStatus.Pending
                };
                await _activityService.UpdateParticipantStatusAsync(dto.EventId, dto.UserId, status);
                
                if (status == EnumRequestStatus.Accepted || status == EnumRequestStatus.Rejected)
                {
                    await _notificationService.AddParticipantStatusNotificationAsync(dto.UserId, activity.Title, status.ToString(), dto.EventId);
                }

                return Ok(new { success = true });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("/Event/SendInvites")]
        public async Task<IActionResult> SendInvites([FromBody] SendInvitesDTO dto)
        {
            try
            {
                var activity = await _activityService.FindEventByIdAsync(dto.EventId);
                if (activity == null) return NotFound("Event not found");
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                var inviterUsername = User.FindFirst(ClaimTypes.Name)?.Value ?? $"User#{userId}";
                foreach (var invitedUserId in dto.UserIds)
                {
                    await _notificationService.AddEventInviteNotificationAsync(
                        invitedUserId, userId, inviterUsername, activity.Title, dto.EventId);
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("/Event/AddHost")]
        public IActionResult AddHost()
        {
            return StatusCode(501, new { message = "Host feature coming soon" });
        }

    }
}
