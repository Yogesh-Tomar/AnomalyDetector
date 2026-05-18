using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Text.Json;

namespace AnomalyDetectionDashboard.Services
{
    public class EntityService : IEntityService
    {
        private readonly AnomalyDbContext _context;

        public EntityService(AnomalyDbContext context)
        {
            _context = context;
        }

        public async Task<(List<EntityResponse> Entities, int TotalCount, EntitySummary Summary)> GetEntitiesAsync(EntityFilters filters)
        {
            var query = _context.Entities.AsQueryable();

            // Apply filters
            if (filters.Initialized.HasValue)
                query = query.Where(e => e.Initialized == filters.Initialized.Value);

            if (filters.Stale.HasValue)
            {
                var cutoffTime = DateTime.UtcNow.AddHours(-24);
                if (filters.Stale.Value)
                    query = query.Where(e => e.UpdatedUtc < cutoffTime);
                else
                    query = query.Where(e => e.UpdatedUtc >= cutoffTime);
            }

            if (!string.IsNullOrEmpty(filters.Query))
                query = query.Where(e => e.Key.Contains(filters.Query));

            if (filters.From.HasValue)
                query = query.Where(e => e.UpdatedUtc >= filters.From.Value);

            if (filters.To.HasValue)
                query = query.Where(e => e.UpdatedUtc <= filters.To.Value.AddDays(1)); // Include full day

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Calculate summary metrics
            var totalAgents = await _context.Agents.CountAsync();
            var activeAgents = await _context.Agents.CountAsync(a => a.IsActive);
            var initializedCount = await _context.Entities.CountAsync(e => e.Initialized);
            var totalEntities = await _context.Entities.CountAsync();

            var summary = new EntitySummary
            {
                ActiveAgents = activeAgents,
                TotalAgents = totalAgents,
                InitializedCount = initializedCount,
                InitializedPercentage = totalEntities > 0 ? (double)initializedCount / totalEntities * 100 : 0
            };

            // Apply pagination
            var skip = (filters.Page ?? 0) * (filters.PageSize ?? 100);
            var entities = await query
                .OrderByDescending(e => e.UpdatedUtc)
                .Skip(skip)
                .Take(filters.PageSize ?? 100)
                .Select(e => new EntityResponse
                {
                    AgentId = e.AgentId,
                    KeyId = e.KeyId,
                    Key = e.Key,
                    Mean = e.Mean,
                    Var = e.Var,
                    Initialized = e.Initialized,
                    EwmaAlpha = e.EwmaAlpha,
                    BucketsSeen = e.BucketsSeen,
                    UpdatedUtc = e.UpdatedUtc,
                    IsStale = e.UpdatedUtc < DateTime.UtcNow.AddHours(-24)
                })
                .ToListAsync();

            return (entities, totalCount, summary);
        }
       
        public async Task<List<EntityDetailedView>> GetEntitySummaryAsync(Guid? agentId = null, long? keyId = null, string? key = null)
        {
            var cutoffTime = DateTime.UtcNow.AddHours(-24);

            var entityQuery = _context.Entities.AsQueryable();
            var eventQuery = _context.Events.AsQueryable();

            if (keyId.HasValue)
            {
                entityQuery = entityQuery.Where(e => e.KeyId == keyId.Value);
                eventQuery = eventQuery.Where(ev => ev.KeyId == keyId.Value);
            }

            var result = await (
                from en in entityQuery
                join ev in eventQuery
                    on new { en.KeyId } equals new { ev.KeyId } into joined
                from ev in joined.DefaultIfEmpty()
                where en.AgentId != Guid.Empty && ev.AgentId != Guid.Empty
                select new
                {
                    // Agent properties
                    AgentId = en.AgentId,
                    Key = en.Key,
                    KeyId = en.KeyId,
                    Mean = en.Mean,
                    Var = en.Var,
                    Initialized = en.Initialized,
                    EwmaAlpha = en.EwmaAlpha,
                    BucketsSeen = en.BucketsSeen,

                    // Event properties (null-safe)
                    EventRowId = ev != null ? ev.EventRowId : 0,
                    EventData = ev != null ? ev.EventData : string.Empty,
                    EventId = ev != null ? ev.EventId : (short)0,
                    EventTsUtc = ev != null ? ev.TsUtc : DateTime.MinValue,
                    EventUser = ev != null ? ev.User : string.Empty,
                    EventProcess = ev != null ? ev.Process : string.Empty,
                    ProcessGuid = ev != null ? ev.ProcessGuid : string.Empty,
                    Pid = ev != null ? ev.Pid : null
                })
                .Take(5)
                .ToListAsync();

            return result.Select(r => {
                var processMetadata = ExtractProcessMetadata(r.EventData);
                return new EntityDetailedView
                {
                    AgentId = r.AgentId,
                    Key = r.Key,
                    KeyId = r.KeyId,
                    Mean = r.Mean,
                    Var = r.Var,
                    Initialized = r.Initialized,
                    EwmaAlpha = r.EwmaAlpha,
                    BucketsSeen = r.BucketsSeen,
                    EventRowId = r.EventRowId,
                    EventData = r.EventData,
                    EventId = r.EventId,
                    EventTsUtc = r.EventTsUtc,
                    EventUser = r.EventUser,
                    EventProcess = processMetadata?.Path ?? r.EventProcess, // Use extracted process path if available
                    ProcessGuid = r.ProcessGuid,
                    Pid = processMetadata?.ProcessId ?? r.Pid // Use extracted PID if available
                };
            }).ToList() ?? new List<EntityDetailedView>();
        }

