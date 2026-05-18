using AnomalyDetection.Controllers;
using AnomalyDetectionDashboard.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AnomalyDetectionDashboard.Services
{
    public class AuthService : IAuthService
    {
        private readonly AnomalyDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AnomalyDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResult> LoginAsync(string username, string password)
        {
            var user = await GetUserByUsernameAsync(username);

            if (user == null || !user.IsActive)
            {
                return new LoginResult { Success = false, ErrorMessage = "Invalid credentials" };
            }

            var hashedPassword = HashPassword(password, user.Salt);

            if (hashedPassword != user.PasswordHash)
            {
                return new LoginResult { Success = false, ErrorMessage = "Invalid credentials" };
            }

            // Update last login
            user.LastLoginUtc = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = await GenerateTokenAsync(username);

            return new LoginResult
            {
                Success = true,
                Token = token,
                User = user
            };
        }

        public async Task<string> GenerateTokenAsync(string username)
        {
            var user = await GetUserByUsernameAsync(username);

            if (user == null)
                throw new ArgumentException("User not found");

            // Normalize role claim to Title case for compatibility with [Authorize(Roles="...")]
            var normalizedRole = string.Equals(user.Role, "admin", StringComparison.OrdinalIgnoreCase) ? "Admin" : "Analyst";

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, normalizedRole),
                new Claim("userId", user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public string HashPassword(string password, string salt)
        {
            // Using Argon2id for password hashing (recommended)
            // You'll need to install: Konscious.Security.Cryptography.Argon2
            using var argon2 = new Konscious.Security.Cryptography.Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = Convert.FromBase64String(salt),
                DegreeOfParallelism = 2,
                Iterations = 3,
                MemorySize = 65536 // 64 MB
            };

            var hash = argon2.GetBytes(32);
            return Convert.ToBase64String(hash);
        }

        public string GenerateSalt()
        {
            var bytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }
    }
}
