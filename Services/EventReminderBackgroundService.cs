using OnlyFriends.Data;
using OnlyFriends.Models;
using Notifications.Models;
using Microsoft.EntityFrameworkCore;

namespace OnlyFriends.Services
{
    public class EventReminderBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<EventReminderBackgroundService> _logger;
        private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(1);

        public EventReminderBackgroundService(IServiceScopeFactory scopeFactory, ILogger<EventReminderBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SendReminderNotificationsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending event reminder notifications");
                }
                await Task.Delay(CheckInterval, stoppingToken);
            }
        }

        private async Task SendReminderNotificationsAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var now = DateTime.UtcNow;
            // Find events starting in the 20–28 hour window (covers "tomorrow" regardless of when the check runs)
            var windowStart = now.AddHours(20);
            var windowEnd = now.AddHours(28);

            var eventsStartingTomorrow = await context.Events
                .Include(e => e.UserEvents)
                .Where(e => e.StartAt.HasValue &&
                            e.StartAt.Value >= windowStart &&
                            e.StartAt.Value <= windowEnd)
                .ToListAsync();

            foreach (var ev in eventsStartingTomorrow)
            {
                var acceptedUserIds = ev.UserEvents
                    .Where(ue => ue.RequestStatus == EnumRequestStatus.Accepted)
                    .Select(ue => ue.UserId)
                    .ToList();

                foreach (var userId in acceptedUserIds)
                {
                    // Avoid duplicate reminders
                    var alreadySent = await context.Notifications.AnyAsync(n =>
                        n.Type == "EventReminder" &&
                        n.ToUserId == userId &&
                        n.EventId == ev.Id);

                    if (!alreadySent)
                    {
                        context.Notifications.Add(new Notification
                        {
                            Type = "EventReminder",
                            ToUserId = userId,
                            FromUserId = 0,
                            EventName = ev.Title,
                            EventId = ev.Id,
                            Message = $"Reminder: \"{ev.Title}\" is tomorrow!",
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
