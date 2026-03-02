using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using OnlyFriends.Data;
using OnlyFriends.Models.DTOs.Auth;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace OnlyFriends.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext db, ILogger<AuthController> logger, IConfiguration config)
        {
            _db = db;
            _logger = logger;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDTO request)
        {
            var identifier = request.Identifier ?? request.Email ?? string.Empty;
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u =>
                (u.Email == identifier || u.Username == identifier) && u.Password == request.Password);
            if (user == null)
            {
                return Unauthorized();
            }

            var issuer = _config["Jwt:Issuer"] ?? "OnlyFriends";
            var audience = _config["Jwt:Audience"] ?? "OnlyFriends";
            var key = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(key))
            {
                if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
                {
                    key = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "JWT key not configured");
                }
            }

            var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
            var claimsList = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };
            if (!string.IsNullOrWhiteSpace(user.ProfilePictureUrl))
            {
                claimsList.Add(new Claim("picture", user.ProfilePictureUrl));
            }
            var claims = claimsList.ToArray();
            var expires = DateTime.UtcNow.AddHours(1);
            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );
            var handler = new JwtSecurityTokenHandler();
            var tokenString = handler.WriteToken(token);
            return Ok(new TokenResponseDTO { Token = tokenString, ExpiresAt = expires });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            // Note: with default inbound claim mapping, "sub" is often mapped to ClaimTypes.NameIdentifier.
            var userIdRaw =
                User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrEmpty(userIdRaw)) return Unauthorized();
            if (!int.TryParse(userIdRaw, out var userId)) return Unauthorized();
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return Unauthorized();
            return Ok(new { id = user.Id, username = user.Username, email = user.Email });
        }
    }
}
