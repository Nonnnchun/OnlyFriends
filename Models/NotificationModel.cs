using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OnlyFriends.Models.DTOs;

namespace Notifications.Models
{
   [Table("Notification")]
   public class Notification
   {
      [Key]
      public int Id { get; set; }

      [Column(TypeName = "varchar(20)")]
      public string EventName { get; set; } = string.Empty;

      // The ID of the event this notification is related to
      public int? EventId { get; set; }

      // Notification type: "FriendRequest", "EventInvite", etc.
      public string Type { get; set; } = string.Empty;

      // Who receives this notification
      public int? ToUserId { get; set; }

      // Who triggered this notification
      public int? FromUserId { get; set; }

      // Human-readable message shown in the bell
      public string Message { get; set; } = string.Empty;

      public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

      public static NotificationViewModel ToGetNotificationDto(Notification notification)
      {
         return new NotificationViewModel
         {
               Id = notification.Id,
               Name = notification.EventName
         };
      }
   }
}