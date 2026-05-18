using System.ComponentModel.DataAnnotations;

namespace AnomalyDetectionDashboard.Models
{
    public class Setting
    {
        [Required, StringLength(128)]
        public string SettingKey { get; set; } = string.Empty;

        [Required]
        public string SettingValue { get; set; } = string.Empty;

        public DateTime UpdatedUtc { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
