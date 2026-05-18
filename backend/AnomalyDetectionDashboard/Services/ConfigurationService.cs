using AnomalyDetectionDashboard.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using AnomalyDetectionDashboard.DTOs;
using Microsoft.AspNetCore.Http;

namespace AnomalyDetectionDashboard.Services
{
    public class ConfigurationService : IConfigurationService
    {
        private readonly AnomalyDbContext _context;
        private readonly ILogger<UserService> _logger;

        public ConfigurationService(AnomalyDbContext context, ILogger<UserService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<ConfigurationResponse>> GetConfigurationsAsync()
        {
            var configs = await _context.ConfigStates
                .OrderBy(c => c.ConfigName)
                .ToListAsync();

            // Preload group usage to avoid N+1 queries
            var groups = await _context.Groups
                .Where(g => g.ConfigStateId != null)
                .Select(g => new { g.ConfigStateId, g.GroupId, g.Name, g.CreatedUtc })
                .ToListAsync();

            var groupLookup = groups
                .GroupBy(g => g.ConfigStateId!.Value)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderBy(x => x.CreatedUtc).First());

            var result = new List<ConfigurationResponse>();

            foreach (var config in configs)
            {
                groupLookup.TryGetValue(config.ConfigStateId, out var groupInfo);

                result.Add(new ConfigurationResponse
                {
                    ConfigStateId = config.ConfigStateId,
                    Name = config.ConfigName ?? "Unnamed",
                    Json = config.Json,
                    Version = config.Version ?? 1,
                    IsActive = config.IsActive,
                    IsUsed = groupInfo != null,
                    UsedByGroupId = groupInfo?.GroupId,
                    UsedByGroupName = groupInfo?.Name,
                    CreatedUtc = config.CreatedUtc,
                    EffectiveFromUtc = config.EffectiveFromUtc,
                    EffectiveUntilUtc = config.EffectiveUntilUtc
                });
            }

            return result;
        }

        public async Task<ConfigurationResponse?> GetConfigurationAsync(Guid id)
        {
            var config = await _context.ConfigStates
                .FirstOrDefaultAsync(c => c.ConfigStateId == id);

            if (config == null) return null;

            var usedByGroup = await _context.Groups
                .Where(g => g.ConfigStateId == id)
                .OrderBy(g => g.CreatedUtc)
                .Select(g => new { g.GroupId, g.Name })
                .FirstOrDefaultAsync();

            return new ConfigurationResponse
            {
                ConfigStateId = config.ConfigStateId,
                Name = config.ConfigName ?? "Unnamed",
                Json = config.Json,
                Version = config.Version ?? 1,
                IsActive = config.IsActive,
                IsUsed = usedByGroup != null,
                UsedByGroupId = usedByGroup?.GroupId,
                UsedByGroupName = usedByGroup?.Name,
                CreatedUtc = config.CreatedUtc,
                EffectiveFromUtc = config.EffectiveFromUtc,
                EffectiveUntilUtc = config.EffectiveUntilUtc
            };
        }

        public async Task<ConfigurationResponse?> CreateConfigurationAsync(CreateConfigurationRequest request)
        {
            try
            {
                // Validate JSON
                //JsonDocument.Parse(request.Json);

                var now = DateTime.UtcNow;
                var effectiveFromUtc = request.EffectiveFromUtc ?? now;
                var effectiveUntilUtc = request.EffectiveUntilUtc ?? effectiveFromUtc.AddYears(15);

                var config = new ConfigState
                {
                    ConfigStateId = Guid.NewGuid(),
                    ConfigName = request.Name,
                    Json = request.Json,
                    Version = 1,
                    IsActive = true,
                    CreatedUtc = now,
                    EffectiveFromUtc = effectiveFromUtc,
                    EffectiveUntilUtc = effectiveUntilUtc
                };

                _context.ConfigStates.Add(config);
                await _context.SaveChangesAsync();

                return new ConfigurationResponse
                {
                    ConfigStateId = config.ConfigStateId,
                    Name = config.ConfigName ?? "Unnamed",
                    Json = config.Json,
                    Version = config.Version ?? 1,
                    IsActive = config.IsActive,
                    IsUsed = false,
                    CreatedUtc = config.CreatedUtc,
                    EffectiveFromUtc = config.EffectiveFromUtc,
                    EffectiveUntilUtc = config.EffectiveUntilUtc
                };
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "An error occurred in CreateConfigurationAsync.");
                return null;
            }
        }

