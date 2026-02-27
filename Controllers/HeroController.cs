using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;

namespace OnlyFriends.Controllers
{
    public class HeroController : Controller
    {
        public IActionResult Heropage()
        {
            
            return View();
        }
    }
}