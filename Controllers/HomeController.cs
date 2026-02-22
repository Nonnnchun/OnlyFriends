using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;
using OnlyFriends.Services;
using OnlyFriends.Models.DTOS.EventDTOS;

namespace OnlyFriends.Controllers
{
    public class HomeController : Controller
    {
        private readonly IEventService _activityService;
        public HomeController(IEventService activityService)
        {
            _activityService = activityService;
        }

        public async Task<IActionResult> Homepage()
        {
            IEnumerable<GetEventDTO> activities = await _activityService.GetEventsAsync();
            return View(activities);
        }
    }
}