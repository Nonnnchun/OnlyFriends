using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using onlyfriends.Models;

namespace onlyfriends.Controllers
{
    public class SettingController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            // Temporary mock user until database is added
            var user = new User
            {
                Username = "DemonineZ",
                FirstName = "John",
                LastName = "Doe",
                Bio = "Greeting everyone",
                Email = "teepob.1569@gmail.com"
            };

            return View("Setting", user); // Views/Setting/Setting.cshtml
        }

        [HttpPost]
        public IActionResult SaveAccountSettings(User model)
        {
            // TODO: Replace with real database update later

            TempData["SuccessMessage"] = "Changes saved successfully (temporary).";

            return RedirectToAction("Index");
        }
    }
}