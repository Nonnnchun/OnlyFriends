using Microsoft.AspNetCore.Mvc;

namespace Login.Controllers
{
   public class LoginController : Controller
   {
      public IActionResult Index()
      {
         return View();
      }
   }
}