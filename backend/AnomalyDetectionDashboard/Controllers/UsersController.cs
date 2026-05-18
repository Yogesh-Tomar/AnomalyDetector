using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AnomalyDetectionDashboard.Services;
using AnomalyDetectionDashboard.DTOs;

namespace AnomalyDetectionDashboard.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] UserFilters filters)
        {
            var users = await _userService.GetUsersAsync(filters);
            return Ok(users);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetUser(long id)
        {
            var user = await _userService.GetUserAsync(id);
            return user != null ? Ok(user) : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            var user = await _userService.CreateUserAsync(request);
            return user != null
                ? CreatedAtAction(nameof(GetUser), new { id = user.Id }, user)
                : BadRequest("Failed to create user");
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> UpdateUser(long id, [FromBody] UpdateUserRequest request)
        {
            var success = await _userService.UpdateUserAsync(id, request);
            return success ? Ok() : BadRequest("Failed to update user");
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeleteUser(long id)
        {
            //var userIdClaim = User.FindFirst("userId")?.Value;
            //if (userIdClaim == null)
            //{
            //    return BadRequest("Cannot delete your own account, user does not exist");
            //}
            //long currentUserId = long.Parse(userIdClaim);
            //if (id == currentUserId)
            //    return BadRequest("Cannot delete your own account");

            var success = await _userService.DeleteUserAsync(id);
            return success ? Ok() : BadRequest("Failed to delete user");
        }

        [HttpPost("{id:long}/reset-password")]
        public async Task<IActionResult> ResetPassword(long id, [FromBody] ResetPasswordRequest request)
        {
            //var userIdClaim = User.FindFirst("userId")?.Value;
            //if (userIdClaim == null)
            //{
            //    return BadRequest("Cannot reset password, user does not exist");
            //}
            //long currentUserId = long.Parse(userIdClaim);
            //if (id == currentUserId)
            //    return BadRequest("Cannot deactivate your own account");

            var success = await _userService.ResetPasswordAsync(id, request.NewPassword);
            return success ? Ok() : BadRequest("Failed to reset password");
        }

        [HttpPost("{id:long}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(long id)
        {
            //var userIdClaim = User.FindFirst("userId")?.Value;
            //if (userIdClaim == null)
            //{
            //    return BadRequest("Cannot deactivate your own account, user does not exist");
            //}
            //long currentUserId = long.Parse(userIdClaim);
            //if (id == currentUserId)
            //    return BadRequest("Cannot deactivate your own account");

            var success = await _userService.ToggleUserStatusAsync(id);
            return success ? Ok() : BadRequest("Failed to toggle user status");
        }
    }

    public class ResetPasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
    }
}