using AnomalyDetectionDashboard.DTOs;

namespace AnomalyDetectionDashboard.Services
{
    public interface IConfigurationService
    {
        Task<List<ConfigurationResponse>> GetConfigurationsAsync();
        Task<ConfigurationResponse?> GetConfigurationAsync(Guid id);
        Task<ConfigurationResponse?> CreateConfigurationAsync(CreateConfigurationRequest request);
        Task<bool> UpdateConfigurationAsync(Guid id, UpdateConfigurationRequest request);
        Task<(bool Success, string? Error, int StatusCode)> DeleteConfigurationAsync(Guid id);
        Task<List<ConfigurationDropdownItem>> GetConfigurationDropdownAsync();
    }
}
