using OnlyFriends.Models.DTOs;
using Notifications.Models;
using OnlyFriends.Data;
using Microsoft.EntityFrameworkCore;

namespace OnlyFriends.Services
{
   public interface INotificationService
   {
      Task<NotificationViewModel> AddNotificationAsync(CreateNotificationDTO notiToCreate);
      Task UpdateNotificationAsync(UpdateNotificationDTO notiToUpdate);
      Task DeleteNotificationAsync(int id);
      Task<NotificationViewModel?> FindNotificationsByIdAsync(int id);
      Task<IEnumerable<NotificationViewModel>> GetNotificationAsync();
   }

   public sealed class NotificationService : INotificationService
   {
      private readonly ApplicationDbContext _context;

      public NotificationService(ApplicationDbContext context)
      {
         _context = context;
      }

      public async Task<NotificationViewModel> AddNotificationAsync(CreateNotificationDTO notiToCreate)
      {
         // DTO → Entity
         Notification notification = CreateNotificationDTO.ToNotification(notiToCreate);

         _context.Notifications.Add(notification);
         await _context.SaveChangesAsync();
         
         // Entity → ViewModel
         return NotificationViewModel.FromEntity(notification);
      }

      public async Task UpdateNotificationAsync(UpdateNotificationDTO notiToUpdate)
      {
         var notification = await _context.Notifications.FindAsync(notiToUpdate.Id);

         if (notification == null)
            throw new Exception("Notification not found");

         // update field
         notification.EventName = notiToUpdate.Name;

         await _context.SaveChangesAsync();
      }

      public async Task DeleteNotificationAsync(int notiId)
      {
         var notification = await _context.Notifications.FindAsync(notiId);

         if (notification == null)
            throw new Exception("Notification not found");

         _context.Notifications.Remove(notification);
         await _context.SaveChangesAsync();
      }

      public async Task<NotificationViewModel?> FindNotificationsByIdAsync(int id)
      {
         var notification = await _context.Notifications
                                          .AsNoTracking()
                                          .FirstOrDefaultAsync(x => x.Id == id);

         if (notification == null)
         {
            return null;
         }

         return NotificationViewModel.FromEntity(notification);
      }

      public async Task<IEnumerable<NotificationViewModel>> GetNotificationAsync()
      {
         var notifications = await _context  .Notifications
                                             .AsNoTracking()
                                             .ToListAsync();

         return notifications.Select(NotificationViewModel.FromEntity);
      }
   }
}