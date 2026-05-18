namespace AnomalyDetectionDashboard.DTOs
{
    public class ConfigurationResponse
    {
        public Guid ConfigStateId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Json { get; set; } = string.Empty;
        public int Version { get; set; }
        public bool IsActive { get; set; }
        public bool IsUsed { get; set; }
        public Guid? UsedByGroupId { get; set; }
        public string? UsedByGroupName { get; set; }
        public DateTime CreatedUtc { get; set; }
        public DateTime? EffectiveFromUtc { get; set; }
        public DateTime? EffectiveUntilUtc { get; set; }
    }

    public class ConfigurationDropdownItem
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CreateConfigurationRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Json { get; set; } = string.Empty;
        public DateTime? EffectiveFromUtc { get; set; }
        public DateTime? EffectiveUntilUtc { get; set; }
    }

    public class UpdateConfigurationRequest
    {
        public string? Name { get; set; }
        public string? Json { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? EffectiveFromUtc { get; set; }
        public DateTime? EffectiveUntilUtc { get; set; }
    }
}
