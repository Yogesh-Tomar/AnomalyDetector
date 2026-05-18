using AnomalyDetectionDashboard.Models;

namespace AnomalyDetectionDashboard.DTOs
{
    public class AlertDto
    {
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public int BucketSeconds { get; set; }
        public byte Metric { get; set; }
        public string User { get; set; }
        public string Process { get; set; }
        public string Key { get; set; }
        public int Count { get; set; }
        public double? Mean { get; set; }
        public double? Std { get; set; }
        public double? ZScore { get; set; }
        public long KeyId { get; set; }
        public string Hostname { get; set; }
        public string Technique { get; set; }
        public bool IsRead { get; set; }
        public bool IsWhitelisted { get; set; }
        public string AnalystNote { get; set; }
    }

    public class AlertListResponse
    {
        public List<AlertDto> Alerts { get; set; } = new List<AlertDto>();
        public int TotalCount { get; set; }
        public bool HasMore { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
    }
    public class AlertInvestigationRequest
    {
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public byte Metric { get; set; }
    }

    public class AlertSummaryRequest
    {
        public Guid? AgentId { get; set; }
        public long? KeyId { get; set; }
        public string? Key { get; set; }
    }

    public class AlertFilterDto
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? User { get; set; }
        public string? Host { get; set; }
        public string? Process { get; set; }
        public bool Unread { get; set; }
        public int Skip { get; set; } = 0;
        public int Take { get; set; } = 50;
    }

    public class DumpsFilterDto
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }        
        public string Malware { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class AlertInvestigationDto
    {
        public AlertDto Alert { get; set; }
        public List<EventSummaryDto> RelatedEvents { get; set; } = new List<EventSummaryDto>();
        public EntityBaselineDto EntityBaseline { get; set; }
        public List<AnalystNote> AnalystNotes { get; set; } = new List<AnalystNote>();
    }

    public class EventSummaryDto
    {
        public short EventId { get; set; }
        public DateTime TsUtc { get; set; }
        public string User { get; set; }
        public string Process { get; set; }
        public string EventData { get; set; }
        public string ProcessPath { get; set; }
        public string CommandLine { get; set; }
        public string ParentImage { get; set; }
        public string Technique { get; set; }
    }

    public class EntityBaselineDto
    {
        public double Mean { get; set; }
        public double StandardDeviation { get; set; }
        public double LowerBound { get; set; }
        public double UpperBound { get; set; }
        public bool Initialized { get; set; }
        public long BucketsSeen { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class ProcessMetadataDto
    {
        public string Path { get; set; }
        public string CommandLine { get; set; }
        public string ParentImage { get; set; }
        public int? ProcessId { get; set; }
        public string Technique { get; set; }
        public string RuleName { get; set; }
    }

    public class AlertFilterOptionsDto
    {
        public List<string> Users { get; set; } = new List<string>();
        public List<string> Hosts { get; set; } = new List<string>();
        public List<string> Processes { get; set; } = new List<string>();
    }   
    public class AlertWhitelistRuleRequest
    {
        public bool IsEnabled { get; set; } = true;
        public byte ScopeType { get; set; } = 0;
        public Guid? GroupId { get; set; }
        public Guid? AgentId { get; set; }
        public byte? Metric { get; set; }
        public short? EventId { get; set; }
        public long? KeyId { get; set; }
        public string? KeyLike { get; set; }
        public string? UserLike { get; set; }
        public DateTime TsUtc { get; set; }
        public string? ProcessLike { get; set; }
        public string? Reason { get; set; }
        public DateTime? EffectiveFromUtc { get; set; }
        public DateTime? EffectiveUntilUtc { get; set; }
        public string? CreatedBy { get; set; }
        public bool Suppress { get; set; } = true;
        public short? AllowedStartHHMM { get; set; }
        public short? AllowedEndHHMM { get; set; }
        public byte? AllowedDaysMask { get; set; }
        public bool IsActive { get; set; } = true;
        public int Priority { get; set; } = 0;
        public DateTime? ValidFromUtc { get; set; }
        public DateTime? ValidUntilUtc { get; set; }
    }
    public class AlertContext
    {
        public Guid AgentId { get; set; }
        public DateTime Time { get; set; }
        public string User { get; set; } = string.Empty;
        public string Host { get; set; } = string.Empty;
        public string Process { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public string EventData { get; set; }
        public long KeyId { get; set; }
        public bool IsRead { get; set; }
        public double ZScore { get; set; }
        public byte Metric { get; set; }
        public int Count { get; set; }
        public bool Initialized { get; set; }
        public double Mean { get; set; }
        public double StandardDeviation { get; set; }
        public long BucketsSeen { get; set; }
        public ProcessMetadata? ProcessMetadata { get; set; }

        public long EventRowId { get; set; }
        public short EventId { get; set; }
        public DateTime EventTsUtc { get; set; }
        public string EventUser { get; set; }
        public string EventProcess { get; set; }
        public string ProcessGuid { get; set; }
        public int? Pid { get; set; }
        public byte EventMetric { get; set; }
        public int MetricMatches { get; set; }
    }

    public class AlertDetailedView
    {
        public Guid AgentId { get; set; }
        public string Key { get; set; } = string.Empty;
        public long KeyId { get; set; }
        public double Mean { get; set; }
        public int BucketSeconds { get; set; }
        public byte Metric { get; set; }
        //public string User { get; set; } = string.Empty;
        public string Process { get; set; } = string.Empty;
        public double? Std { get; set; }
        public double? Z { get; set; }
        public bool IsRead { get; set; } = false;
        public string? AnalystNote { get; set; }
        public bool IsMuted { get; set; } = false;
        public DateTime UpdatedUtc { get; set; }
        public string EventData { get; set; } = string.Empty;
        public long EventRowId { get; set; }
        public short EventId { get; set; }
        public DateTime EventTsUtc { get; set; }
        public string EventUser { get; set; }
        public string EventProcess { get; set; }
        public string ProcessGuid { get; set; }
        public int? Pid { get; set; }
        public byte EventMetric { get; set; }
        public int MetricMatches { get; set; }
    }
    public class ProcessMetadata
    {
        public string Path { get; set; } = string.Empty;
        public string CommandLine { get; set; } = string.Empty;
        public string? Sha256 { get; set; }
        public string? Publisher { get; set; }
        public string? ParentProcess { get; set; }
    }

    public class SettingsResponse
    {
        public WebhookSettings Webhook { get; set; } = new();
        public SyslogSettings Syslog { get; set; } = new();
        public bool AutoLockUser { get; set; }
    }

    public class SettingsRequest
    {
        public WebhookSettings Webhook { get; set; } = new();
        public SyslogSettings Syslog { get; set; } = new();
        public bool AutoLockUser { get; set; }
    }

    public class SyslogSettings
    {
        public bool Enabled { get; set; }
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
    }

}
