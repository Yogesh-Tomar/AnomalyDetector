namespace AnomalyDetectionDashboard.Models
{
    public class Entity
    {
        public Guid AgentId { get; set; }
        public string Key { get; set; } = string.Empty;
        public long KeyId { get; set; }
        public double Mean { get; set; }
        public double Var { get; set; }
        public bool Initialized { get; set; }
        public double EwmaAlpha { get; set; }
        public long BucketsSeen { get; set; }
        public DateTime UpdatedUtc { get; set; }
    }
}
