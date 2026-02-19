using Notifications.Models;
using System.ComponentModel.DataAnnotations;

namespace OnlyFriends.Models.DTOs
{
   public class UpdateNotificationDTO
   {
      public int Id { get; set; }
      [Required]
      public required string Name { get; set; }
      public static Notification ToNotification(UpdateNotificationDTO dto)
      {
         return new Notification
         {
            Id = dto.Id,
            EventName = dto.Name
         };
      }
   }
}