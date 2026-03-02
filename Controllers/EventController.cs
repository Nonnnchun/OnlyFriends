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
        private readonly ILogger<EventController> _logger;

        public EventController(IEventService activityService, ILogger<EventController> logger)
        {
            _activityService = activityService;
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
            // try
            // {
            //     var activity = await _activityService.FindEventByIdAsync(id);
            //     if (activity == null)
            //     {
            //         return NotFound("Event not found!");
            //     }
                // var userId = Int32.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                // if (userId != activity.Owner.Id)
                // {
                //     return Unauthorized("Only owner can edit this event!");
                // }
            //     return View("ManageDetails", activity);
            // }
            // catch (Exception ex)
            // {
            //     return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            // }
            var activity = await _activityService.FindEventByIdAsync(id);
            if (activity == null) return View("Homepage", "Home");
            return View("ManageDetails", activity);
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            return View();
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEventDTO activityToCreate)
        {
            try
            {
                // Convert kind to UTC to fix database error (IDK)
                activityToCreate.StartAt = DateTime.SpecifyKind(activityToCreate.StartAt, DateTimeKind.Utc);
                activityToCreate.EndAt = DateTime.SpecifyKind(activityToCreate.EndAt, DateTimeKind.Utc);
                await _activityService.AddEventAsync(activityToCreate);
                return RedirectToAction("Homepage", "Home");
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