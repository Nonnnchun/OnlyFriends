using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Data;
using OnlyFriends.Models;
using System.Linq;
using OnlyFriends.Models.DTOS.UserDTOS;

namespace OnlyFriends.Controllers
{
    public class ProfileController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            // Fetch User Id 1
            var user = _context.Users.FirstOrDefault(u => u.Id == 1);

            if (user == null) return NotFound();

            var userDto = new GetUserDTO
            {
                Id = user.Id,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Bio = user.Bio,
                ProfilePictureUrl = user.ProfilePictureUrl
            };

            return View("Profile", userDto);
        }
    }
}