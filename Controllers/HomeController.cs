using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;
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

        public async Task<IActionResult> Homepage(string tab = "all", string? categoryIds = null)
        {
            List<int> selectedCategoryIds = ParseCategoryIds(categoryIds);
            IEnumerable<GetEventDTO> activities = await _activityService.GetEventsAsync(selectedCategoryIds)
                                                 ?? Enumerable.Empty<GetEventDTO>();

            int? currentUserId = GetCurrentUserId();
            string activeTab = string.IsNullOrWhiteSpace(tab) ? "all" : tab.ToLower();

            var vm = new HomepageViewModel
            {
                AllEvents = activities,
                JoinedEvents = activities, // let the view filter by uid + status
                ActiveTab = activeTab,
                SelectedCategoryIds = selectedCategoryIds
            };

            return View(vm);
        }

        private int? GetCurrentUserId()
        {
            string? claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");
            if (int.TryParse(claimValue, out int userId)) return userId;
            return null;
        }

        private static List<int> ParseCategoryIds(string? categoryIds)
        {
            if (string.IsNullOrWhiteSpace(categoryIds)) return new List<int>();
            return categoryIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(idText => int.TryParse(idText, out int id) ? id : (int?)null)
                .Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();
        }
    }
}