using AnomalyDetectionDashboard.Models;
using AnomalyDetectionDashboard.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Database Configuration 
builder.Services.AddDbContext<AnomalyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Single JWT Bearer authentication that handles both local and Microsoft tokens
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuers = new[]
            {
                builder.Configuration["Jwt:Issuer"], // Local issuer
                $"https://login.microsoftonline.com/{builder.Configuration["AzureAd:TenantId"]}/v2.0", // Azure AD v2.0
                $"https://sts.windows.net/{builder.Configuration["AzureAd:TenantId"]}/" // Azure AD v1.0
            },
            ValidateAudience = true,
            ValidAudiences = new[]
            {
                builder.Configuration["Jwt:Audience"], // Local audience
                builder.Configuration["AzureAd:ClientId"] // Azure AD audience
            },
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true, // <-- Enable signature validation
            ClockSkew = TimeSpan.FromMinutes(5),
            // Only set IssuerSigningKey for local tokens
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]))
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();

                // Check if it's a local or Microsoft token
                var issuer = context.Principal?.FindFirst("iss")?.Value;
                var authType = context.Principal?.FindFirst("authType")?.Value;

                if (issuer != null && issuer.Contains("microsoft"))
                {
                    // It's a Microsoft token - additional validation already done in controller
                    logger.LogInformation("Microsoft Azure AD token validated");
                }
                else if (authType == "microsoft")
                {
                    // It's our JWT containing Microsoft auth info
                    logger.LogInformation("Local JWT with Microsoft authentication validated");
                }
                else
                {
                    // It's a local token
                    logger.LogInformation("Local authentication token validated");
                }
            },
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogError($"Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            }
        };

        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.SaveToken = true;
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin", "admin"));
    options.AddPolicy("AnalystOrAdmin", policy => policy.RequireRole("Admin", "Analyst", "admin", "analyst"));

    // Optional: Add authentication type specific policies
    options.AddPolicy("MicrosoftUsers", policy =>
        policy.RequireClaim("authType", "microsoft"));

    options.AddPolicy("LocalUsers", policy =>
        policy.RequireClaim("authType", "local"));
});

// Services Registration
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IConfigurationService, ConfigurationService>();
builder.Services.AddScoped<IAlertService, AlertService>();
builder.Services.AddScoped<IEntityService, EntityService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<INetworkGraphService, NetworkGraphService>();
builder.Services.AddScoped<IDashboardNew, DashboardNew>();
builder.Services.AddScoped<IVHunt, VHunt>();

// HttpClient for Microsoft Graph API calls (if needed)
builder.Services.AddHttpClient("MicrosoftGraph", client =>
{
    client.BaseAddress = new Uri("https://graph.microsoft.com/v1.0/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new string[0];

        // Add Microsoft authentication domains
        var allOrigins = allowedOrigins.Concat(new[]
        {
            "https://login.microsoftonline.com",
            "https://login.windows.net",
            "https://login.live.com"
        }).ToArray();

        policy.WithOrigins(allOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("ApiPolicy", configure =>
    {
        configure.PermitLimit = 1000;
        configure.Window = TimeSpan.FromMinutes(1);
    });

    // Separate policy for authentication endpoints
    options.AddFixedWindowLimiter("AuthPolicy", configure =>
    {
        configure.PermitLimit = 50;
        configure.Window = TimeSpan.FromMinutes(1);
    });
});

// Session management (optional)
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(8);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; // Use Always in production
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Anomaly Detection API",
        Version = "v1",
        Description = "API for Anomaly Detection Dashboard with dual authentication support"
    });

    // Add JWT Bearer authentication to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Anomaly Detection API V1");
    });
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseSession();

// Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// Rate limiting
app.UseRateLimiter();

// Custom middleware to log authentication info
app.Use(async (context, next) =>
{
    if (context.User?.Identity?.IsAuthenticated == true)
    {
        var authType = context.User.FindFirst("authType")?.Value ?? "unknown";
        var userId = context.User.FindFirst("userId")?.Value ?? "unknown";

        context.Items["AuthType"] = authType;
        context.Items["UserId"] = userId;

        // Optional: Log authentication details
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogDebug($"Request from {authType} user {userId}");
    }
    await next();
});

// Map controllers with default rate limiting
app.MapControllers()
    .RequireRateLimiting("ApiPolicy");

// Special handling for auth endpoints with different rate limit
app.MapControllerRoute(
    name: "auth",
    pattern: "api/auth/{action}",
    defaults: new { controller = "Auth" })
    .RequireRateLimiting("AuthPolicy");

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .AllowAnonymous();

app.Run();