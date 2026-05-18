namespace AnomalyDetectionDashboard.DTOs
{
    public class DumpDetailDto
    {
        public Guid DumpId { get; set; }
        public Guid AgentId { get; set; }
        public string FileName { get; set; }
        public long SizeBytes { get; set; }
        public string Sha256Hex { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedUtc { get; set; }
        public DateTime? VerifiedUtc { get; set; }
        public byte[] RowVersion { get; set; }
        public bool? IsAnalized { get; set; }
        public bool? Malware { get; set; }
        public string? Categorie { get; set; }
        public byte? Stage1Pred { get; set; }
        public double? Stage1Score { get; set; }
        public byte? Stage2Pred { get; set; }
        public double? Stage2Proba { get; set; }
        public string? Stage2Category { get; set; }
        public double? Stage2CategoryConf { get; set; }
        public DateTime? AnalysisUtc { get; set; }
        public string? AnalysisModelBin { get; set; }
        public string? AnalysisModelCat { get; set; }
        public int? FeatureCount { get; set; }
        public int? ExtractionMs { get; set; }
        public string? CatTopKJson { get; set; }
    }
}
