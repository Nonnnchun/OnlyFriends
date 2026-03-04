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
                ViewBag.RegisterSuccess = true;
                return View("Register", new CreateUserDTO
                {
                    Username = string.Empty,
                    FirstName = string.Empty,
                    LastName = string.Empty,
                    Email = string.Empty,
                    Password = string.Empty,
                    Bio = string.Empty
                });
            }
            catch (UniqueConstraintException)
            {
                // เผื่อกรณี race condition กับ unique index ในฐานข้อมูล
                ModelState.AddModelError(string.Empty, "ข้อมูลผู้ใช้ซ้ำในระบบ กรุณาลองใหม่อีกครั้ง");
                return View("Register", userToCreate);
            }
        }
    }
}