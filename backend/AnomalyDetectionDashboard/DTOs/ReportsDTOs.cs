namespace AnomalyDetectionDashboard.DTOs
{
    public class AgentHealthReport
    {
        public AgentHealthSummary Summary { get; set; } = new();
        public List<AgentHealthDetail> OldestAgents { get; set; } = new();
    }

    public class AgentHealthSummary
    {
        public int Active24h { get; set; }
        public int Inactive24h { get; set; }
    }

    public class AgentHealthDetail
    {
        public Guid AgentId { get; set; }
        public string Hostname { get; set; } = string.Empty;
        public DateTime LastSeenUtc { get; set; }
    }

    public class AlertHeatmapEntry
    {
        public string WeekdayName { get; set; } = string.Empty;
        public int WeekdayNum { get; set; }
        public int Hour { get; set; }
        public byte Metric { get; set; }
        public int Count { get; set; }
    }

    public class SuppressionTrendEntry
    {
        public DateTime Date { get; set; }
        public int Whitelisted { get; set; }
        public int Muted { get; set; }
        public int Actionable { get; set; }
    }

    public class EventDuplicateRateEntry
    {
        public DateTime Date { get; set; }
        public int TotalRows { get; set; }
        public int UniqueEvents { get; set; }
        public decimal DuplicateRate { get; set; }
    }

    public class EntityInitCoverageEntry
    {
        public Guid AgentId { get; set; }
        public decimal PercentInitialized { get; set; }
        public int TotalEntities { get; set; }
    }

    public class AlertSeverityEntry
    {
        public DateTime Bucket { get; set; }
        public string Severity { get; set; } = string.Empty;
        public int Alerts { get; set; }
    }

    public class AlertZDistributionEntry
    {
        public byte Metric { get; set; }
        public decimal Z_Bin { get; set; }
        public int Cnt { get; set; }
    }

    public class AlertTopKeysByZLoadEntry
    {
        public string Key { get; set; } = string.Empty;
        public double ZLoad { get; set; }
        public int AlertCount { get; set; }
    }

    public class AlertBacklogStatus
    {
        public int OpenAlerts { get; set; }
        public int WhitelistedAlerts { get; set; }
        public int MutedAlerts { get; set; }
    }

    public class AlertAgeHistogramEntry
    {
        public int AgeHoursBin { get; set; }
        public int Count { get; set; }
    }

    public class EventFirstSeenKeyEntry
    {
        public string Key { get; set; } = string.Empty;
        public Guid AgentId { get; set; }
        public DateTime FirstSeenUtc { get; set; }
    }

    public class EntityDriftDailyEntry
    {
        public DateTime Date { get; set; }
        public int EntitiesDrifted { get; set; }
    }

    public class EntityTopDriftedAgentEntry
    {
        public Guid AgentId { get; set; }
        public int DriftTotal { get; set; }
    }

    public class NoiseByAgentEntry
    {
        public Guid AgentId { get; set; }
        public int AlertCount { get; set; }
        public string Hostname { get; set; } = string.Empty;
    }

    public class NoiseByUserEntry
    {
        public string User { get; set; } = string.Empty;
        public int AlertCount { get; set; }
        public string Hostname { get; set; } = string.Empty;
    }

    public class NoiseByProcessEntry
    {
        public string Process { get; set; } = string.Empty;
        public int AlertCount { get; set; }
        public string Hostname { get; set; } = string.Empty;
    }

    public class AlertsVsEntitiesBaselineEntry
    {
        public string Key { get; set; } = string.Empty;
        public int CurrentCount { get; set; }
        public double Mean { get; set; }
        public double ZScore { get; set; }
    }

    public class ProcessNetworkFileSequenceEntry
    {
        public Guid AgentId { get; set; }
        public string? Hostname { get; set; }
        public DateTime ProcessTimestamp { get; set; }
        public string? ProcessImagePath {get; set;}
        public string? DestinationIp { get; set; }
        public int? DestinationPort { get; set; }
        public DateTime NetworkTimestamp { get; set; }
        public string? TargetFilename { get; set; }
        public DateTime? FileTimestamp { get; set; }
    }

    public class ProcessingFunnel
    {
        public int EventsCount { get; set; }
        public int StatsRecordCount { get; set; }

        public int AlertsVisibleCount { get; set; }
    }
}
