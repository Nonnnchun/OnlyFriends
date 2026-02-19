using Notifications.Models;

namespace OnlyFriends.Models.DTOs
{
   public class NotificationViewModel
   {
      public int Id { get; set; }
      public required string Name { get; set; }
      public static NotificationViewModel FromEntity(Notification notification)
      {
         return new NotificationViewModel
         {
            Id = notification.Id,
            Name = notification.EventName
         };
      }
   }
}