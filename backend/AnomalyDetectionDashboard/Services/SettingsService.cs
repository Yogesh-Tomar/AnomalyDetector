using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace AnomalyDetectionDashboard.Services
{
    public class SettingsService : ISettingsService
    {
        private readonly AnomalyDbContext _context;

        public SettingsService(AnomalyDbContext context)
        {
            _context = context;
        }

        public async Task<SettingsResponse> GetSettingsAsync()
        {
            var settings = await _context.Settings.ToListAsync();

            return new SettingsResponse
            {
                Webhook = new WebhookSettings
                {
                    Enabled = GetBoolSetting(settings, "webhook.enabled"),
                    Host = GetStringSetting(settings, "webhook.host", "localhost"),
                    Port = GetIntSetting(settings, "webhook.port", 8080),
                    Username = GetStringSetting(settings, "webhook.username", ""),
                    Password = GetStringSetting(settings, "webhook.password", "")
                },
                Syslog = new SyslogSettings
                {
                    Enabled = GetBoolSetting(settings, "syslog.enabled"),
                    Host = GetStringSetting(settings, "syslog.host", "localhost"),
                    Port = GetIntSetting(settings, "syslog.port", 514)
                },
                AutoLockUser = GetBoolSetting(settings, "autoLockUser")
            };
        }

        public async Task<bool> UpdateSettingsAsync(SettingsRequest settings, string updatedBy)
        {
            try
            {
                await SetSettingAsync("webhook.enabled", settings.Webhook.Enabled.ToString().ToLower(), updatedBy);
                await SetSettingAsync("webhook.host", settings.Webhook.Host, updatedBy);
                await SetSettingAsync("webhook.port", settings.Webhook.Port.ToString(), updatedBy);
                await SetSettingAsync("webhook.username", settings.Webhook.Username, updatedBy);
                await SetSettingAsync("webhook.password", settings.Webhook.Password, updatedBy);

                await SetSettingAsync("syslog.enabled", settings.Syslog.Enabled.ToString().ToLower(), updatedBy);
                await SetSettingAsync("syslog.host", settings.Syslog.Host, updatedBy);
                await SetSettingAsync("syslog.port", settings.Syslog.Port.ToString(), updatedBy);

                await SetSettingAsync("autoLockUser", settings.AutoLockUser.ToString().ToLower(), updatedBy);

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        private async Task SetSettingAsync(string key, string value, string updatedBy)
        {
            var setting = await _context.Settings.FirstOrDefaultAsync(s => s.SettingKey == key);

            if (setting == null)
            {
                setting = new Setting
                {
                    SettingKey = key,
                    SettingValue = value,
                    UpdatedBy = updatedBy,
                    UpdatedUtc = DateTime.UtcNow
                };
                _context.Settings.Add(setting);
            }
            else
            {
                setting.SettingValue = value;
                setting.UpdatedBy = updatedBy;
                setting.UpdatedUtc = DateTime.UtcNow;
            }
        }

        private bool GetBoolSetting(List<Setting> settings, string key, bool defaultValue = false)
        {
            var setting = settings.FirstOrDefault(s => s.SettingKey == key);
            return setting?.SettingValue?.ToLower() == "true";
        }

        private string GetStringSetting(List<Setting> settings, string key, string defaultValue = "")
        {
            var setting = settings.FirstOrDefault(s => s.SettingKey == key);
            return setting?.SettingValue ?? defaultValue;
        }

        private int GetIntSetting(List<Setting> settings, string key, int defaultValue = 0)
        {
            var setting = settings.FirstOrDefault(s => s.SettingKey == key);
            if (setting?.SettingValue != null && int.TryParse(setting.SettingValue, out int result))
            {
                return result;
            }
            return defaultValue;
        }

        public async Task<List<Network>> GetAllNetworksAsync()
        {
            return await _context.Networks.ToListAsync();
        }

        public async Task<Network?> GetNetworkByIdAsync(long id)
        {
            return await _context.Networks.FindAsync(id);
        }

        public async Task<Network> CreateNetworkAsync(Network network)
        {
            network.CreatedUtc = DateTime.UtcNow;
            _context.Networks.Add(network);
            await _context.SaveChangesAsync();
            return network;
        }

        public async Task<bool> UpdateNetworkAsync(Network network)
        {
            var existing = await _context.Networks.FindAsync(network.NetworkId);
            if (existing == null) return false;

            existing.Subnetz = network.Subnetz;
            existing.Description = network.Description;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteNetworkAsync(long id)
        {
            var network = await _context.Networks.FindAsync(id);
            if (network == null) return false;

            _context.Networks.Remove(network);
            await _context.SaveChangesAsync();
            return true;
        }

        // --- Cmdb CRUD operations ---

        public async Task<List<Cmdb>> GetAllCmdbAsync()
        {
            return await _context.Cmdb.ToListAsync();
        }

        public async Task<Cmdb?> GetCmdbByIdAsync(long id)
        {
            return await _context.Cmdb.FindAsync(id);
        }

        public async Task<Cmdb> CreateCmdbAsync(Cmdb cmdb)
        {
            cmdb.CreatedUtc = DateTime.UtcNow;
            _context.Cmdb.Add(cmdb);
            await _context.SaveChangesAsync();
            return cmdb;
        }

        public async Task<bool> UpdateCmdbAsync(Cmdb cmdb)
        {
            var existing = await _context.Cmdb.FindAsync(cmdb.CmdbId);
            if (existing == null) return false;

            existing.IpAddress = cmdb.IpAddress;
            existing.Hostname = cmdb.Hostname;
            existing.NetworkId = cmdb.NetworkId;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCmdbAsync(long id)
        {
            var cmdb = await _context.Cmdb.FindAsync(id);
            if (cmdb == null) return false;

            _context.Cmdb.Remove(cmdb);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CmdbBulkUpsertResponse> BulkUpsertCmdbAsync(CmdbBulkUpsertRequest request)
        {
            var response = new CmdbBulkUpsertResponse();
            if (request?.Entries == null || request.Entries.Count == 0)
                return response;

            var normalized = request.Entries
                .Select(e => new CmdbBulkUpsertEntry
                {
                    IpAddress = (e.IpAddress ?? string.Empty).Trim(),
                    Hostname = string.IsNullOrWhiteSpace(e.Hostname) ? null : e.Hostname.Trim(),
                    NetworkId = e.NetworkId
                })
                .ToList();

            var ips = normalized
                .Select(e => e.IpAddress)
                .Where(ip => !string.IsNullOrWhiteSpace(ip))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (ips.Count == 0)
                return response;

            var existing = await _context.Cmdb
                .Where(c => ips.Contains(c.IpAddress))
                .ToListAsync();

            var existingByIp = existing
                .GroupBy(c => c.IpAddress, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(g => g.Key, g => g.OrderByDescending(x => x.CmdbId).First(), StringComparer.OrdinalIgnoreCase);

            foreach (var entry in normalized)
            {
                if (string.IsNullOrWhiteSpace(entry.IpAddress))
                {
                    response.Failed++;
                    response.Errors.Add(new CmdbBulkUpsertError { IpAddress = entry.IpAddress, Message = "IpAddress is required." });
                    continue;
                }

                if (entry.NetworkId == null)
                {
                    response.Failed++;
                    response.Errors.Add(new CmdbBulkUpsertError { IpAddress = entry.IpAddress, Message = "NetworkId is required." });
                    continue;
                }

                if (existingByIp.TryGetValue(entry.IpAddress, out var row))
                {
                    row.Hostname = entry.Hostname;
                    row.NetworkId = entry.NetworkId;
                    response.Updated++;
                }
                else
                {
                    _context.Cmdb.Add(new Cmdb
                    {
                        IpAddress = entry.IpAddress,
                        Hostname = entry.Hostname,
                        NetworkId = entry.NetworkId,
                        CreatedUtc = DateTime.UtcNow
                    });
                    response.Inserted++;
                }
            }

            await _context.SaveChangesAsync();
            return response;
        }
    }
}