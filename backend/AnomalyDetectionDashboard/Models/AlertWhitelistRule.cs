using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnomalyDetectionDashboard.Models
{
    [Table("AlertWhitelistRule")]
    public class AlertWhitelistRule
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long RuleId { get; set; }

        public bool IsEnabled { get; set; }
        public byte ScopeType { get; set; }
        public Guid? GroupId { get; set; }
        public Guid? AgentId { get; set; }
        public byte? Metric { get; set; }
        public short? EventId { get; set; }
        public long? KeyId { get; set; }
        [MaxLength(1024)]
        public string? KeyLike { get; set; }
        [MaxLength(256)]
        public string? UserLike { get; set; }
        [MaxLength(512)]
        public string? ProcessLike { get; set; }

        [MaxLength(256)]
        public string? Reason { get; set; }
        public DateTime? EffectiveFromUtc { get; set; }
        public DateTime? EffectiveUntilUtc { get; set; }
        public DateTime CreatedUtc { get; set; }
        [MaxLength(128)]
        public string? CreatedBy { get; set; }
        public bool Suppress { get; set; }
        public short? AllowedStartHHMM { get; set; }
        public short? AllowedEndHHMM { get; set; }
        public byte? AllowedDaysMask { get; set; }
        public bool IsActive { get; set; }
        public int Priority { get; set; }
        public DateTime? ValidFromUtc { get; set; }
        public DateTime? ValidUntilUtc { get; set; }
    }
}
