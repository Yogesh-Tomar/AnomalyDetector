using AnomalyDetectionDashboard.Models;
using AnomalyDetectionDashboard.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
//using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace AnomalyDetectionDashboard.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MicrosoftAuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AnomalyDbContext _context;
        private readonly IAuthService _authService;
        private readonly ILogger<MicrosoftAuthController> _logger;

        public MicrosoftAuthController(
            IConfiguration configuration,
            AnomalyDbContext context,
            IAuthService authService,
            ILogger<MicrosoftAuthController> logger)
        {
            _configuration = configuration;
            _context = context;
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("microsoft-login")]
        public async Task<IActionResult> MicrosoftLogin([FromBody] MicrosoftLoginRequest request)
        {
            try
            {
                // Validate the Microsoft ID token
                var validatedToken = await ValidateMicrosoftToken(request.IdToken);

                if (validatedToken == null)
                {
                    return Unauthorized(new { message = "Invalid Microsoft token" });
                }

                // Extract claims from the validated token
                var claims = validatedToken.Claims;
                var azureId = claims.FirstOrDefault(c => c.Type == "oid")?.Value
                    ?? claims.FirstOrDefault(c => c.Type == "sub")?.Value;
                var email = claims.FirstOrDefault(c => c.Type == "preferred_username")?.Value
                    ?? claims.FirstOrDefault(c => c.Type == "email")?.Value
                    ?? request.Account.Email;
                var name = claims.FirstOrDefault(c => c.Type == "name")?.Value
                    ?? request.Account.Name;

                // Get user's groups from token or Graph API
                var groups = GetUserGroups(claims, request.Account.Claims);

                // Map Azure AD groups/roles to application roles
                var userRole = DetermineUserRole(groups, request.Account.Claims);

                // Resolve existing user: R&569081334031az
                // 1) Prefer matching by Azure AD object id
                // 2) If AzureAdId is missing, only match by email for existing Microsoft users (avoid linking to local accounts)
                User? user = null;
                if (!string.IsNullOrWhiteSpace(azureId))
                {
                    user = await _context.Users.FirstOrDefaultAsync(u => u.AzureAdId == azureId);
                }
                if (user == null && !string.IsNullOrWhiteSpace(email))
                {
                    user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email && u.AuthType == "microsoft");
                }

                if (user == null)
                {
                    // Create new user from Azure AD
                    var baseUsername = (email ?? string.Empty).Split('@')[0];
                    var username = await GenerateUniqueUsernameAsync(baseUsername);

                    user = new User
                    {
                        Username = username,
                        Email = email,
                        FullName = name,
                        AzureAdId = azureId,
                        Role = userRole,
                        IsActive = true,
                        CreatedUtc = DateTime.UtcNow,
                        LastLoginUtc = DateTime.UtcNow,
                        PasswordUpdatedUtc = DateTime.UtcNow, // satisfy non-null DB column
                        AuthType = "microsoft", // consistently lowercase
                        // Don't set password for SSO users
                        PasswordHash = null,
                        Salt = null
                    };

                    if (groups.Any())
                    {
                        user.SetAzureGroups(groups);
                    }

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Created new user from Azure AD: {email}");
                }
                else
                {
                    // Update existing user (only for Microsoft users)
                    user.LastLoginUtc = DateTime.UtcNow;
                    user.FullName = name; // Update name if changed
                    user.AuthType = "microsoft"; // enforce SSO
                    if (!string.IsNullOrWhiteSpace(azureId))
                    {
                        user.AzureAdId = azureId;
                    }
                    if (groups.Any())
                    {
                        user.SetAzureGroups(groups);
                    }

                    // Update role if configured to sync from Azure AD and user is a Microsoft user
                    if (_configuration.GetValue<bool>("AzureAd:SyncRoles", true) && string.Equals(user.AuthType, "microsoft", StringComparison.OrdinalIgnoreCase))
                    {
                        user.Role = userRole;
                    }

                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"User logged in via Azure AD: {email}");
                }

                // Check if user is active
                if (!user.IsActive)
                {
                    return Unauthorized(new { message = "User account is deactivated" });
                }

                // Generate JWT token for the application
                var token = GenerateJwtToken(user, azureId);

                return Ok(new
                {
                    token = token,
                    user = new
                    {
                        id = user.UserId,
                        username = user.Username,
                        email = user.Email,
                        role = user.Role,
                        fullName = user.FullName,
                        authType = "microsoft"
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Microsoft authentication failed");
                return StatusCode(500, new { message = "Authentication failed", error = ex.Message });
            }
        }

        private async Task<ClaimsPrincipal?> ValidateMicrosoftToken(string idToken)
        {
            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuers = new[]
                    {
                        $"https://login.microsoftonline.com/{_configuration["AzureAd:TenantId"]}/v2.0",
                        $"https://sts.windows.net/{_configuration["AzureAd:TenantId"]}/"
                    },
                    ValidateAudience = true,
                    ValidAudience = _configuration["AzureAd:ClientId"],
                    ValidateLifetime = true,
                    IssuerSigningKeys = await GetSigningKeys(),
                    ClockSkew = TimeSpan.FromMinutes(5)
                };

                var handler = new JwtSecurityTokenHandler();
                var principal = handler.ValidateToken(idToken, validationParameters, out var validatedToken);

                return principal;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Token validation failed");
                return null;
            }
        }

        private async Task<IList<SecurityKey>> GetSigningKeys()
        {
            var openIdConfig = await GetOpenIdConfiguration();
            return (IList<SecurityKey>)openIdConfig.SigningKeys;
        }

        private async Task<Microsoft.IdentityModel.Protocols.OpenIdConnect.OpenIdConnectConfiguration> GetOpenIdConfiguration()
        {
            var configurationManager = new Microsoft.IdentityModel.Protocols.ConfigurationManager<Microsoft.IdentityModel.Protocols.OpenIdConnect.OpenIdConnectConfiguration>(
                $"https://login.microsoftonline.com/{_configuration["AzureAd:TenantId"]}/v2.0/.well-known/openid-configuration",
                new Microsoft.IdentityModel.Protocols.OpenIdConnect.OpenIdConnectConfigurationRetriever(),
                new Microsoft.IdentityModel.Protocols.HttpDocumentRetriever());

            return await configurationManager.GetConfigurationAsync();
        }

        private List<string> GetUserGroups(IEnumerable<Claim> tokenClaims, Dictionary<string, object> additionalClaims)
        {
            var groups = new List<string>();

            // Get groups from token claims
            var groupClaims = tokenClaims.Where(c => c.Type == "groups").Select(c => c.Value);
            groups.AddRange(groupClaims);

            // Get groups from additional claims if present
            if (additionalClaims != null && additionalClaims.ContainsKey("groups"))
            {
                if (additionalClaims["groups"] is IEnumerable<string> groupList)
                {
                    groups.AddRange(groupList);
                }
            }

            return groups.Distinct().ToList();
        }

        private string DetermineUserRole(List<string> groups, Dictionary<string, object> claims)
        {
            // Check for admin role based on Azure AD groups
            var adminGroupIds = _configuration.GetSection("AzureAd:AdminGroups").Get<string[]>() ?? new string[0];
            if (groups.Any(g => adminGroupIds.Contains(g, StringComparer.OrdinalIgnoreCase)))
            {
                return "admin";
            }

            // Check for custom role claim
            if (claims != null)
            {
                if (claims.ContainsKey("extension_Role"))
                {
                    var role = claims["extension_Role"]?.ToString()?.ToLower();
                    if (role == "admin" || role == "administrator")
                        return "admin";
                    if (role == "analyst")
                        return "analyst";
                }

                // Check standard role claim
                if (claims.ContainsKey("roles"))
                {
                    var roles = claims["roles"];

                    // Handle JsonElement with Array ValueKind
                    if (roles is System.Text.Json.JsonElement jsonElement && jsonElement.ValueKind == System.Text.Json.JsonValueKind.Array)
                    {
                        var roleList = jsonElement.Deserialize<string[]>();
                        if (roleList != null && roleList.Any(r => r.ToLower().Contains("admin")))
                        {
                            return "admin";
                        }
                    }
                }
            }

            // Default to analyst role
            return "analyst";
        }

        private string GenerateJwtToken(User user, string azureId)
        {
            // Normalize role claim casing for Authorize(Roles="Admin") style attributes
            var normalizedRole = string.Equals(user.Role, "admin", StringComparison.OrdinalIgnoreCase) ? "Admin" : "Analyst";

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, normalizedRole),
                new Claim("userId", user.UserId.ToString()),
                new Claim("azureId", azureId ?? ""),
                new Claim("authType", "microsoft"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]));
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

        private async Task<string> GenerateUniqueUsernameAsync(string baseUsername)
        {
            var username = string.IsNullOrWhiteSpace(baseUsername) ? "user" : baseUsername;
            if (!await _context.Users.AnyAsync(u => u.Username == username))
            {
                return username;
            }

            var i = 1;
            while (true)
            {
                var candidate = $"{username}{i}";
                if (!await _context.Users.AnyAsync(u => u.Username == candidate))
                {
                    return candidate;
                }
                i++;
            }
        }
    }

    public class MicrosoftLoginRequest
    {
        public string IdToken { get; set; }
        public string AccessToken { get; set; }
        public MicrosoftAccountInfo Account { get; set; }
    }

    public class MicrosoftAccountInfo
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        public string AzureId { get; set; }
        public Dictionary<string, object> Claims { get; set; }
    }
}
