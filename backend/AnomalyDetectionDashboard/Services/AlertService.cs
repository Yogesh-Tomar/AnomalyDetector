using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Client;
using System.Data;
using System.Text.Json;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace AnomalyDetectionDashboard.Services
{
    public class AlertService : IAlertService
    {
        private readonly AnomalyDbContext _context;
        private readonly ILogger<UserService> _logger;
        private readonly string _connectionString;
        public AlertService(AnomalyDbContext context, ILogger<UserService> logger, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string not found.");
        }
        public async Task<bool> ExcludeAlertAsync(AlertWhitelistRuleRequest request)
        {
            try
            {
                var rule = new AlertWhitelistRule
                {
                    IsEnabled = request.IsEnabled,
                    ScopeType = request.ScopeType,
                    GroupId = request.GroupId,
                    AgentId = request.AgentId,
                    Metric = request.Metric,
                    EventId = request.EventId,
                    KeyId = request.KeyId,
                    KeyLike = request.KeyLike,
                    UserLike = request.UserLike,
                    ProcessLike = request.ProcessLike,
                    Reason = request.Reason,
                    EffectiveFromUtc = request.EffectiveFromUtc,
                    EffectiveUntilUtc = request.EffectiveUntilUtc,
                    CreatedUtc = DateTime.UtcNow,
                    CreatedBy = request.CreatedBy,
                    Suppress = request.Suppress,
                    AllowedStartHHMM = request.AllowedStartHHMM,
                    AllowedEndHHMM = request.AllowedEndHHMM,
                    AllowedDaysMask = request.AllowedDaysMask,
                    IsActive = request.IsActive,
                    Priority = request.Priority,
                    ValidFromUtc = request.ValidFromUtc,
                    ValidUntilUtc = request.ValidUntilUtc
                };

                _context.AlertWhitelistRules.Add(rule);
                await _context.SaveChangesAsync(); // This will populate the RuleId

                // Now use the generated RuleId to update matching alerts
                var alerts = _context.Alerts.Where(a =>
                    a.AgentId == request.AgentId &&
                    a.KeyId == request.KeyId &&
                    a.Metric == request.Metric &&
                    a.TsUtc == request.TsUtc);

                await alerts.ForEachAsync(a =>
                {
                    a.IsVisible = false;
                    a.IsWhitelisted = true;
                    a.WhitelistRuleId = rule.RuleId;
                });

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred in ExcludeAlertAsync.");
                return false;
            }
        }

        // Add these methods to the AlertService class

        public async Task<AlertWhitelistRule?> GetWhitelistRuleAsync(long ruleId)
        {
            try
            {
                return await _context.AlertWhitelistRules
                    .FirstOrDefaultAsync(r => r.RuleId == ruleId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving whitelist rule {RuleId}", ruleId);
                return null;
            }
        }

        public async Task<List<AlertWhitelistRule>> GetActiveWhitelistRulesAsync()
        {
            try
            {
                var now = DateTime.UtcNow;
                return await _context.AlertWhitelistRules
                    .Where(r => r.IsEnabled
                        && r.IsActive)
                    .OrderByDescending(r => r.Priority)
                    .ThenByDescending(r => r.CreatedUtc)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active whitelist rules");
                return new List<AlertWhitelistRule>();
            }
        }

        public async Task<bool> UpdateWhitelistRuleAsync(long ruleId, AlertWhitelistRuleRequest request)
        {
            try
            {
                var rule = await _context.AlertWhitelistRules
                    .FirstOrDefaultAsync(r => r.RuleId == ruleId);

                if (rule == null)
                    return false;

                // Update properties
                rule.IsEnabled = request.IsEnabled;
                rule.ScopeType = request.ScopeType;
                rule.GroupId = request.GroupId;
                rule.AgentId = request.AgentId;
                rule.Metric = request.Metric;
                rule.EventId = request.EventId;
                rule.KeyId = request.KeyId;
                rule.KeyLike = request.KeyLike;
                rule.UserLike = request.UserLike;
                rule.ProcessLike = request.ProcessLike;
                rule.Reason = request.Reason;
                rule.EffectiveFromUtc = request.EffectiveFromUtc;
                rule.EffectiveUntilUtc = request.EffectiveUntilUtc;
                rule.Suppress = request.Suppress;
                rule.AllowedStartHHMM = request.AllowedStartHHMM;
                rule.AllowedEndHHMM = request.AllowedEndHHMM;
                rule.AllowedDaysMask = request.AllowedDaysMask;
                rule.IsActive = request.IsActive;
                rule.Priority = request.Priority;
                rule.ValidFromUtc = request.ValidFromUtc;
                rule.ValidUntilUtc = request.ValidUntilUtc;

                await _context.SaveChangesAsync();

                var alerts = _context.Alerts.Where(a =>
                    a.AgentId == rule.AgentId &&
                    a.KeyId == rule.KeyId &&
                    a.Metric == rule.Metric);

                await alerts.ForEachAsync(a =>
                {
                    a.IsVisible = !a.IsVisible ? true : false;
                    a.IsWhitelisted = !a.IsWhitelisted ? true : false;
                    a.WhitelistRuleId = null;
                });

                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating whitelist rule {RuleId}", ruleId);
                return false;
            }
        }

        public async Task<bool> DeleteWhitelistRuleAsync(long ruleId)
        {
            try
            {
                var rule = await _context.AlertWhitelistRules
                    .FirstOrDefaultAsync(r => r.RuleId == ruleId);

                if (rule == null)
                    return false;

                // Update affected alerts
                var alerts = await _context.Alerts
                    .Where(a => a.WhitelistRuleId == ruleId)
                    .ToListAsync();

                foreach (var alert in alerts)
                {
                    alert.IsWhitelisted = false;
                    alert.WhitelistRuleId = null;
                    alert.IsVisible = true;
                }

                _context.AlertWhitelistRules.Remove(rule);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting whitelist rule {RuleId}", ruleId);
                return false;
            }
        }

        // Get alerts with filters
        public async Task<AlertListResponse> GetAlertsAsync(AlertFilterDto filter)
        {
            using var connection = new SqlConnection(_connectionString);

            var sql = @"
    WITH TechniqueEvents AS (
        SELECT 
            e.AgentId, e.KeyId, e.TsUtc,
            CASE 
                WHEN JSON_VALUE(e.EventData, '$.RuleName') LIKE '%technique_id=%'
                THEN SUBSTRING(JSON_VALUE(e.EventData, '$.RuleName'), 
                     CHARINDEX('technique_id=', JSON_VALUE(e.EventData, '$.RuleName')) + 13, 6)
                ELSE NULL 
            END AS Technique
        FROM Events e
        WHERE e.TsUtc BETWEEN @FromDate AND @ToDate
    )
    SELECT a.AgentId, a.TsUtc, a.BucketSeconds, a.Metric, a.[User], a.Process, 
           a.[Key], a.Count, a.Mean, a.Std, a.Z, a.KeyId, a.IsVisible, 
           a.IsWhitelisted, a.WhitelistRuleId, ag.Hostname,
           te.Technique,
           ISNULL(a.IsRead, 0) AS IsRead,
           COUNT(*) OVER() AS TotalCount
    FROM Alerts a
    INNER JOIN Agents ag ON a.AgentId = ag.AgentId
    LEFT JOIN AlertWhitelistRule awr ON a.WhitelistRuleId = awr.RuleId
    LEFT JOIN TechniqueEvents te ON te.AgentId = a.AgentId AND te.KeyId = a.KeyId AND te.TsUtc BETWEEN DATEADD(minute, -5, a.TsUtc) AND DATEADD(minute, 5, a.TsUtc)
    WHERE (a.WhitelistRuleId IS NULL OR 
           NOT (GETDATE() >= awr.EffectiveFromUtc) AND
           (GETDATE() <= awr.EffectiveUntilUtc))
      AND (@FromDate IS NULL OR a.TsUtc >= @FromDate)
      AND (@ToDate IS NULL OR a.TsUtc <= @ToDate)
      AND (@User IS NULL OR a.[User] LIKE '%' + @User + '%')
      AND (@Host IS NULL OR ag.Hostname LIKE '%' + @Host + '%')
      AND (@Process IS NULL OR a.Process LIKE '%' + @Process + '%')"
             + (filter.Unread ? " AND ISNULL(a.IsRead, 0) = 0 " : "") +
             @"
    ORDER BY a.TsUtc DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

            var parameters = new[]
            {
        new SqlParameter("@FromDate", (object)filter.FromDate ?? DBNull.Value),
        new SqlParameter("@ToDate", (object)filter.ToDate ?? DBNull.Value),
        new SqlParameter("@User", (object)filter.User ?? DBNull.Value),
        new SqlParameter("@Host", (object)filter.Host ?? DBNull.Value),
        new SqlParameter("@Process", (object)filter.Process ?? DBNull.Value),
        new SqlParameter("@Offset", filter.Skip),
        new SqlParameter("@PageSize", filter.Take)
    };

            var alerts = new List<AlertDto>();
            int totalCount = 0;

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddRange(parameters);

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                totalCount = reader.GetInt32(reader.GetOrdinal("TotalCount"));
                alerts.Add(new AlertDto
                {
                    AgentId = reader.GetGuid(reader.GetOrdinal("AgentId")),
                    TsUtc = reader.GetDateTime(reader.GetOrdinal("TsUtc")),
                    BucketSeconds = reader.GetInt32(reader.GetOrdinal("BucketSeconds")),
                    Metric = reader.GetByte(reader.GetOrdinal("Metric")),
                    User = reader.GetString(reader.GetOrdinal("User")),
                    Process = reader.GetString(reader.GetOrdinal("Process")),
                    Key = reader.GetString(reader.GetOrdinal("Key")),
                    Count = reader.GetInt32(reader.GetOrdinal("Count")),
                    Mean = reader.IsDBNull(reader.GetOrdinal("Mean")) ? null : reader.GetDouble(reader.GetOrdinal("Mean")),
                    Std = reader.IsDBNull(reader.GetOrdinal("Std")) ? null : reader.GetDouble(reader.GetOrdinal("Std")),
                    ZScore = reader.IsDBNull(reader.GetOrdinal("Z")) ? null : reader.GetDouble(reader.GetOrdinal("Z")),
                    KeyId = reader.GetInt64(reader.GetOrdinal("KeyId")),
                    Hostname = reader.GetString(reader.GetOrdinal("Hostname")),
                    Technique = reader.IsDBNull(reader.GetOrdinal("Technique")) ? null : reader.GetString(reader.GetOrdinal("Technique")),
                    IsRead = reader.GetBoolean(reader.GetOrdinal("IsRead")),
                    IsWhitelisted = reader.GetBoolean(reader.GetOrdinal("IsWhitelisted"))
                });
            }

            return new AlertListResponse
            {
                Alerts = alerts,
                TotalCount = totalCount,
                HasMore = filter.Skip + filter.Take < totalCount
            };
        }
        public async Task<List<AlertDetailedView>> GetAlertSummaryAsync(Guid? agentId = null, long? keyId = null, string? key = null)
        {
            //var cutoffTime = DateTime.UtcNow.AddHours(-24);

            var alertQuery = _context.Alerts.AsQueryable();
            var eventQuery = _context.Events.AsQueryable();

            if (keyId.HasValue)
            {
                alertQuery = alertQuery.Where(e => e.KeyId == keyId.Value);
                eventQuery = eventQuery.Where(ev => ev.KeyId == keyId.Value);
            }

            var result = await (
                from al in alertQuery
                join ev in eventQuery
                    on new { al.KeyId } equals new { ev.KeyId } into joined
                from ev in joined.DefaultIfEmpty()
                where al.AgentId != Guid.Empty && ev.AgentId != Guid.Empty
                select new
                {
                    // Agent properties
                    AgentId = al.AgentId,
                    Key = al.Key,
                    KeyId = al.KeyId,
                    Mean = al.Mean,
                    BucketSeconds = al.BucketSeconds,
                    Metric = al.Metric,
                    Processs = al.Process,
                    User = al.User,
                    Count = al.Count,
                    ZScore = al.Z,
                    Std = al.Std,                    
                    // Alert properties
                    IsRead = al.IsRead,
                    AnalystNote = al.AnalystNote,
                    IsMuted = al.IsMuted,


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
                return new AlertDetailedView
                {
                    AgentId = r.AgentId,
                    Key = r.Key,
                    KeyId = r.KeyId,
                    Mean = r.Mean ?? 0,
                    BucketSeconds = r.BucketSeconds,
                    Metric = r.Metric,
                    Process = r.Processs,
                    Z = r.ZScore,
                    Std = r.Std,
                    IsRead = r.IsRead,
                    AnalystNote = r.AnalystNote,                    
                    IsMuted = r.IsMuted,
                    
                    // Event properties

                    EventRowId = r.EventRowId,
                    EventData = r.EventData,
                    EventId = r.EventId,
                    EventTsUtc = r.EventTsUtc,
                    EventUser = r.EventUser,
                    EventProcess = processMetadata?.Path ?? r.EventProcess, // Use extracted process path if available
                    ProcessGuid = r.ProcessGuid,
                    Pid = processMetadata?.ProcessId ?? r.Pid // Use extracted PID if available
                };
            }).ToList() ?? new List<AlertDetailedView>();
        }
        public async Task<bool> InvestigateAlertAsync(Guid agentId,DateTime TsUtc, byte Metric, long KeyId)
        {
            var alert = await _context.Alerts
                .FirstOrDefaultAsync(a => a.AgentId == agentId && a.TsUtc == TsUtc
                    && a.Metric == Metric && a.KeyId == KeyId);

            if (alert == null) return false;

            alert.IsRead = true;
            //if (!string.IsNullOrWhiteSpace(analystNote))
            //{
            //    alert.AnalystNote = analystNote;
            //}

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MuteAlertAsync(Guid agentId)
        {
            var alert = await _context.Alerts
                .FirstOrDefaultAsync(a => a.AgentId == agentId);

            if (alert == null) return false;

            alert.IsMuted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<AlertContext?> GetAlertContextAsync(Guid? agentId, long? keyId = null, string? key = null)
        {
            try
            {
                var cutoffTime = DateTime.UtcNow.AddHours(-24);

                var alertQuery = _context.Alerts.AsQueryable();
                var eventQuery = _context.Events.AsQueryable();

                // Apply filters to both sides of the join if provided
                if (agentId.HasValue)
                {
                    alertQuery = alertQuery.Where(e => e.AgentId == agentId.Value);
                    eventQuery = eventQuery.Where(ev => ev.AgentId == agentId.Value);
                }
                if (keyId.HasValue)
                {
                    alertQuery = alertQuery.Where(e => e.KeyId == keyId.Value);
                    eventQuery = eventQuery.Where(ev => ev.KeyId == keyId.Value);
                }
                if (!string.IsNullOrEmpty(key))
                {
                    alertQuery = alertQuery.Where(e => e.Key == key);
                    eventQuery = eventQuery.Where(ev => ev.Key == key);
                }

                var context = await (
                    from er in alertQuery
                    join ev in eventQuery
                        on new { er.AgentId, er.KeyId, er.Key } equals new { ev.AgentId, ev.KeyId, ev.Key }
                        into joined
                    from ev in joined.DefaultIfEmpty()
                    select new AlertContext
                    {
                        AgentId = er.AgentId,
                        //Initialized = er.Initialized ?? ,
                        Mean = er.Mean ?? 0,
                        //StandardDeviation = (float)Math.Sqrt(ev.Var),
                        //BucketsSeen = ev.BucketsSeen,
                        IsRead = er.IsRead,
                        KeyId = er.KeyId,
                        Time = er.TsUtc,
                        User = er.User ?? string.Empty,
                        Metric = er.Metric,
                        Host = ExtractHostFromKey(er.Key),
                        Process = er.Process ?? string.Empty,
                        Count = er.Count,
                        ZScore = er.Z ?? 0,
                        Key = key,
                    }
                ).FirstOrDefaultAsync();
                
                //var context = 

                // Try to get process metadata from recent events
                //var processMetadata = await GetProcessMetadataAsync(agentId, key);
                //if (processMetadata != null)
                //{
                //    context.ProcessMetadata = processMetadata;
                //}

                return context;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred in CreateUserAsync.");
                return null;
            }
        }

        // Get alert investigation details
        public async Task<AlertInvestigationDto> GetAlertInvestigationAsync(AlertInvestigationRequest request)
        {
            using var connection = new SqlConnection(_connectionString);

            // Get alert details
            var alertSql = @"
            SELECT a.AgentId, a.TsUtc, a.BucketSeconds, a.Metric, a.[User], a.Process, a.[Key], a.[AnalystNote],
                a.Count, a.Mean, a.Std, a.Z, a.KeyId, a.IsVisible, a.IsRead,  a.IsWhitelisted, a.WhitelistRuleId, ag.Hostname
                FROM Alerts a
                INNER JOIN Agents ag ON a.AgentId = ag.AgentId
                WHERE a.AgentId = @AgentId AND a.TsUtc = @TsUtc AND a.KeyId = @KeyId AND a.Metric = @Metric";

            // Get related events using the provided view
            var eventsSql = @"
            SELECT * FROM vAlertsEvents_ByKey_PlusMinus1
            WHERE AgentId = @AgentId AND AlertTsUtc = @AlertTsUtc AND KeyId = @KeyId
            ORDER BY AlertTsUtc DESC";

            // Get entity baseline
            var entitySql = @"
            SELECT e.Mean, e.Var, e.Initialized, e.BucketsSeen, e.EwmaAlpha, e.UpdatedUtc
            FROM Entities e
            INNER JOIN Keys k ON k.[Key] = e.[Key] AND k.AgentId = @AgentId
            WHERE k.KeyId = @KeyId";

            await connection.OpenAsync();

            // Get alert
            AlertDto alert = null;
            using (var command = new SqlCommand(alertSql, connection))
            {
                command.Parameters.AddWithValue("@AgentId", request.AgentId);
                command.Parameters.AddWithValue("@TsUtc", request.TsUtc);
                command.Parameters.AddWithValue("@KeyId", request.KeyId);
                command.Parameters.AddWithValue("@Metric", request.Metric);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    alert = new AlertDto
                    {
                        AgentId = reader.GetGuid("AgentId"),
                        Metric = reader.GetByte("Metric"),
                        TsUtc = reader.GetDateTime("TsUtc"),
                        User = reader.GetString("User"),
                        Process = reader.GetString("Process"),
                        Key = reader.GetString("Key"),
                        Count = reader.GetInt32("Count"),
                        ZScore = reader.IsDBNull("Z") ? null : reader.GetDouble("Z"),
                        Mean = reader.IsDBNull("Mean") ? null : reader.GetDouble("Mean"),
                        Std = reader.IsDBNull("Std") ? null : reader.GetDouble("Std"),
                        Hostname = reader.GetString("Hostname"),
                        KeyId = reader.GetInt64("KeyId"),
                        IsRead = reader.GetBoolean("IsRead"),
                        IsWhitelisted = reader.GetBoolean("IsWhitelisted"),
                        AnalystNote = reader.IsDBNull("AnalystNote") ? null : reader.GetString("AnalystNote")
                    };
                }
            }

            if (alert == null) return null;

            // Get related events
            var events = new List<EventSummaryDto>();
            using (var command = new SqlCommand(eventsSql, connection))
            {
                command.Parameters.AddWithValue("@AgentId", request.AgentId);
                command.Parameters.AddWithValue("@AlertTsUtc", request.TsUtc);
                command.Parameters.AddWithValue("@KeyId", request.KeyId);

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var eventData = reader.IsDBNull("EventData") ? null : reader.GetString("EventData");
                    var processMetadata = ExtractProcessMetadata(eventData);

                    events.Add(new EventSummaryDto
                    {
                        EventId = reader.GetInt16("EventId"),
                        TsUtc = reader.GetDateTime("AlertTsUtc"),
                        User = reader.IsDBNull("AlertUser") ? null : reader.GetString("AlertUser"),
                        Process = reader.IsDBNull("AlertProcess") ? null : reader.GetString("AlertProcess"),
                        EventData = eventData,
                        ProcessPath = processMetadata?.Path,
                        CommandLine = processMetadata?.CommandLine,
                        ParentImage = processMetadata?.ParentImage,
                        Technique = processMetadata?.Technique
                    });
                }
            }

            // Get entity baseline
            EntityBaselineDto baseline = null;
            using (var command = new SqlCommand(entitySql, connection))
            {
                command.Parameters.AddWithValue("@AgentId", request.AgentId);
                command.Parameters.AddWithValue("@KeyId", request.KeyId);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var mean = reader.IsDBNull("Mean") ? 0.0 : reader.GetDouble("Mean");
                    var variance = reader.IsDBNull("Var") ? 0.0 : reader.GetDouble("Var");
                    var stdDev = Math.Sqrt(variance);

                    baseline = new EntityBaselineDto
                    {
                        Mean = mean,
                        StandardDeviation = stdDev,
                        LowerBound = mean - (3 * stdDev),
                        UpperBound = mean + (3 * stdDev),
                        Initialized = reader.GetBoolean("Initialized"),
                        BucketsSeen = reader.GetInt64("BucketsSeen"),
                        LastUpdated = reader.GetDateTime("UpdatedUtc")
                    };
                }
            }

            var notes = await _context.AnalystNote
                        .Where(n => n.AgentId == alert.AgentId && 
                        n.TsUtc == alert.TsUtc && n.KeyId == 
                        alert.KeyId
                        )
                        .OrderBy(n => n.CreatedUtc)
                        .ToListAsync();
            return new AlertInvestigationDto
            {
                Alert = alert,
                RelatedEvents = events,
                EntityBaseline = baseline,
                AnalystNotes = notes
            };
        }

        public async Task<AlertInvestigationResponse> InvestigateAlertAsync(Guid agentId, DateTime alertTsUtc, long keyId)
        {
            var events = await _context.vAlertsEvents_ByKey_Exact
                .Where(e => e.AgentId == agentId && e.AlertTsUtc == alertTsUtc && e.KeyId == keyId)
                .ToListAsync();

            events = events
                   .OrderBy(e => e.EventTsUtc)
                   .ToList();

            if (!events.Any())
                return null;

            var alertInfo = events.First();
            

            return new AlertInvestigationResponse
            {
                AlertInfo = alertInfo,
                //RelatedEvents = events
            };
        }

        public async Task MarkAlertAsReadAsync(Guid agentId, DateTime alertTsUtc, long keyId)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "UPDATE Alerts SET IsRead = 1 WHERE AgentId = {0} AND TsUtc = {1} AND KeyId = {2}",
                agentId, alertTsUtc, keyId);
        }

        public async Task AddNote(Guid agentId, DateTime alertTsUtc, long keyId, string note, string createdBy)
        {
            var alertExists = await _context.Alerts.Where(a =>
                            a.AgentId == agentId &&
                            a.TsUtc == alertTsUtc &&                            
                            a.KeyId == keyId).Select(a => new { a.AgentId, a.KeyId, a.TsUtc, a.Metric}).FirstOrDefaultAsync();

            if (alertExists == null)
                throw new InvalidOperationException("Referenced alert does not exist.");

            var analystNote = new AnalystNote
            {
                AgentId = agentId,
                TsUtc = alertTsUtc,
                KeyId = keyId,
                Metric = alertExists.Metric,
                Note = note,
                CreatedBy = createdBy,
                CreatedUtc = DateTime.UtcNow
            };

            _context.AnalystNote.Add(analystNote);
            await _context.SaveChangesAsync();
        }

        public async Task<List<DumpListDto>> GetAllDumpsAsync(DumpsFilterDto filters)
        {
            var query = _context.Dumps.AsQueryable();

            if (filters.FromDate.HasValue)
                query = query.Where(d => d.CreatedUtc >= filters.FromDate.Value);

            if (filters.ToDate.HasValue)
                query = query.Where(d => d.CreatedUtc <= filters.ToDate.Value);

            // Filter by Malware: "yes" = true, "no" = false, "All" = no filter
            if (!string.IsNullOrEmpty(filters.Malware) && !filters.Malware.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                if (filters.Malware.Equals("true", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(d => d.Malware == true);
                else if (filters.Malware.Equals("false", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(d => d.Malware == false || d.Malware == null);
            }

            // Filter by Status: "active" = 1, "inactive" = 0, "All" = no filter
            if (!string.IsNullOrEmpty(filters.Status) && !filters.Status.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                if (filters.Status.Equals("true", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(d => d.IsAnalized== true);
                else if (filters.Status.Equals("false", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(d => d.IsAnalized == false || d.Status == null);
            }

            return await query
                .Select(d => new DumpListDto
                {
                    DumpId = d.DumpId,
                    AgentId = d.AgentId,
                    FileName = d.FileName,
                    SizeBytes = d.SizeBytes,
                    CreatedUtc = d.CreatedUtc,
                    IsAnalized = d.IsAnalized,
                    Malware = d.Malware,
                    Status = d.Status.ToString()
                })
                .ToListAsync();
        }

        public async Task<DumpDetailDto?> GetDumpByIdAsync(Guid dumpId)
        {
            return await _context.Dumps
                .Where(d => d.DumpId == dumpId)
                .Select(d => new DumpDetailDto
                {
                    DumpId = d.DumpId,
                    AgentId = d.AgentId,
                    FileName = d.FileName,
                    SizeBytes = d.SizeBytes,
                    Sha256Hex = d.Sha256Hex,
                    Status = d.Status.ToString(),
                    CreatedUtc = d.CreatedUtc,
                    VerifiedUtc = d.VerifiedUtc,
                    RowVersion = d.RowVersion,
                    IsAnalized = d.IsAnalized,
                    Malware = d.Malware,
                    Categorie = d.Categorie,
                    Stage1Pred = d.Stage1Pred,
                    Stage1Score = d.Stage1Score,
                    Stage2Pred = d.Stage2Pred,
                    Stage2Proba = d.Stage2Proba,
                    Stage2Category = d.Stage2Category,
                    Stage2CategoryConf = d.Stage2CategoryConf,
                    AnalysisUtc = d.AnalysisUtc,
                    AnalysisModelBin = d.AnalysisModelBin,
                    AnalysisModelCat = d.AnalysisModelCat,
                    FeatureCount = d.FeatureCount,
                    ExtractionMs = d.ExtractionMs,
                    CatTopKJson = d.CatTopKJson
                })
                .FirstOrDefaultAsync();
        }

        public async Task<AlertFilterOptionsDto> GetFilterOptionsAsync()
        {
            using var connection = new SqlConnection(_connectionString);

            var sql = @"
            SELECT DISTINCT a.[User] FROM Alerts a WHERE a.[User] IS NOT NULL AND a.IsVisible = 1
            UNION
            SELECT DISTINCT ag.Hostname FROM Alerts a INNER JOIN Agents ag ON a.AgentId = ag.AgentId WHERE a.IsVisible = 1
            UNION  
            SELECT DISTINCT a.Process FROM Alerts a WHERE a.Process IS NOT NULL AND a.IsVisible = 1";

            var users = new List<string>();
            var hosts = new List<string>();
            var processes = new List<string>();

            await connection.OpenAsync();

            // Get distinct users
            using (var command = new SqlCommand("SELECT DISTINCT [User] FROM Alerts WHERE [User] IS NOT NULL AND IsVisible = 1 ORDER BY [User]", connection))
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                    users.Add(reader.GetString(0));
            }

            // Get distinct hosts
            using (var command = new SqlCommand("SELECT DISTINCT ag.Hostname FROM Alerts a INNER JOIN Agents ag ON a.AgentId = ag.AgentId WHERE a.IsVisible = 1 ORDER BY ag.Hostname", connection))
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                    hosts.Add(reader.GetString(0));
            }

            // Get distinct processes
            using (var command = new SqlCommand("SELECT DISTINCT Process FROM Alerts WHERE Process IS NOT NULL AND IsVisible = 1 ORDER BY Process", connection))
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                    processes.Add(reader.GetString(0));
            }

            return new AlertFilterOptionsDto
            {
                Users = users,
                Hosts = hosts,
                Processes = processes
            };
        }

        public async Task<List<string>> GetDistinctValuesAsync(string field)
        {
            if (string.IsNullOrWhiteSpace(field)) return new List<string>();

            var key = field.Trim().ToLowerInvariant();
            string sql;

            switch (key)
            {
                case "user":
                case "users":
                    sql = "SELECT DISTINCT [User] FROM Alerts WHERE [User] IS NOT NULL AND IsVisible = 1 ORDER BY [User]";
                    break;
                case "host":
                case "hosts":
                case "hostname":
                    sql = "SELECT DISTINCT ag.Hostname FROM Alerts a INNER JOIN Agents ag ON a.AgentId = ag.AgentId WHERE a.IsVisible = 1 AND ag.Hostname IS NOT NULL ORDER BY ag.Hostname";
                    break;
                case "process":
                case "processes":
                    sql = "SELECT DISTINCT Process FROM Alerts WHERE Process IS NOT NULL AND IsVisible = 1 ORDER BY Process";
                    break;
                default:
                    return new List<string>();
            }

            var results = new List<string>();
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            using var command = new SqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                if (!reader.IsDBNull(0))
                    results.Add(reader.GetString(0));
            }
            return results;
        }

        private async Task<ProcessMetadata?> GetProcessMetadataAsync(Guid agentId, string key)
        {
            // Look for recent events with this key to get process metadata
            var recentEvent = await _context.Set<RawEvent>()
                .Where(e => e.AgentId == agentId && e.Key == key)
                .OrderByDescending(e => e.TsUtc)
                .FirstOrDefaultAsync();

            if (recentEvent?.Json == null) return null;

            try
            {
                // Parse JSON to extract process metadata
                var eventData = System.Text.Json.JsonDocument.Parse(recentEvent.Json);

                return new ProcessMetadata
                {
                    Path = eventData.RootElement.GetProperty("Image").GetString() ?? "",
                    CommandLine = eventData.RootElement.GetProperty("CommandLine").GetString() ?? "",
                    Sha256 = ExtractSha256FromHashes(eventData.RootElement.GetProperty("Hashes").GetString()),
                    Publisher = eventData.RootElement.GetProperty("Publisher").GetString(),
                    ParentProcess = eventData.RootElement.GetProperty("ParentImage").GetString()
                };
            }
            catch
            {
                return null;
            }
        }

        private static string ExtractHostFromKey(string key)
        {
            // Keys are typically in format like "U:HOSTNAME\\user|process"
            // Extract hostname part
            var parts = key.Split(':', '\\', '|');
            if (parts.Length >= 2)
            {
                return parts[1]; // HOSTNAME part
            }
            return "Unknown";
        }

        private string? ExtractSha256FromHashes(string? hashes)
        {
            if (string.IsNullOrEmpty(hashes)) return null;

            // Hashes format: "SHA256=abc123,MD5=def456"
            var parts = hashes.Split(',');
            var sha256Part = parts.FirstOrDefault(p => p.StartsWith("SHA256="));
            return sha256Part?.Substring(7); // Remove "SHA256=" prefix
        }

        // Helper method to extract process metadata from EventData JSON
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

    //    // Helper classes
    public class AlertFilters
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public string? User { get; set; }
        public string? Process { get; set; }
        public bool? Unread { get; set; }
        public int? Page { get; set; }
        public int? PageSize { get; set; }
    }

    // Temporary entity for RawEvents (you might need to add this to your DbContext)
    public class RawEvent
    {
        public long RawEventId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public short Eid { get; set; }
        public string Key { get; set; } = string.Empty;
        public string? Json { get; set; }
    }

}
