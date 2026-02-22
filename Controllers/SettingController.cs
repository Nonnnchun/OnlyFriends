using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Data;
using OnlyFriends.Models.DTOS.UserDTOS;
using System.Linq;

namespace OnlyFriends.Controllers
{
    public class SettingController : Controller
    {
        private readonly ApplicationDbContext _context;

        public SettingController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            // Fetch User ID 1 
            var user = _context.Users.FirstOrDefault(u => u.Id == 1);

            if (user == null)
            {
                return NotFound("User not found in database.");
            }

            // Map DB Model to UpdateUserDTO
            var model = new UpdateUserDTO
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Username = user.Username,
                Bio = user.Bio,
                Email = user.Email
            };

            return View("Setting", model);
        }

        [HttpPost]
        public IActionResult UpdateProfile(UpdateUserDTO updatedData)
        {

            var user = _context.Users.FirstOrDefault(u => u.Id == updatedData.Id);

            if (user != null)
            {
                user.FirstName = updatedData.FirstName;
                user.LastName = updatedData.LastName;
                user.Username = updatedData.Username;
                user.Bio = updatedData.Bio;

                _context.SaveChanges();
            }

            return RedirectToAction("Index", "Profile");
        }
    }
}