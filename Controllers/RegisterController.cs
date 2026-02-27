using EntityFramework.Exceptions.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models.DTOS.UserDTOS;
using OnlyFriends.Services;

namespace OnlyFriends.Controllers.Api
{
    [Route("register")]
    public class RegisterController : Controller
    {
        private readonly IUserService _userService;

        public RegisterController(IUserService userService, ILogger<RegisterController> logger)
        {
            _userService = userService;

        }

        [AllowAnonymous]
        [HttpGet("")]
        public async Task<IActionResult> Index()
        {
            return View("Register");
        }

        [AllowAnonymous]
        [HttpPost("")]
        public async Task<IActionResult> Register(CreateUserDTO userToCreate)
        {
            try
            {
                await _userService.AddUserAsync(userToCreate);
                return RedirectToAction("Index", "Login");
            } 
            catch (UniqueConstraintException  ex)
            {
                ModelState.AddModelError(ex.ConstraintName, ex.ConstraintProperties[0]);
                
                return View("Register");
            }

        
        }

    }
}