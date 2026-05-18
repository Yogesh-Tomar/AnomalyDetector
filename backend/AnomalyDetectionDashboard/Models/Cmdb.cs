using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnomalyDetectionDashboard.Models
{
    [Table("Cmdb")]
    public class Cmdb
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long CmdbId { get; set; }

        [Required]
        [MaxLength(45)]
        public string IpAddress { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Hostname { get; set; }

        public long? NetworkId { get; set; }

        [Required]
        public DateTime CreatedUtc { get; set; }
    }
}
