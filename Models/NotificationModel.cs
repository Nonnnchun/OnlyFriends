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
      [Required]
      public required string EventName { get; set; }

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