        public async Task<List<ConfigurationDropdownItem>> GetConfigurationDropdownAsync()
        {
            return await _context.ConfigStates
                .OrderBy(c => c.ConfigName)
                .Select(c => new ConfigurationDropdownItem
                {
                    Id = c.ConfigStateId,
                    Name = c.ConfigName ?? "Unnamed"
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateConfigurationAsync(Guid id, UpdateConfigurationRequest request)
        {
            try
            {
                var config = await _context.ConfigStates
                    .FirstOrDefaultAsync(c => c.ConfigStateId == id);

                if (config == null) return false;

                var now = DateTime.UtcNow;
                var hasChanges = false;

                // Validate JSON if provided
                if (!string.IsNullOrEmpty(request.Json))
                {
                    JsonDocument.Parse(request.Json);
                    if (config.Json != request.Json)
                    {
                        config.Json = request.Json;
                        hasChanges = true;
                    }
                }

                if (!string.IsNullOrEmpty(request.Name) && !string.Equals(config.ConfigName, request.Name, StringComparison.Ordinal))
                {
                    config.ConfigName = request.Name;
                    hasChanges = true;
                }

                if (request.IsActive.HasValue && config.IsActive != request.IsActive.Value)
                {
                    config.IsActive = request.IsActive.Value;
                    hasChanges = true;
                }

                if (request.EffectiveFromUtc.HasValue && config.EffectiveFromUtc != request.EffectiveFromUtc.Value)
                {
                    config.EffectiveFromUtc = request.EffectiveFromUtc.Value;
                    hasChanges = true;
                }
                else if (!config.EffectiveFromUtc.HasValue)
                {
                    config.EffectiveFromUtc = now;
                    hasChanges = true;
                }

                if (request.EffectiveUntilUtc.HasValue && config.EffectiveUntilUtc != request.EffectiveUntilUtc.Value)
                {
                    config.EffectiveUntilUtc = request.EffectiveUntilUtc.Value;
                    hasChanges = true;
                }
                else if (!config.EffectiveUntilUtc.HasValue)
                {
                    var defaultUntil = (config.EffectiveFromUtc ?? now).AddYears(15);
                    if (config.EffectiveUntilUtc != defaultUntil)
                    {
                        config.EffectiveUntilUtc = defaultUntil;
                        hasChanges = true;
                    }
                }

                if (hasChanges)
                {
                    config.Version = (config.Version ?? 1) + 1;
                    await _context.SaveChangesAsync();
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<(bool Success, string? Error, int StatusCode)> DeleteConfigurationAsync(Guid id)
        {
            try
            {
                var config = await _context.ConfigStates
                    .FirstOrDefaultAsync(c => c.ConfigStateId == id);

                if (config == null)
                    return (false, "Configuration not found.", StatusCodes.Status404NotFound);

                var isUsed = await _context.Groups
                    .AnyAsync(g => g.ConfigStateId == id);

                if (isUsed)
                    return (false, "Configuration is assigned to one or more groups. Remove those assignments before deleting.", StatusCodes.Status409Conflict);

                _context.ConfigStates.Remove(config);
                await _context.SaveChangesAsync();
                return (true, null, StatusCodes.Status204NoContent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting configuration {ConfigStateId}", id);
                return (false, "Unexpected error while deleting configuration.", StatusCodes.Status500InternalServerError);
            }
        }
    }
}
