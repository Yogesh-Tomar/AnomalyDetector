using AnomalyDetectionDashboard.Models;
using AnomalyDetectionDashboard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace AnomalyDetection.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var result = await _authService.LoginAsync(request.Username, request.Password);

                if (result.Success)
                {
                    return Ok(new
                    {
                        token = result.Token,
                        user = new
                        {
                            username = result.User!.Username,
                            role = result.User.Role,
                            email = result.User.Email
                        }
                    });
                }

                return Unauthorized(new { message = "Invalid credentials" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Login failed", error = ex.Message });
            }
        }

        [HttpPost("refresh")]
        [Authorize]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var username = User.Identity!.Name!;
                var newToken = await _authService.GenerateTokenAsync(username);

                return Ok(new { token = newToken });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Token refresh failed", error = ex.Message });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            // In a real implementation, you might want to blacklist the token
            // For now, just return success as JWT tokens are stateless
            return Ok(new { message = "Logged out successfully" });
        }
    }

    public class LoginRequest
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResult
    {
        public bool Success { get; set; }
        public string? Token { get; set; }
        public User? User { get; set; }
        public string? ErrorMessage { get; set; }
    }
}