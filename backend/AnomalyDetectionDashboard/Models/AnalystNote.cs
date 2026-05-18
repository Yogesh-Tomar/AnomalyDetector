using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnomalyDetectionDashboard.Models
{
    public class AnalystNote
    {
        [Key]
        public long NoteId { get; set; }

        // Foreign key to Alert (composite key)
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public byte Metric { get; set; }
        public long KeyId { get; set; }

        [Required]
        public string Note { get; set; } = string.Empty;

        [Required]
        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

        // Navigation property (optional)
        [ForeignKey(nameof(AgentId) + "," + nameof(TsUtc) + "," + nameof(Metric) + "," + nameof(KeyId))]
        public Alert? Alert { get; set; }
    }
}
