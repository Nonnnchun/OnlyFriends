using Notifications.Models;
using System.ComponentModel.DataAnnotations;

namespace OnlyFriends.Models.DTOs
{
   public class CreateNotificationDTO
   {
      [Required(ErrorMessage = "Please enter event name")]
      [StringLength(50)]
      public required string Name { get; set; }
      public static Notification ToNotification(CreateNotificationDTO dto)
      {
         return new Notification
         {
            EventName = dto.Name
         };
      }
   }
}

