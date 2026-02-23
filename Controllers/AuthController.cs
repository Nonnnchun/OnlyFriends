using Microsoft.AspNetCore.Mvc;
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
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);
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
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email)
            };
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
    }
}
