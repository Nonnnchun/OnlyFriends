using Microsoft.AspNetCore.Mvc;
using onlyfriends.Models;

namespace onlyfriends.Controllers 
{

public class EventController : Controller
{
    public IActionResult EventDetails()
    {
        var  Category = new Category
        {
            Id = 1,
            CategoryName = "Sports & Fitness"
        };
        var Owner = new User
        {
            Id = 67010751,
            Username = "Force 56",
            FirstName = "Yokphon",
            LastName = "Ninbarun",
            Bio = "I love Baddies.",
            Email = "67010751@kmitl.ac.th",
            ProfilePictureUrl = "https://media.nationthailand.com/uploads/images/md/2021/04/NSqRmPs4AruiQ5nqajGR.jpg"
            
        };
        var ev = new OnlyFriends.Models.Event
    {
        Id = 1,
        Title = "WILDER x getfresh | Valentine’s Edition",
        Info = "THIS VALENTINE’S DAY — WILDER takes over @cloud11bangkok📍 Cloud 11 5th Floor, Cloud 11 Park BTS Punnawithi Station, Exit 6🗓 Sat, Feb 14 ⏰ 06:30am Registration Equipped by @adidasthailand",
        Location = "Cloud 11\n888 Sukhumvit Rd, Khwaeng Bang Chak, Khet Phra Khanong, Krung Thep Maha Nakhon 10260, Thailand",
        Capacity = 400,
        EventType = OnlyFriends.Models.EnumEventType.Offline,
        EventStatus = OnlyFriends.Models.EnumEventStatus.Open,
        PosterUrl = "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,background=white,quality=75,width=280,height=280/event-covers/18/1e5461fc-3698-4132-a7b6-016e0fad7601.jpg", 
        StartAt = new DateTime(2026, 2, 14, 6, 30, 0),
        EndAt = new DateTime(2026, 2, 14, 8, 30, 0),
        TimeZone = "Asia/Bangkok",
        Latitude = 13.6932,
        Longitude = 100.6043,
        CategoryId = Category.Id,
        Category = Category,
        OwnerId = Owner.Id,
        Owner = Owner,
        JointType = OnlyFriends.Models.EnumJointType.Private
        };
        return View("Details", ev);
    }
}
}
