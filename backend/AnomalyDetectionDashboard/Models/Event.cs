using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnomalyDetectionDashboard.Models
{
    public class Event
    {
        [Key]
        public long EventRowId { get; set; }

        [Required]
        public Guid AgentId { get; set; }

        [Required]
        public short EventId { get; set; }

        [Required]
        public DateTime TsUtc { get; set; }

        [Required]
        public long KeyId { get; set; }

        [Required]
        [MaxLength(1024)]
        public string Key { get; set; } = string.Empty;

        [MaxLength(256)]
        public string? User { get; set; }

        [MaxLength(512)]
        public string? Process { get; set; }

        [MaxLength(64)]
        public string? ProcessGuid { get; set; }

        public int? Pid { get; set; }

        public int? BucketSeconds { get; set; }

        [Required]
        public string EventData { get; set; } = string.Empty;

        // Computed columns (read-only, not mapped for insert/update)
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public string? KeyHash { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public string? EventHash { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public byte? Metric { get; private set; }
    }
}