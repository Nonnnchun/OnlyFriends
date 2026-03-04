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
            if (string.IsNullOrEmpty(username))
            {
                return RedirectToAction("Homepage", "Home");
            }

            // Allow both "username" and "@username" slugs
            if (username.StartsWith("@"))
            {
                username = username[1..];
            }

            // Find user by Username (case-insensitive)
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());

            if (user == null)
            {
                return NotFound("User not found");
            }

            // Mapping to DTO
            var userDTO = new GetUserDTO
            {
                Id = user.Id,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Bio = user.Bio,
                ProfilePictureUrl = user.ProfilePictureUrl,
                Email = user.Email ?? "", 
                Password = "" 
            };

            // Fetch Events owned by this user
            userDTO.CreatedEvents = await _context.Events
                .Where(e => e.OwnerId == user.Id)
                .ToListAsync();

            // Fetch Events this user joined
            var joinedEvents = await _context.UserEvents
                .Where(ue => ue.UserId == user.Id)
                .Select(ue => ue.Event)
                .ToListAsync();

            ViewBag.JoinedEvents = joinedEvents;

            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            ViewData["CurrentUserId"] = int.TryParse(currentUserIdStr, out var currentUserId) ? currentUserId : 0;
            return View("Profile", userDTO);
        }
    }
}