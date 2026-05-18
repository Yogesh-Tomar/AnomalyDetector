using System.ComponentModel.DataAnnotations;

namespace AnomalyDetectionDashboard.Models
{
    // Key model - normalized key storage with hash-based deduplication
    //public class Key
    //{
    //    [Key]
    //    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    //    public long KeyId { get; set; }

    //    public Guid AgentId { get; set; }

    //    [Required]
    //    [MaxLength(1024)]
    //    public string KeyValue { get; set; } = string.Empty;

    //    // Computed columns - these are calculated by the database
    //    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    //    public byte[]? KeyHash { get; set; }

    //    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    //    [MaxLength(128)]
    //    public string? KeyPrefix { get; set; }

    //    // Navigation properties
    //    public virtual Agent? Agent { get; set; }
    //    public virtual ICollection<Stat> Stats { get; set; } = new List<Stat>();
    //    public virtual ICollection<Alert> Alerts { get; set; } = new List<Alert>();
    //    public virtual ICollection<RawEvent> RawEvents { get; set; } = new List<RawEvent>();
    //    public virtual ICollection<PidsCurrent> PidsCurrent { get; set; } = new List<PidsCurrent>();
    //}

    // Supporting model for metric dimensions
    public class DimMetric
    {
        [Key]
        public byte Metric { get; set; }

        [Required]
        [MaxLength(32)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(16)]
        public string Source { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Stat> Stats { get; set; } = new List<Stat>();
        public virtual ICollection<MetricToEid> MetricToEids { get; set; } = new List<MetricToEid>();
    }
}
