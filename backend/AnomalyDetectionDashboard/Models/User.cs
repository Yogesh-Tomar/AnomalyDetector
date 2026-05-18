using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnomalyDetectionDashboard.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long UserId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column(TypeName = "nvarchar(100)")]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [EmailAddress]
        [Column(TypeName = "nvarchar(255)")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public string? FullName { get; set; }

        // Password is nullable for SSO users
        [MaxLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public string? PasswordHash { get; set; }

        [MaxLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public string? Salt { get; set; }

        [Required]
        [MaxLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        public string Role { get; set; } = "analyst"; // admin or analyst

        [Required]
        public bool IsActive { get; set; } = true;

        [Column(TypeName = "datetime2")]
        public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime2")]
        public DateTime? LastLoginUtc { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? PasswordUpdatedUtc { get; set; }

        // Azure AD Integration Fields
        [MaxLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public string? AzureAdId { get; set; } // Object ID from Azure AD

        [MaxLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        public string AuthType { get; set; } = "local"; // local or microsoft

        [MaxLength(500)]
        [Column(TypeName = "nvarchar(500)")]
        public string? AzureGroups { get; set; } // Comma-separated group IDs

        // Navigation properties (if needed)
        //public virtual ICollection<Alert>? Alerts { get; set; }
        //public virtual ICollection<AuditLog>? AuditLogs { get; set; }

        // Computed properties
        [NotMapped]
        public bool IsSsoUser => AuthType == "microsoft" && !string.IsNullOrEmpty(AzureAdId);

        [NotMapped]
        public bool RequiresPasswordReset =>
            AuthType == "local" &&
            PasswordUpdatedUtc.HasValue &&
            (DateTime.UtcNow - PasswordUpdatedUtc.Value).Days > 90; // 90-day password policy

        // Helper methods
        public bool CanAuthenticate()
        {
            return IsActive && (IsSsoUser || !string.IsNullOrEmpty(PasswordHash));
        }

        public List<string> GetAzureGroupsList()
        {
            if (string.IsNullOrEmpty(AzureGroups))
                return new List<string>();

            return AzureGroups.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(g => g.Trim())
                .ToList();
        }

        public void SetAzureGroups(IEnumerable<string> groups)
        {
            AzureGroups = string.Join(",", groups ?? Enumerable.Empty<string>());
        }
    }
}
