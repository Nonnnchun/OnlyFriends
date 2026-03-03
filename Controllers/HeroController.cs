using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;


namespace OnlyFriends.Controllers
{
    public class HeroController : Controller
    {
        public IActionResult Heropage()
        {
            // Check if the user is already logged in
            if (User != null && User.Identity.IsAuthenticated)
            {
                // Redirect to their dashboard or home page
                return RedirectToAction("Homepage", "Home");
            }
            return View();
        }
    }
}