using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Services;
using OnlyFriends.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace OnlyFriends.Controllers
{
      [Route("api/notifications")]
      [Authorize]
      [ApiController]
      public class NotificationController : ControllerBase
      {
      private readonly INotificationService _service;
      private readonly ILogger<NotificationController> _logger;

      public NotificationController(INotificationService service, ILogger<NotificationController> logger)
      {
            _service = service;
            _logger = logger;
      }

      [HttpPost]
      public async Task<IActionResult> AddNotificationAsync(CreateNotificationDTO notiToCreate)
      {
            try
            {
                  var noti = await _service.AddNotificationAsync(notiToCreate);
                  return Ok(noti);
            }
            catch (Exception ex)
            {
                  _logger.LogError(ex.Message);
                  return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
      }

      [HttpPut("{id}")]
      public async Task<IActionResult> UpdateNotificationAsync(int id, UpdateNotificationDTO notiToUpdate)
      {
            if (id != notiToUpdate.Id)
            {
                  return BadRequest($"id in parameter and id in body is different. id in parameter: {id}, id in body: {notiToUpdate.Id}");
            }
            try
            {
                  var noti = await _service.FindNotificationsByIdAsync(id);
                  if (noti == null)
                  {
                        return NotFound();
                  }
                  await _service.UpdateNotificationAsync(notiToUpdate);
                  return NoContent();
            }
            catch (Exception ex)
            {
                  _logger.LogError(ex.Message);
                  return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
      }

      [HttpDelete("{id}")]
      public async Task<IActionResult> DeleteByIdAsync(int id)
      {
            try
            {
                  var noti = await _service.FindNotificationsByIdAsync(id);
                  if (noti == null)
                  {
                        return NotFound();
                  }
                  await _service.DeleteNotificationAsync(id);
                  return NoContent();
            }
            catch (Exception ex)
            {
                  _logger.LogError(ex.Message);
                  return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
      }

      [HttpGet("{id}")]
      public async Task<IActionResult> GetNotificationByIdAsync(int id)
      {
            try
            {
                  var noti = await _service.FindNotificationsByIdAsync(id);
                  if (noti == null)
                  {
                        return NotFound();
                  }
                  return Ok(noti);
            }
            catch (Exception ex)
            {
                  _logger.LogError(ex.Message);
                  return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
      }

      [HttpGet]
      public async Task<IActionResult> GetNotificationsAsync()
      {
            try
            {
                  var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                  if (!int.TryParse(userIdStr, out var userId))
                        return Unauthorized();

                  var notis = await _service.GetNotificationsForUserAsync(userId);
                  return Ok(notis);
            }
            catch (Exception ex)
            {
                  _logger.LogError(ex.Message);
                  return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
      }
      }
}