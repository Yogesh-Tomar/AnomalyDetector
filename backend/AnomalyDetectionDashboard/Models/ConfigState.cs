using System.ComponentModel.DataAnnotations;

namespace AnomalyDetectionDashboard.Models
{
    //public class Group
    //{
    //    public int GroupId { get; set; }

    //    [Required, StringLength(128)]
    //    public string Name { get; set; } = string.Empty;

    //    public string? Description { get; set; }
    //    public Guid? ConfigStateId { get; set; }
    //    public DateTime CreatedUtc { get; set; }
    //    public DateTime UpdatedUtc { get; set; }
    //}

    public class ConfigState
    {
        [Key]
        public Guid ConfigStateId { get; set; }

        [Required]
        public string Json { get; set; } = string.Empty;

        [MaxLength(64)]
        public string? JsonHash { get; set; }

        public int? Version { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

        public DateTime? EffectiveFromUtc { get; set; }

        public DateTime? EffectiveUntilUtc { get; set; }

        [Timestamp]
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();

        [MaxLength(128)]
        public string? ConfigName { get; set; }

        // Navigation properties
        public virtual ICollection<Group> Groups { get; set; } = new List<Group>();
    }
}
