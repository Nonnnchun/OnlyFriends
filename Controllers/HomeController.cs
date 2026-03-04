using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;
using Microsoft.AspNetCore.Authorization;
using OnlyFriends.Services;
using OnlyFriends.Models.DTOS.EventDTOS;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using OnlyFriends.Models.ViewModels;

namespace OnlyFriends.Controllers
{
    public class HomeController : Controller
    {
        private readonly IEventService _activityService;
        public HomeController(IEventService activityService)
        {
            _activityService = activityService;
        }

        public IActionResult CreateActivity()
        {
            return RedirectToAction("Create", "Event");
        }

        public async Task<IActionResult> Homepage(string tab = "all")
        {
            IEnumerable<GetEventDTO> activities = await _activityService.GetEventsAsync();
            int? currentUserId = GetCurrentUserId();
            string activeTab = tab.Equals("my", StringComparison.OrdinalIgnoreCase) ? "my" : "all";

            IEnumerable<GetEventDTO> joinedEvents = [];
            if (currentUserId.HasValue)
            {
                joinedEvents = activities.Where(e => e.UserEvents.Any(ue =>
                    ue.UserId == currentUserId.Value &&
                    ue.RequestStatus != EnumRequestStatus.Rejected));
            }

            var vm = new HomepageViewModel
            {
                AllEvents = activities,
                JoinedEvents = joinedEvents,
                ActiveTab = activeTab
            };

            return View(vm);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        private int? GetCurrentUserId()
        {
            string? claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (int.TryParse(claimValue, out int userId))
            {
                return userId;
            }

            return null;
        }
    }
}
