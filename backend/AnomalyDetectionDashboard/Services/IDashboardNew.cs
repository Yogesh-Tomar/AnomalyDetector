using AnomalyDetectionDashboard.DTOs;

namespace AnomalyDetectionDashboard.Services
{
    public interface IDashboardNew
    {
        Task<AgentHealthSummary> GetReportAgentHealth(DateTime from, DateTime to);
        Task<IList<AlertHeatmapEntry>> GetAlertsHeatmap(DateTime from, DateTime to);
        Task<IList<SuppressionTrendEntry>> GetSuppressionsTrend(DateTime from, DateTime to);
        Task<IList<EventDuplicateRateEntry>> GetEventsDuplicateRate(DateTime from, DateTime to);
        Task<IList<EntityInitCoverageEntry>> GetEntitiesInitCoverage();
        Task<IList<AlertSeverityEntry>> GetAlertsBySeverity(DateTime from, DateTime to, Guid? agentId = null, byte? metric = null);
        Task<IList<AlertZDistributionEntry>> GetAlertsZDistribution(
            DateTime from,
            DateTime to,
            byte? metric = null,
            decimal binStep = 0.5m);

        Task<IList<AlertTopKeysByZLoadEntry>> GetAlertsTopKeysByZLoad(
            DateTime from,
            DateTime to,
            int top = 20);

        Task<AlertBacklogStatus> GetAlertsBacklogStatus(DateTime from, DateTime to);
        Task<IList<AlertAgeHistogramEntry>> GetAlertsOpenAgeHistogram(DateTime from, DateTime to, int binHours = 6);
        Task<IList<EventFirstSeenKeyEntry>> GetEventsFirstSeenKeys(
            DateTime from,
            DateTime to,
            int top = 200);

        Task<IList<EntityDriftDailyEntry>> GetEntitiesDriftDaily(DateTime from, DateTime to);
        Task<IList<EntityTopDriftedAgentEntry>> GetEntitiesTopDriftedAgents(int top = 20);
        Task<IList<NoiseByAgentEntry>> GetNoiseTopAgents(
            DateTime from,
            DateTime to,
            int top = 10);

        Task<IList<NoiseByUserEntry>> GetNoiseTopUsers(
            DateTime from,
            DateTime to,
            int top = 10);

        Task<IList<NoiseByProcessEntry>> GetNoiseTopProcesses(
            DateTime from,
            DateTime to,
            int top = 10);

        Task<IList<AlertsVsEntitiesBaselineEntry>> GetAlertsVsEntitiesBaseline(
            DateTime from,
            DateTime to);

        Task<IList<ProcessNetworkFileSequenceEntry>> GetSequenceProcNetFile(
            DateTime from,
            DateTime to,
            int windowMinutes = 5,
            int top = 100);

        Task<ProcessingFunnel> GetProcessingFunnel(
            DateTime from,
            DateTime to);
    }
}
