using AnomalyDetectionDashboard.DTOs;

namespace AnomalyDetectionDashboard.Services
{
    public interface IUserService
    {
        Task<List<UserResponse>> GetUsersAsync(UserFilters filters);
        Task<UserResponse?> GetUserAsync(long id);
        Task<UserResponse?> CreateUserAsync(CreateUserRequest request);
        Task<bool> UpdateUserAsync(long id, UpdateUserRequest request);
        Task<bool> DeleteUserAsync(long id);
        Task<bool> ResetPasswordAsync(long id, string newPassword);
        Task<bool> ToggleUserStatusAsync(long id);
    }
}
