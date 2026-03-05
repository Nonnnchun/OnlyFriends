using EntityFramework.Exceptions.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlyFriends.Data;
using OnlyFriends.Models.DTOS.UserDTOS;
using OnlyFriends.Services;

namespace OnlyFriends.Controllers.Api
{
    [Route("register")]
    public class RegisterController : Controller
    {
        private readonly IUserService _userService;

        private readonly ApplicationDbContext _context;

        public RegisterController(IUserService userService, ApplicationDbContext context, ILogger<RegisterController> logger)
        {
            _userService = userService;
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet("")]
        public async Task<IActionResult> Register()
        {
            return View("Register");
        }

        [AllowAnonymous]
        [HttpPost("")]
        public async Task<IActionResult> Register(CreateUserDTO userToCreate)
        {
            if (!ModelState.IsValid)
            {
                return View("Register", userToCreate);
            }

            // 1) Check for duplicate username
            if (await _context.Users.AnyAsync(u => u.Username == userToCreate.Username))
            {
                ModelState.AddModelError("Username", "Username นี้ถูกใช้แล้ว");
            }

            // 2) Check for duplicate email
            if (await _context.Users.AnyAsync(u => u.Email == userToCreate.Email))
            {
                ModelState.AddModelError("Email", "Email นี้ถูกใช้แล้ว");
            }

            if (!ModelState.IsValid)
            {
                return View("Register", userToCreate);
            }

            try
            {
                await _userService.AddUserAsync(userToCreate);
                return RedirectToAction("Index", "Login");
            } 
            catch (UniqueConstraintException ex)
            {
                var property = ex.ConstraintProperties.FirstOrDefault() ?? string.Empty;
                ModelState.AddModelError(property, $"{property} is already taken.");
                return View("Register", userToCreate);
            }
        }
    }
}