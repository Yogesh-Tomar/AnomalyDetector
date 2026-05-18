using System.Text.Json.Serialization;

namespace AnomalyDetectionDashboard.DTOs
{
    public class CmdbBulkUpsertRequest
    {
        public List<CmdbBulkUpsertEntry> Entries { get; set; } = new();
    }

    public class CmdbBulkUpsertEntry
    {
        public string IpAddress { get; set; } = string.Empty;
        public string? Hostname { get; set; }

        [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
        public long? NetworkId { get; set; }
    }

    public class CmdbBulkUpsertError
    {
        public string? IpAddress { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class CmdbBulkUpsertResponse
    {
        public int Inserted { get; set; }
        public int Updated { get; set; }
        public int Failed { get; set; }
        public List<CmdbBulkUpsertError> Errors { get; set; } = new();
    }
}
