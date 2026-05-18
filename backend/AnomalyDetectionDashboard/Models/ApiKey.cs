using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnomalyDetectionDashboard.Models
{
    /// <summary>
    /// API keys for agent authentication
    /// </summary>
    [Table("ApiKeys")]
    public class ApiKey
    {
        [Key]
        [StringLength(450)]
        public string KeyHash { get; set; } = string.Empty;

        [Required]
        public Guid AgentId { get; set; }

        [Required]
        [Column(TypeName = "datetime2(7)")]
        public DateTime CreatedUtc { get; set; }

        [Column(TypeName = "datetime2(7)")]
        public DateTime? ExpiresUtc { get; set; }

        [Required]
        public bool IsActive { get; set; } = true;

        // Navigation property
        [ForeignKey("AgentId")]
        public virtual Agent? Agent { get; set; }
    }
}
