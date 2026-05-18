using AnomalyDetection.Controllers;
using AnomalyDetectionDashboard.Models;

namespace AnomalyDetectionDashboard.Services
{
    public interface IAuthService
    {
        Task<LoginResult> LoginAsync(string username, string password);
        Task<string> GenerateTokenAsync(string username);
        Task<User?> GetUserByUsernameAsync(string username);
        string HashPassword(string password, string salt);
        string GenerateSalt();
    }
}
