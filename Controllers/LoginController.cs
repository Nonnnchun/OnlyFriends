using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using OnlyFriends.Data;

namespace OnlyFriends.Controllers
{
    [AllowAnonymous]
    [Route("login")]
    public class LoginController : Controller
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly ILogger<LoginController> _logger;

        public LoginController(ApplicationDbContext db, IConfiguration config, ILogger<LoginController> logger)
        {
            _db = db;
            _config = config;
            _logger = logger;
        }

        [HttpGet("")]
        public IActionResult Index()
        {
            ViewData["HideNavbar"] = true;
            return View();
        }

        [HttpPost("")]
        public async Task<IActionResult> Index(string identifier, string password)
        {
            var id = identifier;
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => (u.Email == id || u.Username == id) && u.Password == password);
            if (user == null)
            {
                ViewData["HideNavbar"] = true;
                ModelState.AddModelError("", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
                return View();
            }

            var issuer = _config["Jwt:Issuer"] ?? "OnlyFriends";
            var audience = _config["Jwt:Audience"] ?? "OnlyFriends";
            var key = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(key))
            {
                key = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
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
            var token = new JwtSecurityToken(issuer, audience, claims, expires: expires, signingCredentials: creds);
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Expires = expires,
                Path = "/"
            };
            Response.Cookies.Append("AuthToken", tokenString, cookieOptions);
            return RedirectToAction("Homepage", "Home");
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("AuthToken", new CookieOptions { Path = "/" });
            return Redirect("/login");
        }
    }
}
