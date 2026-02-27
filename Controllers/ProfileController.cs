using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Data;
using OnlyFriends.Models;
using System.Linq;
using OnlyFriends.Models.DTOS.UserDTOS;
using OnlyFriends.Services;

namespace OnlyFriends.Controllers
{
    [Route("user")]
    public class ProfileController : Controller
    {

        private readonly IUserService _userService;
        public ProfileController(IUserService userService)
        {
            _userService = userService;
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> Index(int id)
        {
            var userDTO = await _userService.FindUserByIdAsync(id);

            if (userDTO == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, "User not found");
            }

            return View("Profile", userDTO);
        }
    }
}