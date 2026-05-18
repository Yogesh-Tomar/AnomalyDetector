namespace AnomalyDetectionDashboard.DTOs
{
    public class GroupResponse
    {
        public Guid GroupId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? ConfigurationId { get; set; }
        public string ConfigurationName { get; set; } = string.Empty;
        public List<Guid> AgentIds { get; set; } = new();
        public int AgentCount { get; set; }
        public DateTime CreatedUtc { get; set; }
        public DateTime UpdatedUtc { get; set; }
    }

    public class AgentDropdownItem
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CreateGroupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? ConfigurationId { get; set; }
    }

    public class UpdateGroupRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public Guid? ConfigurationId { get; set; }
    }
}