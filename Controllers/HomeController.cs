using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Models;

namespace OnlyFriends.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Homepage()
        {
            // 1. สร้างข้อมูล Category และ Owner (ตามที่คุณให้มา)
            var sportsCategory = new Category { Id = 1, CategoryName = "Sports & Fitness" };
            var forceUser = new User
            {
                Id = 67010751,
                Username = "Force 56",
                ProfilePictureUrl = "https://media.nationthailand.com/uploads/images/md/2021/04/NSqRmPs4AruiQ5nqajGR.jpg"
            };

            // 2. สร้างรายการ Event (List<Event>)
            var events = new List<Event>
            {
                // ข้อมูลจากคุณ (WILDER x getfresh)
                new Event
                {
                    Id = 1,
                    Title = "WILDER x getfresh | Valentine’s Edition",
                    Info = "THIS VALENTINE’S DAY — WILDER takes over...",
                    Location = "Cloud 11, Sukhumvit Rd",
                    Capacity = 400,
                    EventType = EnumEventType.Offline,
                    EventStatus = EnumEventStatus.Open,
                    PosterUrl = "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,background=white,quality=75,width=280,height=280/event-covers/18/1e5461fc-3698-4132-a7b6-016e0fad7601.jpg",
                    StartAt = new DateTime(2026, 2, 14, 6, 30, 0),
                    Category = sportsCategory,
                    Owner = forceUser,
                },
                // เพิ่ม Event อื่นๆ เพื่อทดสอบ Timeline
                new Event
                {
                    Id = 2,
                    Title = "Beach Tennis & Ice Bath",
                    Location = "Pura Vida Beach Club",
                    StartAt = new DateTime(2026, 2, 11, 17, 0, 0),
                    PosterUrl = "https://placehold.co/120x120/dcb161/FFF?text=Beach",
                    EventStatus = EnumEventStatus.Closed,
                    Owner = new User { Username = "Dylan" },
                }
            };

            // 3. เรียงลำดับตามเวลาและส่งไปที่ View
            var sortedEvents = events.OrderBy(x => x.StartAt).ToList();
            return View(sortedEvents);
        }
    }
}