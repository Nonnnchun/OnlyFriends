using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;

namespace OnlyFriends.Controllers
{
    public class HeroController : Controller
    {
        public IActionResult Heropage()
        {
            if (User?.Identity?.IsAuthenticated ?? false)
            {
                return RedirectToAction("Homepage", "Home");
            }

            return View();
        }
    }
}