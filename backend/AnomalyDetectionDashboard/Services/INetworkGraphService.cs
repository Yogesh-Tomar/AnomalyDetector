using AnomalyDetectionDashboard.Models;
using AnomalyDetectionDashboard.DTOs.NetworkGraph;

namespace AnomalyDetectionDashboard.Services
{
    public interface INetworkGraphService
    {
        Task<NetworkGraphResponseDto> GetNetworkGraphAsync(NetworkGraphRequestDto request);
        Task<NodeInvestigationDto> GetNodeInvestigationAsync(string ipAddress, DateTime? startTime = null, DateTime? endTime = null);
        Task<List<ConnectionDetailDto>> GetEdgeDetailsAsync(string sourceIp, string targetIp, DateTime? startTime = null, DateTime? endTime = null);
        Task<List<string>> GetDistinctTargetIpsAsync();
        Task<List<string>> GetSourceHostsAsync();
        Task<List<string>> GetNetworkConnections();
        Task<NetworkGraphResponseOptimizeDto> ExecuteOptimizedQueryAsync(NetworkGraphRequestDto request);
        Task<List<string>> GetDistinctProtocolsAsync();
        Task<List<string>> GetDistinctProcessAsync();
    }
}
