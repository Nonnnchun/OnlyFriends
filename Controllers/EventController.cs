using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;
using OnlyFriends.ApiControllers;

namespace OnlyFriends.Controllers
{
    public class EventController : Controller
    {
        [Route("/event/view/{id}")]
        public IActionResult EventDetails()
        {

            return View("Details");
        }
    }
}