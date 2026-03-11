using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Data;
using OnlyFriends.Models;
using OnlyFriends.Models.DTOS.UserDTOS;
using Microsoft.EntityFrameworkCore;
using OnlyFriends.Services;
using System.Security.Claims;

namespace OnlyFriends.Controllers
{
    // Removed the top-level [Route("user")] to prevent ERR_EMPTY_RESPONSE conflicts
    public class ProfileController : Controller
    {
        private readonly IUserService _userService;
        private readonly ApplicationDbContext _context;

        public ProfileController(IUserService userService, ApplicationDbContext context)
        {
            _userService = userService;
            _context = context;
        }

        // Specific route: /user/{username} or /user/@{username}
        [HttpGet("user/{username}")]
        public async Task<IActionResult> Index(string username)
        {
            if (string.IsNullOrEmpty(username)) return RedirectToAction("Homepage", "Home");

            if (username.StartsWith("@")) username = username[1..];

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());

            if (user == null) return NotFound("User not found");

            var userDTO = new GetUserDTO
            {
                Id = user.Id,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Bio = user.Bio,
                ProfilePictureUrl = user.ProfilePictureUrl,
                Email = user.Email ?? ""
            };

            userDTO.CreatedEvents = await _context.Events
                .Where(e => e.OwnerId == user.Id)
                .ToListAsync();

            var joinedEvents = await _context.UserEvents
                .Where(ue => ue.UserId == user.Id)
                .Select(ue => ue.Event)
                .ToListAsync();

            ViewBag.JoinedEvents = joinedEvents;

            // --- NEW CODE: Fetch Accepted Friends ---
            var friends = await _context.Friendships
                .Where(f => (f.RequesterId == user.Id || f.AddresseeId == user.Id) 
                            && f.Status == FriendshipStatus.Accepted) // Fixed CS0019
                .Select(f => f.RequesterId == user.Id ? f.Addressee : f.Requester)
                .ToListAsync();

            // 2. Ensure the list isn't null to satisfy the compiler
            ViewBag.Friends = friends ?? new List<OnlyFriends.Models.User>();
            // ----------------------------------------

            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            ViewData["CurrentUserId"] = int.TryParse(currentUserIdStr, out var currentUserId) ? currentUserId : 0;

            if (currentUserId != 0 && currentUserId != user.Id)
            {
                var friendship = await _context.Friendships.FirstOrDefaultAsync(f =>
                    (f.RequesterId == currentUserId && f.AddresseeId == user.Id) ||
                    (f.RequesterId == user.Id && f.AddresseeId == currentUserId));

                ViewData["FriendshipStatus"] = friendship?.Status.ToString() ?? "None";
                ViewData["FriendshipRequesterId"] = friendship?.RequesterId;
            }

            return View("Profile", userDTO);
        }
    }
}