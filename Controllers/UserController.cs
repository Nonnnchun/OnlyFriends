using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Services;
using System.Security.Claims;

namespace OnlyFriends.Controllers
{
    public class UserController : Controller
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize]
        [HttpPost("/user/friends/{targetId}")]
        public async Task<IActionResult> SendFriendRequest(int targetId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            if (userId == targetId) return BadRequest("Cannot add yourself as a friend.");

            await _userService.SendFriendRequestAsync(userId, targetId);
            return Ok();
        }

        [Authorize]
        [HttpDelete("/user/friends/{targetId}")]
        public async Task<IActionResult> RemoveFriend(int targetId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _userService.RemoveFriendAsync(userId, targetId);
            return Ok();
        }

        [Authorize]
        [HttpPatch("/user/friends/{requesterId}/accept")]
        public async Task<IActionResult> AcceptFriendRequest(int requesterId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            if (currentUserId == requesterId) return BadRequest("Cannot accept a friend request from yourself.");

            var accepted = await _userService.AcceptFriendRequestAsync(requesterId, currentUserId);
            if (!accepted) return NotFound("No pending friend request found.");

            return Ok();
        }
    }
}
