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

      // Friend request notifications
      Task AddFriendRequestNotificationAsync(int toUserId, int fromUserId, string senderUsername);
      Task DeleteFriendRequestNotificationAsync(int fromUserId, int toUserId);
      Task<IEnumerable<NotificationViewModel>> GetNotificationsForUserAsync(int userId);

      // Event join request notifications
      Task AddJoinRequestNotificationAsync(int ownerId, int fromUserId, string requesterUsername, string eventTitle);
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
         var notifications = await _context.Notifications
                                             .AsNoTracking()
                                             .ToListAsync();

         return notifications.Select(NotificationViewModel.FromEntity);
      }

      public async Task AddFriendRequestNotificationAsync(int toUserId, int fromUserId, string senderUsername)
      {
         var notification = new Notification
         {
            Type = "FriendRequest",
            ToUserId = toUserId,
            FromUserId = fromUserId,
            Message = $"{senderUsername} wants to be your friend",
            CreatedAt = DateTime.UtcNow
         };
         _context.Notifications.Add(notification);
         await _context.SaveChangesAsync();
      }

      public async Task DeleteFriendRequestNotificationAsync(int fromUserId, int toUserId)
      {
         var notification = await _context.Notifications
            .FirstOrDefaultAsync(n =>
               n.Type == "FriendRequest" &&
               n.FromUserId == fromUserId &&
               n.ToUserId == toUserId);

         if (notification != null)
         {
            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
         }
      }

      public async Task<IEnumerable<NotificationViewModel>> GetNotificationsForUserAsync(int userId)
      {
         var notifications = await _context.Notifications
            .AsNoTracking()
            .Where(n => n.ToUserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

         return notifications.Select(NotificationViewModel.FromEntity);
      }

      public async Task AddJoinRequestNotificationAsync(int ownerId, int fromUserId, string requesterUsername, string eventTitle)
      {
         var notification = new Notification
         {
            Type = "JoinRequest",
            ToUserId = ownerId,
            FromUserId = fromUserId,
            EventName = eventTitle,
            Message = $"{requesterUsername} wants to join your event \"{eventTitle}\"",
            CreatedAt = DateTime.UtcNow
         };
         _context.Notifications.Add(notification);
         await _context.SaveChangesAsync();
      }
   }
}