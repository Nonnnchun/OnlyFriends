using Mapster;
using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models.DTOS.UserDTOS;
using OnlyFriends.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IO;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace OnlyFriends.Controllers
{
    [Route("setting")] 
    public class SettingController : Controller
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _config;
        public SettingController(IUserService userService, IConfiguration config)
        {
            _userService = userService;
            _config = config;
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
                    return Redirect("/login");
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

                // รีเฟรช JWT ให้สะท้อน username / picture ล่าสุด โดยไม่ต้องล็อกเอาต์
                var user = await _userService.FindUserByIdAsync(userId);
                if (user != null)
                {
                    var issuer = _config["Jwt:Issuer"] ?? "OnlyFriends";
                    var audience = _config["Jwt:Audience"] ?? "OnlyFriends";
                    var key = _config["Jwt:Key"] ?? Convert.ToBase64String(Encoding.UTF8.GetBytes("OnlyFriendsTempKey1234567890"));
                    var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
                    var claimsList = new List<Claim>
                    {
                        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                        new Claim(JwtRegisteredClaimNames.UniqueName, user.Username ?? ""),
                        new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                        new Claim(ClaimTypes.Name, user.Username ?? ""),
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
                    };
                    if (!string.IsNullOrWhiteSpace(user.ProfilePictureUrl))
                    {
                        claimsList.Add(new Claim("picture", user.ProfilePictureUrl));
                    }
                    var token = new JwtSecurityToken(
                        issuer: issuer,
                        audience: audience,
                        claims: claimsList.ToArray(),
                        expires: DateTime.UtcNow.AddHours(1),
                        signingCredentials: creds
                    );
                    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
                    Response.Cookies.Append("AuthToken", tokenString, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = Request.IsHttps,
                        SameSite = SameSiteMode.Lax,
                        Expires = DateTime.UtcNow.AddHours(1),
                        Path = "/"
                    });
                }

                return RedirectToAction("Index");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
