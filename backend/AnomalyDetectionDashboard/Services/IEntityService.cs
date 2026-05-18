using AnomalyDetectionDashboard.DTOs;

namespace AnomalyDetectionDashboard.Services
{
    public interface IEntityService
    {
        Task<(List<EntityResponse> Entities, int TotalCount, EntitySummary Summary)> GetEntitiesAsync(EntityFilters filters);
        Task<List<EntityDetailedView>> GetEntitySummaryAsync(Guid? agentId = null, long? keyId = null, string? key = null);
    }
}
