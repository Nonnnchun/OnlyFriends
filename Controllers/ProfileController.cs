using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using onlyfriends.Models;

namespace onlyfriends.Controllers
{
    public class ProfileController : Controller
    {
        public IActionResult Index()
        {
            return View("Profile"); // Views/Profile/Profile.cshtml
        }
    }
}