using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;

namespace OnlyFriends.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Homepage()
        {
            
            return View();
        }
    }
}