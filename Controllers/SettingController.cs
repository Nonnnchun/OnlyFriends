using Mapster;
using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models.DTOS.UserDTOS;
using OnlyFriends.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IO;

namespace OnlyFriends.Controllers
{
    [Route("setting")] 
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
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return RedirectToAction("Login", "Auth");
                }

                var userId = Int32.Parse(userIdClaim);
                var user = await _userService.FindUserByIdAsync(userId);

                if (user == null)
                {
                    return NotFound("User not found.");
                }

                var model = user.Adapt<UpdateUserDTO>();

                return View("Setting", model);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("update")]
        public async Task<IActionResult> UpdateProfile(UpdateUserDTO updatedData)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

                var userId = Int32.Parse(userIdClaim);

                if (userId != updatedData.Id)
                {
                    return Unauthorized();
                }

                // --- NEW IMAGE UPLOAD LOGIC ---
                if (updatedData.ProfilePicture != null && updatedData.ProfilePicture.Length > 0)
                {
                    // 1. Generate a unique name for the file
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(updatedData.ProfilePicture.FileName);
                    
                    // 2. Map to the wwwroot/uploads folder
                    var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

                    // 3. Ensure the folder exists
                    if (!Directory.Exists(uploadPath))
                    {
                        Directory.CreateDirectory(uploadPath);
                    }

                    var filePath = Path.Combine(uploadPath, fileName);

                    // 4. Save the file to the physical folder
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await updatedData.ProfilePicture.CopyToAsync(stream);
                    }

                    // 5. Update the DTO with the web-accessible URL
                    updatedData.ProfilePictureUrl = "/uploads/" + fileName;
                }
                // --- END IMAGE LOGIC ---

                // Pass the updated data (with the new URL) to the service
                await _userService.UpdateUserAsync(updatedData);
                
                return RedirectToAction("Index"); 
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}