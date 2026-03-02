using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;
using Microsoft.AspNetCore.Authorization;
using OnlyFriends.Services;
using OnlyFriends.Models.DTOS.EventDTOS;
using System.Diagnostics;

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

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}