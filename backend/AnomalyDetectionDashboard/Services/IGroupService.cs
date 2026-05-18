using AnomalyDetectionDashboard.DTOs;

namespace AnomalyDetectionDashboard.Services
{
    public interface IGroupService
    {
        Task<List<GroupResponse>> GetGroupsAsync();
        Task<GroupResponse?> GetGroupAsync(Guid id);
        Task<List<AgentDropdownItem>> GetAgentDropdownAsync();
        Task<GroupResponse?> CreateGroupAsync(CreateGroupRequest request);
        Task<bool> UpdateGroupAsync(Guid id, UpdateGroupRequest request);
        Task<bool> DeleteGroupAsync(Guid id);
        Task<bool> AssignAgentsAsync(Guid groupId, List<Guid> agentIds);
    }
}
