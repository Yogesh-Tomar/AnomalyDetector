namespace AnomalyDetectionDashboard.DTOs
{
    public class DumpListDto
    {
        public Guid DumpId { get; set; }
        public Guid AgentId { get; set; }
        public string FileName { get; set; }
        public long SizeBytes { get; set; }
        public DateTime CreatedUtc { get; set; }
        public bool? IsAnalized { get; set; }
        public bool? Malware { get; set; }
        public string? Status { get; set; }
    }
}
