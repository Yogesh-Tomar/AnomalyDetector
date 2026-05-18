using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using AnomalyDetectionDashboard.Services;

namespace AnomalyDetectionDashboard.Services
{
    public class UserService : IUserService
    {
        private readonly AnomalyDbContext _context;
        //private readonly IPasswordHasher<User> _passwordHasher;
        private readonly ILogger<UserService> _logger;
        private readonly IAuthService _authService;
        public UserService(AnomalyDbContext context,
            IPasswordHasher<User> passwordHasher,
            IAuthService authService,
            ILogger<UserService> logger)
        {
            _context = context;
            //_passwordHasher = passwordHasher;
            _authService = authService;
            _logger = logger;
        }

        public async Task<List<UserResponse>> GetUsersAsync(UserFilters filters)
        {
            var query = _context.Users.AsQueryable();

            if (filters.Active.HasValue)
                query = query.Where(u => u.IsActive == filters.Active.Value);

            if (!string.IsNullOrEmpty(filters.Role))
            {
                var roleFilter = filters.Role.ToLower();
                query = query.Where(u => u.Role.ToLower() == roleFilter);
            }

            if (!string.IsNullOrEmpty(filters.Query))
            {
                var searchTerm = filters.Query.ToLower();
                query = query.Where(u => u.Username.ToLower().Contains(searchTerm) ||
                                        (u.Email != null && u.Email.ToLower().Contains(searchTerm)));
            }

            var users = await query
                .OrderBy(u => u.Username)
                .ToListAsync();

            return users.Select(u => new UserResponse
            {
                Id = u.UserId,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role,
                AuthType = u.AuthType,
                IsActive = u.IsActive,
                CreatedUtc = u.CreatedUtc,
                LastLoginUtc = u.LastLoginUtc
            }).ToList();
        }

        public async Task<UserResponse?> GetUserAsync(long id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return null;

            return new UserResponse
            {
                Id = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedUtc = user.CreatedUtc,
                LastLoginUtc = user.LastLoginUtc
            };
        }

        public async Task<UserResponse?> CreateUserAsync(CreateUserRequest request)
        {
            try
            {
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == request.Username);

                if (existingUser != null) return null;

                var salt = _authService.GenerateSalt();
                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    Role = (request.Role ?? string.Empty).ToLower(),
                    IsActive = true,
                    CreatedUtc = DateTime.UtcNow,
                    PasswordUpdatedUtc = DateTime.UtcNow,
                    Salt = salt
                };

                user.PasswordHash = _authService.HashPassword(request.Password, salt);

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return new UserResponse
                {
                    Id = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    CreatedUtc = user.CreatedUtc,
                    LastLoginUtc = user.LastLoginUtc
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred in CreateUserAsync.");
                return null;
            }
        }

        public async Task<bool> UpdateUserAsync(long id, UpdateUserRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id
                && u.AuthType == "local");
                if (user == null) return false;

                if (!string.IsNullOrEmpty(request.Email))
                    user.Email = request.Email;

                if (!string.IsNullOrEmpty(request.Role))
                    user.Role = request.Role.ToLower();

                if (request.IsActive.HasValue)
                    user.IsActive = request.IsActive.Value;

                await _context.SaveChangesAsync();
                return true;
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "An error occurred in [MethodName].");
                return false;
            }
        }

        public async Task<bool> DeleteUserAsync(long id)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
                if (user == null) return false;

                // Prevent deleting the last admin
                if (string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase) || string.Equals(user.Role, "admin", StringComparison.OrdinalIgnoreCase))
                {
                    var adminCount = await _context.Users
                        .CountAsync(u => u.Role.ToLower() == "admin" && u.UserId != id);
                    if (adminCount == 0) return false;
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "An error occurred in [MethodName].");
                return false;
            }
        }

        public async Task<bool> ResetPasswordAsync(long id, string newPassword)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
                if (user == null) return false;

                var salt = _authService.GenerateSalt();
                user.Salt = salt;
                user.PasswordHash = _authService.HashPassword(newPassword, salt);
                user.PasswordUpdatedUtc = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred in ResetPasswordAsync.");
                return false;
            }
        }

        public async Task<bool> ToggleUserStatusAsync(long id)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
                if (user == null) return false;

                // Prevent deactivating the last active admin
                if (user.IsActive && (string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase) || string.Equals(user.Role, "admin", StringComparison.OrdinalIgnoreCase)))
                {
                    var activeAdminCount = await _context.Users
                        .CountAsync(u => u.Role.ToLower() == "admin" && u.IsActive && u.UserId != id);
                    if (activeAdminCount == 0) return false;
                }

                user.IsActive = !user.IsActive;
                await _context.SaveChangesAsync();
                return true;
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "An error occurred in [MethodName].");
                return false;
            }
        }

        private static string GenerateSalt()
        {
            return Guid.NewGuid().ToString("N")[..16];
        }
    }
}