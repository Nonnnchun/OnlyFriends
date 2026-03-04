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
        private readonly ILogger<EventController> _logger;

        public EventController(IEventService activityService, ICategoryService categoryService, ILogger<EventController> logger)
        {
            _activityService = activityService;
            _categoryService = categoryService;
            _logger = logger;
        }


        [Route("/event/view/{id}")]
        public async Task<IActionResult> EventDetails(int id)
        {
            IEnumerable<GetEventDTO> activities = await _activityService.GetEventsAsync();
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
                var userId = Int32.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                if (userId != activity.Owner.Id)
                {
                    return Unauthorized("Only owner can edit this event!");
                }
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
            var userId = Int32.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
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
            await _activityService.AddUserToEvent(new AddUserToEventDTO { UserId = userId, EventId = eventId });
            return Ok();
        }

        [Authorize]
        [HttpDelete("/event/join/{eventId}")]
        public async Task<IActionResult> CancelJoin(int eventId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _activityService.CancelJoinEvent(userId, eventId);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            ViewData["Categories"] = await _categoryService.GetCategoriesAsync();
            return View();
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEventDTO activityToCreate)
        {
            try
            {
                var userId = Int32.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                // Convert kind to UTC to fix database error (IDK)
                activityToCreate.StartAt = DateTime.SpecifyKind(activityToCreate.StartAt, DateTimeKind.Utc);
                activityToCreate.EndAt = DateTime.SpecifyKind(activityToCreate.EndAt, DateTimeKind.Utc);
                activityToCreate.OwnerId = userId;
                await _activityService.AddEventAsync(activityToCreate);
                return Json(new {redirectUrl = Url.Action("Homepage", "Home")});
            }
            catch (UniqueConstraintException ex)
            {
                ModelState.AddModelError(ex.ConstraintName, ex.ConstraintProperties[0]);

                return View("Homepage", "Home");
            }
            // catch (KeyNotFoundException ex)
            // {

            //     return View("Login");
            // }
        }

    }
}