using System.ComponentModel.DataAnnotations;

namespace AnomalyDetectionDashboard.Models
{
    // Updated Group model to include ConfigState relationship
    public partial class Group
    {
        [Key]
        public Guid GroupId { get; set; }

        [Required]
        [MaxLength(128)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(512)]
        public string? Description { get; set; }

        public Guid? ConfigStateId { get; set; }

        public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedUtc { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ConfigState? ConfigState { get; set; }
        public virtual ICollection<Agent> Agents { get; set; } = new List<Agent>();
    }
}
