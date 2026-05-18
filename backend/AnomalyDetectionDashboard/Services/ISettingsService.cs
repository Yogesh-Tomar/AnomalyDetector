using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Models;

namespace AnomalyDetectionDashboard.Services
{
    public interface ISettingsService
    {
        Task<SettingsResponse> GetSettingsAsync();
        Task<bool> UpdateSettingsAsync(SettingsRequest settings, string updatedBy);

        Task<List<Network>> GetAllNetworksAsync();
        Task<Network?> GetNetworkByIdAsync(long id);
        Task<Network> CreateNetworkAsync(Network network);
        Task<bool> UpdateNetworkAsync(Network network);
        Task<bool> DeleteNetworkAsync(long id);
        Task<List<Cmdb>> GetAllCmdbAsync();
        Task<Cmdb?> GetCmdbByIdAsync(long id);
        Task<Cmdb> CreateCmdbAsync(Cmdb cmdb);
        Task<bool> UpdateCmdbAsync(Cmdb cmdb);
        Task<bool> DeleteCmdbAsync(long id);

        Task<CmdbBulkUpsertResponse> BulkUpsertCmdbAsync(CmdbBulkUpsertRequest request);
    }
}
