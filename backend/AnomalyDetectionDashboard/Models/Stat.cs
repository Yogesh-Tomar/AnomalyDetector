using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnomalyDetectionDashboard.Models
{
    // Stat model - represents aggregated statistics for anomaly detection
    public class Stat
    {
        [Key, Column(Order = 0)]
        public Guid AgentId { get; set; }

        [Key, Column(Order = 1)]
        public DateTime TsUtc { get; set; }

        [Key, Column(Order = 2)]
        public byte Metric { get; set; }

        [Key, Column(Order = 3)]
        public long KeyId { get; set; }

        public int BucketSeconds { get; set; }

        [MaxLength(256)]
        public string User { get; set; } = string.Empty;

        [MaxLength(512)]
        public string Process { get; set; } = string.Empty;

        [MaxLength(1024)]
        public string Key { get; set; } = string.Empty;

        public int Count { get; set; }

        // Navigation properties
        public virtual Agent? Agent { get; set; }
        public virtual Models.Key? KeyEntity { get; set; }
        public virtual DimMetric? MetricEntity { get; set; }
    }
}
