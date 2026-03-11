using Notifications.Models;

namespace OnlyFriends.Models.DTOs
{
   public class NotificationViewModel
   {
      public int Id { get; set; }
      public required string Name { get; set; }
      public string Type { get; set; } = string.Empty;
      public int? ToUserId { get; set; }
      public int? FromUserId { get; set; }
      public int? EventId { get; set; }
      public string Message { get; set; } = string.Empty;
      public DateTime CreatedAt { get; set; }

      public static NotificationViewModel FromEntity(Notification notification)
      {
         return new NotificationViewModel
         {
            Id = notification.Id,
            Name = notification.EventName,
            Type = notification.Type,
            ToUserId = notification.ToUserId,
            FromUserId = notification.FromUserId,
            EventId = notification.EventId,
            Message = notification.Message,
            CreatedAt = notification.CreatedAt
         };
      }
   }
}