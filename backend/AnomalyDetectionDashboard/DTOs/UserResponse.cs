namespace AnomalyDetectionDashboard.DTOs
{
    public class UserResponse
    {
        public long Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string Role { get; set; } = string.Empty;
        public string AuthType { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedUtc { get; set; }
        public DateTime? LastLoginUtc { get; set; }
    }

    public class CreateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class UpdateUserRequest
    {
        public string? Email { get; set; }
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }

    public class UserFilters
    {
        public bool? Active { get; set; }
        public string? Role { get; set; }
        public string? Query { get; set; }
    }
}