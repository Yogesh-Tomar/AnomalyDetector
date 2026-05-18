using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnomalyDetectionDashboard.Models
{
    [Table("Dumps")]
    public class Dump
    {
        [Key]
        public Guid DumpId { get; set; }

        [Required]
        public Guid AgentId { get; set; }

        [Required, MaxLength(260)]
        public string FileName { get; set; }

        [Required]
        public long SizeBytes { get; set; }

        [Required, MaxLength(64)]
        public string Sha256Hex { get; set; }

        public int? Status { get; set; }

        [Column(TypeName = "datetime2(3)")]
        public DateTime CreatedUtc { get; set; }

        [Column(TypeName = "datetime2(3)")]
        public DateTime? VerifiedUtc { get; set; }

        [Timestamp]
        public byte[] RowVersion { get; set; }

        public bool? IsAnalized { get; set; }
        public bool? Malware { get; set; }
        public string? Categorie { get; set; }
        public byte? Stage1Pred { get; set; }
        public float? Stage1Score { get; set; }
        public byte? Stage2Pred { get; set; }
        public float? Stage2Proba { get; set; }
        public string? Stage2Category { get; set; }
        public float? Stage2CategoryConf { get; set; }

        [Column(TypeName = "datetime2(3)")]
        public DateTime? AnalysisUtc { get; set; }

        public string? AnalysisModelBin { get; set; }
        public string? AnalysisModelCat { get; set; }
        public int? FeatureCount { get; set; }
        public int? ExtractionMs { get; set; }
        public string? CatTopKJson { get; set; }

        // Navigation property (optional)
        [ForeignKey(nameof(AgentId))]
        public virtual Agent Agent { get; set; }
    }
}
