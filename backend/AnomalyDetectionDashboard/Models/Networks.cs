namespace AnomalyDetectionDashboard.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("Networks")]
    public class Network
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long NetworkId { get; set; }

        [Required]
        [MaxLength(64)]
        public string Subnetz { get; set; } = string.Empty;

        [MaxLength(256)]
        public string? Description { get; set; }

        [Required]
        public DateTime CreatedUtc { get; set; }
    }
}
