using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using onlyfriends.Models; // อย่าลืมบรรทัดนี้ เพื่อเรียกใช้ Model

namespace Homepage.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Homepage()
    {
        // 1. สร้างรายการข้อมูลจำลอง (ในอนาคตส่วนนี้จะดึงจาก Database)
        var events = new List<EventItem>
        {
            new EventItem
            {
                Id = 1,
                Title = "Cursor from Zero Bangkok",
                Time = "20:00",
                DateText = "15 ก.พ. วันพุธ",
                Organizer = "Luis Romero",
                Location = "Krung Thep Maha Nakhon",
                ParticipantCount = 70,
                ImageUrl = "https://placehold.co/120x120/111/FFF?text=Cursor",
                SortData = new DateTime(2024,2,15,20,0,0),
                IsActive = true

            },
            new EventItem
            {
                Id = 2,
                Title = "Beach Tennis & Ice Bath",
                Time = "19:00",
                DateText = "11 ก.พ. วันพุธ",
                Organizer = "Dylan Mouthaan",
                Location = "Pura Vida Beach Club",
                ParticipantCount = 18,
                ImageUrl = "https://placehold.co/120x120/dcb161/FFF?text=Beach",
                SortData = new DateTime(2024,2,11,19,0,0),
                IsActive = false
            },
             new EventItem
            {
                Id = 3,
                Title = "Mindful Leadership",
                Time = "16:20",
                DateText = "12 ก.พ. วันพฤหัสบดี",
                Organizer = "Lead+D Lab",
                Location = "อาคารไชยยศสมบัติ ๑",
                ParticipantCount = 50,
                ImageUrl = "https://placehold.co/120x120/004aad/FFF?text=Leader",
                SortData = new DateTime(2024,2,12,16,20,0),
                IsActive = true
            }
        };
        var sortedEvents = events.OrderBy(x => x.SortData).ToList();

        // 2. ส่งข้อมูล events ไปที่ View
        return View(sortedEvents);
    }

    public IActionResult Createactivity()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

