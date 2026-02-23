using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;
using OnlyFriends.ApiControllers;
using OnlyFriends.Models.DTOS.EventDTOS;
using OnlyFriends.Services;


namespace OnlyFriends.Controllers
{
    public class EventController : Controller
        {
            private readonly IEventService _activityService;
            public EventController(IEventService activityService)
            {
                _activityService = activityService;
            }

            [HttpGet("/event/view/{id:int}")]
            public async Task<IActionResult> EventDetails(int id)
            {
                IEnumerable<GetEventDTO> activities = await _activityService.GetEventsAsync();
                return View("EventDetails", activities.FirstOrDefault(a => a.Id == id));
            }
        }
    }