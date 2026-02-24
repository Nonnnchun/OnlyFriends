using Mapster;
using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Data;
using OnlyFriends.Models.DTOS.UserDTOS;
using System.Linq;
using OnlyFriends.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.CodeAnalysis.Scripting.Hosting;
using System.Security.Claims;


namespace OnlyFriends.Controllers
{
    [Route("settings")]
    public class SettingController : Controller
    {
        private readonly IUserService _userService;
        public SettingController(IUserService userService)
        {
            _userService = userService;
        }


        [Authorize]
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            try
            {
                var userId = Int32.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                // Fetch User ID 1 
                var user = await _userService.FindUserByIdAsync(userId);

                if (user == null)
                {
                    return NotFound("User not found in database.");
                }

                // Map DB Model to UpdateUserDTO
                var model = user.Adapt<UpdateUserDTO>();

                return View("Setting", model);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateProfile(UpdateUserDTO updatedData)
        {

            await _userService.UpdateUserAsync(updatedData);

            return RedirectToAction("Index", "Profile");
        }
    }
}