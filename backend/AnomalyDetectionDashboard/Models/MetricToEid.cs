using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnomalyDetectionDashboard.Models
{
    // MetricToEid mapping model
    public class MetricToEid
    {
        [Key, Column(Order = 0)]
        public byte Metric { get; set; }

        [Key, Column(Order = 1)]
        public short Eid { get; set; }

        // Navigation property
        public virtual DimMetric? MetricEntity { get; set; }
    }
}
