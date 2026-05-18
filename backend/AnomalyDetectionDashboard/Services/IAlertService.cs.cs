using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Models;

namespace AnomalyDetectionDashboard.Services
{
    public interface IAlertService
    {
        Task<AlertListResponse> GetAlertsAsync(AlertFilterDto filters);
        Task<AlertWhitelistRule?> GetWhitelistRuleAsync(long ruleId);
        Task<List<AlertWhitelistRule>> GetActiveWhitelistRulesAsync();
        Task<List<AlertDetailedView>> GetAlertSummaryAsync(Guid? agentId = null, long? keyId = null, string? key = null);
        Task<bool> UpdateWhitelistRuleAsync(long ruleId, AlertWhitelistRuleRequest request);
        Task<bool> DeleteWhitelistRuleAsync(long ruleId);
        Task<bool> InvestigateAlertAsync(Guid agentId, DateTime TsUtc, byte Metric, long KeyId);
        Task<bool> MuteAlertAsync(Guid agentId);
        Task<AlertContext?> GetAlertContextAsync(Guid? agentId, long? keyId = null, string? key = null);
        Task<AlertInvestigationDto> GetAlertInvestigationAsync(AlertInvestigationRequest request);
        Task<bool> ExcludeAlertAsync(AlertWhitelistRuleRequest request);
        Task<AlertInvestigationResponse> InvestigateAlertAsync(Guid agentId, DateTime alertTsUtc, long keyId);
        Task<AlertFilterOptionsDto> GetFilterOptionsAsync();
        Task MarkAlertAsReadAsync(Guid agentId, DateTime alertTsUtc, long keyId);
        Task AddNote(Guid agentId, DateTime alertTsUtc, long keyId, string note, string createdBy);

        Task<List<DumpListDto>> GetAllDumpsAsync(DumpsFilterDto filters);
        Task<DumpDetailDto?> GetDumpByIdAsync(Guid dumpId);

        // Added: return distinct values for a given field used by Alerts filtering
        Task<List<string>> GetDistinctValuesAsync(string field);
    }
}
