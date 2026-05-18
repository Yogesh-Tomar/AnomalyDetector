using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnomalyDetectionDashboard.Models
{
    /// <summary>
    /// Supporting Agent model (referenced by both tables)
    /// </summary>
    [Table("Agents")]
    public partial class Agent
    {
        [Key]
        public Guid AgentId { get; set; }

        [Required]
        public string Hostname { get; set; } = string.Empty;

        public string? OsVersion { get; set; }

        public string? Version { get; set; }

        [Required]
        [Column(TypeName = "datetime2(7)")]
        public DateTime FirstSeenUtc { get; set; }

        [Required]
        [Column(TypeName = "datetime2(7)")]
        public DateTime LastSeenUtc { get; set; }

        [Required]
        public bool IsActive { get; set; } = true;

        public Guid? GroupId { get; set; }

        // Navigation properties
        public virtual Group? Group { get; set; }
        public virtual ICollection<Stat> Stats { get; set; } = new List<Stat>();
        public virtual ICollection<Alert> Alerts { get; set; } = new List<Alert>();
        public virtual ICollection<Key> Keys { get; set; } = new List<Key>();
        //public virtual ICollection<RawEvent> RawEvents { get; set; } = new List<RawEvent>();
        public virtual ICollection<ApiKey> ApiKeys { get; set; } = new List<ApiKey>();
        public virtual ICollection<PidsCurrent> PidsCurrent { get; set; } = new List<PidsCurrent>();
    }
}
