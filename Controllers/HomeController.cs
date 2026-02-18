using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using onlyfriends.Models; // เรียกใช้ Model ของจริง

namespace onlyfriends.Controllers; // เช็ค Namespace ให้ตรงกับโปรเจกต์

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Homepage() // หรือ Index()
    {
        // ✅ สร้าง Mock Data โดยใช้ Class 'Event' ของจริง
        var events = new List<Event>
        {
            new Event
            {
                Id = 1,
                Title = "Cursor from Zero Bangkok",
                // 📅 รวมวันและเวลาไว้ใน EventDate
                EventDate = new DateTime(2024, 2, 15, 20, 0, 0), 
                Location = "Krung Thep Maha Nakhon",
                ImageUrl = "https://placehold.co/120x120/111/FFF?text=Cursor",
                EventStatus = EnumEventStatus.Open, // แทน IsActive = true
                
                // 👤 Mock ข้อมูลคนสร้าง (Owner)
                Owner = new User 
                { 
                    UserName = "Luis Romero" 
                },
                
                // 👥 Mock จำนวนคนเข้าร่วม (ใส่ UserEvent ปลอมๆ เข้าไปใน List)
                // ใส่ไป 20 อัน เพื่อจำลองว่ามีคนสมัคร 20 คน
                // (วิธีลัด: ใช้ Enumerable.Range สร้าง List เปล่าๆ ขึ้นมา)
                UserEvents = new List<UserEvent>(new UserEvent[70]) 
            },
            new Event
            {
                Id = 2,
                Title = "Beach Tennis & Ice Bath",
                EventDate = new DateTime(2024, 2, 11, 19, 0, 0),
                Location = "Pura Vida Beach Club",
                ImageUrl = "https://placehold.co/120x120/dcb161/FFF?text=Beach",
                EventStatus = EnumEventStatus.Closed, // แทน IsActive = false
                
                Owner = new User { UserName = "Dylan Mouthaan" },
                UserEvents = new List<UserEvent>(new UserEvent[18]) // จำลอง 18 คน
            },
             new Event
            {
                Id = 3,
                Title = "Mindful Leadership",
                EventDate = new DateTime(2024, 2, 12, 16, 20, 0),
                Location = "อาคารไชยยศสมบัติ ๑",
                ImageUrl = "https://placehold.co/120x120/004aad/FFF?text=Leader",
                EventStatus = EnumEventStatus.Open,
                
                Owner = new User { UserName = "Lead+D Lab" },
                UserEvents = new List<UserEvent>(new UserEvent[50]) // จำลอง 50 คน
            }
        };

        // ✅ สั่งเรียงลำดับตามวันที่ (น้อย -> มาก)
        var sortedEvents = events.OrderBy(x => x.EventDate).ToList();

        // ส่งข้อมูลไปที่ View
        return View(sortedEvents);
    }

    public IActionResult CreateActivity()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}