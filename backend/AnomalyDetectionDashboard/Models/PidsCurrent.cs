using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnomalyDetectionDashboard.Models
{
    /// <summary>
    /// Represents currently tracked processes by PID for each agent
    /// </summary>
    [Table("PidsCurrent")]
    public class PidsCurrent
    {
        public Guid AgentId { get; set; }
        public int Pid { get; set; }
        [StringLength(1024)]
        public string Key { get; set; } = string.Empty;

        [StringLength(64)]
        public string? ProcessGuid { get; set; }

        [Required]
        [StringLength(256)]
        public string User { get; set; } = string.Empty;

        [Required]
        [StringLength(512)]
        public string Process { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "datetime2(3)")]
        public DateTime FirstSeenUtc { get; set; }

        [Required]
        [Column(TypeName = "datetime2(3)")]
        public DateTime LastSeenUtc { get; set; }

        [Required]
        [StringLength(8)]
        public string LastMetric { get; set; } = string.Empty;

        public long KeyId { get; set; }

        // Navigation properties
        [ForeignKey("AgentId")]
        public virtual Agent? Agent { get; set; }

        [ForeignKey("KeyId")]
        public virtual Key? KeyEntity { get; set; }
    }
}
