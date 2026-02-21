using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;

namespace OnlyFriends.Controllers
{
    public class EventController : Controller
    {
        public IActionResult EventDetails()
    {
       
        return View("Details");
    }
    }
}