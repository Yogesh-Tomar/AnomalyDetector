using AnomalyDetectionDashboard.Services;

namespace AnomalyDetectionDashboard.Models
{
    public class Alert
    {
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public int BucketSeconds { get; set; }
        public byte Metric { get; set; }
        public string User { get; set; } = string.Empty;
        public string Process { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public int Count { get; set; }
        public double? Mean { get; set; }
        public double? Std { get; set; }
        public double? Z { get; set; }
        public long KeyId { get; set; }
        public bool IsVisible { get; set; }
        public bool IsWhitelisted { get; set; }
        public long? WhitelistRuleId { get; set; }

        // New columns
        public bool IsRead { get; set; } = false;
        public string? AnalystNote { get; set; }
        public bool IsMuted { get; set; } = false;
    }
}