        private ProcessMetadataDto ExtractProcessMetadata(string eventDataJson)
        {
            if (string.IsNullOrEmpty(eventDataJson))
                return null;

            try
            {
                using var doc = JsonDocument.Parse(eventDataJson);
                var root = doc.RootElement;

                var ruleName = root.TryGetProperty("RuleName", out var ruleNameProp) ? ruleNameProp.GetString() : null;
                var technique = ExtractTechniqueFromRuleName(ruleName);

                return new ProcessMetadataDto
                {
                    Path = root.TryGetProperty("Image", out var imageProp) ? imageProp.GetString() : null,
                    CommandLine = root.TryGetProperty("CommandLine", out var cmdProp) ? cmdProp.GetString() : null,
                    ParentImage = root.TryGetProperty("ParentImage", out var parentProp) ? parentProp.GetString() : null,
                    ProcessId = root.TryGetProperty("ProcessId", out var pidProp)
                        ? pidProp.ValueKind == JsonValueKind.Number
                            ? pidProp.GetInt32()
                            : pidProp.ValueKind == JsonValueKind.String && int.TryParse(pidProp.GetString(), out var pidVal)
                                ? pidVal
                                : (int?)null
                        : (int?)null,
                    Technique = technique,
                    RuleName = ruleName
                };
            }
            catch (JsonException)
            {
                return null;
            }
        }

        private string ExtractTechniqueFromRuleName(string ruleName)
        {
            if (string.IsNullOrEmpty(ruleName))
                return null;

            var techniqueIndex = ruleName.IndexOf("technique_id=");
            if (techniqueIndex == -1)
                return null;

            var start = techniqueIndex + 13; // Length of "technique_id="
            var end = ruleName.IndexOf(',', start);
            if (end == -1)
                end = ruleName.Length;

            return ruleName.Substring(start, end - start);
        }
    }

    public class EntitySummary
    {
        public int ActiveAgents { get; set; }
        public int TotalAgents { get; set; }
        public int InitializedCount { get; set; }
        public double InitializedPercentage { get; set; }
    }

    public class EntityFilters
    {
        public bool? Initialized { get; set; }
        public bool? Stale { get; set; }
        public string? Query { get; set; }
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int? Page { get; set; }
        public int? PageSize { get; set; }
    }

    public class EntitySummaryRequest
    {
        public Guid? AgentId { get; set; }
        public long? KeyId { get; set; }
        public string? Key { get; set; }
    }

    public class EntityResponse
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
        public bool IsStale { get; set; }
    }

    public class EntityDetailedView
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
        public string EventData { get; set; } = string.Empty;
        public long EventRowId { get; set; }
        public short EventId { get; set; }
        public DateTime EventTsUtc { get; set; }
        public string EventUser { get; set; }
        public string EventProcess { get; set; }
        public string ProcessGuid { get; set; }
        public int? Pid { get; set; }
        public byte EventMetric { get; set; }
        public int MetricMatches { get; set; }
    }
}
