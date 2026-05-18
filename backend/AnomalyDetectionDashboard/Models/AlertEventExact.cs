namespace AnomalyDetectionDashboard.Models
{
    public class AlertEventExact
    {
        public Guid AgentId { get; set; }
        public DateTime AlertTsUtc { get; set; }
        public int AlertBucketSeconds { get; set; }
        public byte AlertMetric { get; set; }
        public long KeyId { get; set; }
        public string AlertKey { get; set; }
        public string AlertUser { get; set; }
        public string AlertProcess { get; set; }
        public int Count { get; set; }
        public double Mean { get; set; }
        public double Std { get; set; }
        public double Z { get; set; }
        public bool IsVisible { get; set; }
        public bool IsWhitelisted { get; set; }
        public bool IsRead { get; set; }
        public bool IsMuted { get; set; }
        public long? WhitelistRuleId { get; set; }
        public string AnalystNote { get; set; }

        public long EventRowId { get; set; }
        public short EventId { get; set; }
        public DateTime EventTsUtc { get; set; }
        public string EventUser { get; set; }
        public string EventProcess { get; set; }
        public string ProcessGuid { get; set; }
        public int? Pid { get; set; }
        public byte EventMetric { get; set; }
        public int MetricMatches { get; set; }

        public string Image { get; set; }
        public string TargetFilename { get; set; }
        public string ImageLoaded { get; set; }
        public string DestinationIp { get; set; }
        public string DestinationPort { get; set; }
        //public string CommandLine { get; set; }
        //public string ParentImage { get; set; }
        //public string TargetObject { get; set; }
        //public string QueryName { get; set; }
        //public string Protocol { get; set; }
        //public string SourceIp { get; set; }
        //public string SourcePort { get; set; }

        //public string TechniqueId { get; set; }
        //public string TechniqueName { get; set; }
        //public string TechniqueRisk { get; set; }
        //public string EventType { get; set; }
        //public int SecondsFromAlertStart { get; set; }
    }

    // DTOs
    public class AlertInvestigationResponse
    {
        public AlertEventExact AlertInfo { get; set; }
        public List<AlertEventExact> RelatedEvents { get; set; }
        public List<string> TechniquesDetected { get; set; }
        public Dictionary<string, int> EventTypeCounts { get; set; }
    }
}
