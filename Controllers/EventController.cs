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


namespace OnlyFriends.Controllers
{
    public class EventController : Controller
        {
            private readonly IEventService _activityService;
            public EventController(IEventService activityService)
            {
                _activityService = activityService;
            }

        [Route("/event/view/{id}")]
        public async Task<IActionResult> EventDetails(int id)
        {
            IEnumerable<GetEventDTO> activities = await _activityService.GetEventsAsync();
            return View("Details",activities.FirstOrDefault(a => a.Id == id));
        }

        [Route("/event/manage/{id}")]
        public async Task<IActionResult> ManageDetails(int id)
        {
            var activity = await _activityService.FindEventByIdAsync(id);
            if (activity == null) return NotFound();
            return View("ManageDetails",activity);
        }
        public IActionResult Create()
        {
            return View();
        }
    }
}