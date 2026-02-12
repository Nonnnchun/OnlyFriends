using Test.Models;
using Microsoft.AspNetCore.Mvc;

namespace Test.Controllers
{
   public class TestController : Controller
   {
      public IActionResult Index()
      {
         Tester t1 = new Tester();
         t1.Id = 0001;
         t1.Name = "Chern";
         t1.Score = 100;
         // var t2 = new Tester();
         // Tester t3 = new();

         var t2 = new Tester();
         t2.Id = 0002;
         t2.Name = "Chen";
         t2.Score = 80;

         Tester t3 = new();
         t3.Id = 0003;
         t3.Name = "Tester";
         t3.Score = 0;

         List<Tester> allTest = new List<Tester>();
         allTest.Add(t1);
         allTest.Add(t2);
         allTest.Add(t3);

         return View(allTest);
      }
      public IActionResult Usernumber()
      {
         return View();
      }
   }
}