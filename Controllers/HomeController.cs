using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using onlyfriends.Models;

namespace onlyfriends.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        public IActionResult Profile()
        {
            return View();
        }

        public IActionResult Setting()
        {
            // replace it with something use to find user logged in ID via database
            var user = new User
            {
                Username = "DemonineZ",
                FirstName = "John",
                LastName = "Doe",
                Bio = "Greeting everyone",
                Email = "teepob.1569@gmail.com"
            };

            return View(user);
        }
        
    }
}
