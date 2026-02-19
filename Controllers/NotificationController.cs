using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Services;

public class NotificationController : Controller
{
   private readonly INotificationService _service;

   public NotificationController(INotificationService service)
   {
      _service = service;
   }
}
