using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Models;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace AnomalyDetectionDashboard.Services
{
    public class DashboardNew : IDashboardNew
    {
        private readonly AnomalyDbContext _context;

        public DashboardNew(AnomalyDbContext context)
        {
            _context = context;
        }

        public async Task<AgentHealthSummary> GetReportAgentHealth(DateTime from, DateTime to)
        {
            var report = new AgentHealthReport();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Agents_Health";
                command.CommandType = System.Data.CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();

                // Read first result set (summary)
                if (await reader.ReadAsync())
                {
                    report.Summary.Active24h = reader.IsDBNull(0) ? 0 : reader.GetInt32(0);
                    report.Summary.Inactive24h = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
                }

                // Move to second result set
                await reader.NextResultAsync();

                // Read second result set (oldest agents)
                while (await reader.ReadAsync())
                {
                    report.OldestAgents.Add(new AgentHealthDetail
                    {
                        AgentId = reader.GetGuid(0),
                        Hostname = reader.GetString(1),
                        LastSeenUtc = reader.GetDateTime(2)
                    });
                }
            }

            return report.Summary;
        }

        public async Task<IList<AlertHeatmapEntry>> GetAlertsHeatmap(DateTime from, DateTime to)
        {
            var result = new List<AlertHeatmapEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Alerts_Heatmap";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new AlertHeatmapEntry
                    {
                        WeekdayName = reader.GetString(0),
                        WeekdayNum = reader.GetInt32(1),
                        Hour = reader.GetInt32(2),
                        Metric = reader.GetByte(3),
                        Count = reader.GetInt32(4)
                    });
                }
            }

            return result;
        }

        public async Task<IList<SuppressionTrendEntry>> GetSuppressionsTrend(DateTime from, DateTime to)
        {
            var result = new List<SuppressionTrendEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Suppressions_Trend";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new SuppressionTrendEntry
                    {
                        Date = reader.GetDateTime(0),
                        Whitelisted = reader.GetInt32(1),
                        Muted = reader.GetInt32(2),
                        Actionable = reader.GetInt32(3)
                    });
                }
            }

            return result;
        }

        public async Task<IList<EventDuplicateRateEntry>> GetEventsDuplicateRate(DateTime from, DateTime to)
        {
            var result = new List<EventDuplicateRateEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Events_DuplicateRate";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new EventDuplicateRateEntry
                    {
                        Date = reader.GetDateTime(0),
                        TotalRows = reader.GetInt32(1),
                        UniqueEvents = reader.GetInt32(2),
                        DuplicateRate = reader.GetDecimal(3)
                    });
                }
            }

            return result;
        }

        public async Task<IList<EntityInitCoverageEntry>> GetEntitiesInitCoverage()
        {
            var result = new List<EntityInitCoverageEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Entities_InitCoverage";
                command.CommandType = CommandType.StoredProcedure;

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new EntityInitCoverageEntry
                    {
                        AgentId = reader.GetGuid(0),
                        PercentInitialized = reader.GetDecimal(1),
                        TotalEntities = reader.GetInt32(2)
                    });
                }
            }

            return result;
        }

        public async Task<IList<AlertSeverityEntry>> GetAlertsBySeverity(DateTime from, DateTime to, Guid? agentId = null, byte? metric = null)
        {
            var result = new List<AlertSeverityEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Alerts_BySeverity";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                var agentIdParam = command.CreateParameter();
                agentIdParam.ParameterName = "@agentId";
                agentIdParam.Value = agentId;
                command.Parameters.Add(agentIdParam);

                var metricParam = command.CreateParameter();
                metricParam.ParameterName = "@metric";
                metricParam.Value = metric;
                command.Parameters.Add(metricParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new AlertSeverityEntry
                    {
                        Bucket = reader.GetDateTime(0),
                        Severity = reader.GetString(1),
                        Alerts = reader.GetInt32(2)
                    });
                }
            }

            return result;
        }

        public async Task<IList<AlertZDistributionEntry>> GetAlertsZDistribution(
            DateTime from,
            DateTime to,
            byte? metric = null,
            decimal binStep = 0.5m)
        {

            try
            {
                var result = new List<AlertZDistributionEntry>();

                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = "rpt.Alerts_ZDistribution";
                    command.CommandType = CommandType.StoredProcedure;

                    // Add parameters
                    var fromParam = command.CreateParameter();
                    fromParam.ParameterName = "@from";
                    fromParam.Value = from;
                    command.Parameters.Add(fromParam);

                    var toParam = command.CreateParameter();
                    toParam.ParameterName = "@to";
                    toParam.Value = to;
                    command.Parameters.Add(toParam);

                    var metricParam = command.CreateParameter();
                    metricParam.ParameterName = "@metric";
                    metricParam.Value = metric;
                    command.Parameters.Add(metricParam);

                    var binStepParam = command.CreateParameter();
                    binStepParam.ParameterName = "@binStep";
                    binStepParam.Value = binStep;
                    command.Parameters.Add(binStepParam);

                    await _context.Database.OpenConnectionAsync();

                    using var reader = await command.ExecuteReaderAsync();
                    while (await reader.ReadAsync())
                    {
                        result.Add(new AlertZDistributionEntry
                        {
                            Metric = reader.GetByte(0),
                            Z_Bin = reader.GetDecimal(1),
                            Cnt = reader.GetInt32(2)
                        });
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetAlertsZDistribution: " + ex.Message, ex);
            }
        }

        public async Task<IList<AlertTopKeysByZLoadEntry>> GetAlertsTopKeysByZLoad(
            DateTime from,
            DateTime to,
            int top = 20)
        {
            var result = new List<AlertTopKeysByZLoadEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Alerts_TopKeysByZLoad";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                var topParam = command.CreateParameter();
                topParam.ParameterName = "@top";
                topParam.Value = top;
                command.Parameters.Add(topParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new AlertTopKeysByZLoadEntry
                    {
                        Key = reader.GetString(0),
                        ZLoad = reader.GetDouble(1),
                        AlertCount = reader.GetInt32(2)
                    });
                }
            }

            return result;
        }

        public async Task<AlertBacklogStatus> GetAlertsBacklogStatus(DateTime from, DateTime to)
        {
            var status = new AlertBacklogStatus();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Alerts_BacklogStatus";
                command.CommandType = CommandType.StoredProcedure;

                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    status.OpenAlerts = reader.IsDBNull(0) ? 0 : reader.GetInt32(0);
                    status.WhitelistedAlerts = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
                    status.MutedAlerts = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);
                }
            }

            return status;
        }

        public async Task<IList<AlertAgeHistogramEntry>> GetAlertsOpenAgeHistogram(DateTime from, DateTime to, int binHours = 6)
        {
            var result = new List<AlertAgeHistogramEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Alerts_OpenAgeHistogram";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                var binHoursParam = command.CreateParameter();
                binHoursParam.ParameterName = "@binHours";
                binHoursParam.Value = binHours;
                command.Parameters.Add(binHoursParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new AlertAgeHistogramEntry
                    {
                        AgeHoursBin = reader.GetInt32(0),
                        Count = reader.GetInt32(1)
                    });
                }
            }

            return result;
        }

        public async Task<IList<EventFirstSeenKeyEntry>> GetEventsFirstSeenKeys(
            DateTime from,
            DateTime to,
            int top = 200)
        {
            var result = new List<EventFirstSeenKeyEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Events_FirstSeenKeys";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                var topParam = command.CreateParameter();
                topParam.ParameterName = "@top";
                topParam.Value = top;
                command.Parameters.Add(topParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new EventFirstSeenKeyEntry
                    {
                        Key = reader.GetString(0),
                        AgentId = reader.GetGuid(1),
                        FirstSeenUtc = reader.GetDateTime(2)
                    });
                }
            }

            return result;
        }

        public async Task<IList<EntityDriftDailyEntry>> GetEntitiesDriftDaily(DateTime from, DateTime to)
        {
            var result = new List<EntityDriftDailyEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Entities_DriftDaily";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new EntityDriftDailyEntry
                    {
                        Date = reader.GetDateTime(0),
                        EntitiesDrifted = reader.GetInt32(1)
                    });
                }
            }

            return result;
        }

        public async Task<IList<EntityTopDriftedAgentEntry>> GetEntitiesTopDriftedAgents(int top = 20)
        {
            var result = new List<EntityTopDriftedAgentEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Entities_TopDriftedAgents";
                command.CommandType = CommandType.StoredProcedure;

                // Add top parameter
                var topParam = command.CreateParameter();
                topParam.ParameterName = "@top";
                topParam.Value = top;
                command.Parameters.Add(topParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new EntityTopDriftedAgentEntry
                    {
                        AgentId = reader.GetGuid(0),
                        DriftTotal = reader.GetInt32(1)
                    });
                }
            }

            return result;
        }

        public async Task<IList<NoiseByAgentEntry>> GetNoiseTopAgents(
            DateTime from,
            DateTime to,
            int top = 10)
        {
            var result = new List<NoiseByAgentEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Noise_TopAgents";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                var topParam = command.CreateParameter();
                topParam.ParameterName = "@top";
                topParam.Value = top;
                command.Parameters.Add(topParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new NoiseByAgentEntry
                    {
                        AgentId = reader.GetGuid(0),
                        AlertCount = reader.GetInt32(1),
                        Hostname = reader.GetString(2)
                    });
                }
            }

            return result.Take(10).ToList();
        }

        public async Task<IList<NoiseByUserEntry>> GetNoiseTopUsers(
            DateTime from,
            DateTime to,
            int top = 10)
        {
            var result = new List<NoiseByUserEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Noise_TopUsers";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                var topParam = command.CreateParameter();
                topParam.ParameterName = "@top";
                topParam.Value = top;
                command.Parameters.Add(topParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new NoiseByUserEntry
                    {
                        User = reader.GetString(0),
                        AlertCount = reader.GetInt32(1),
                        Hostname = reader.GetString(2)
                    });
                }
            }

            return result.Take(10).ToList();
        }

        public async Task<IList<NoiseByProcessEntry>> GetNoiseTopProcesses(
            DateTime from,
            DateTime to,
            int top = 10)
        {
            var result = new List<NoiseByProcessEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Noise_TopProcesses";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                var topParam = command.CreateParameter();
                topParam.ParameterName = "@top";
                topParam.Value = top;
                command.Parameters.Add(topParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new NoiseByProcessEntry
                    {
                        Process = reader.GetString(0),
                        AlertCount = reader.GetInt32(1),
                        Hostname = reader.GetString(2)
                    });
                }
            }

            return result.Take(10).ToList();
        }

        public async Task<IList<AlertsVsEntitiesBaselineEntry>> GetAlertsVsEntitiesBaseline(
            DateTime from,
            DateTime to)
        {
            var result = new List<AlertsVsEntitiesBaselineEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Alerts_vs_EntitiesBaseline";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new AlertsVsEntitiesBaselineEntry
                    {
                        Key = reader.GetString(0),
                        CurrentCount = reader.GetInt32(1),
                        Mean = reader.GetDouble(2),
                        ZScore = reader.GetDouble(3)
                    });
                }
            }

            return result;
        }

        public async Task<IList<ProcessNetworkFileSequenceEntry>> GetSequenceProcNetFile(
        DateTime from,
        DateTime to,
        int windowMinutes = 30,
        int top = 200)
        {
            // Comment out original implementation
            
            var result = new List<ProcessNetworkFileSequenceEntry>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Seq_ProcNetFile";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);

                var windowParam = command.CreateParameter();
                windowParam.ParameterName = "@winMinutes";
                windowParam.Value = windowMinutes;
                command.Parameters.Add(windowParam);

                var topParam = command.CreateParameter();
                topParam.ParameterName = "@top";
                topParam.Value = top;
                command.Parameters.Add(topParam);

                var requireFile = command.CreateParameter();
                requireFile.ParameterName = "@requireFile";
                requireFile.Value = true;
                command.Parameters.Add(requireFile);

                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new ProcessNetworkFileSequenceEntry
                    {
                        AgentId = reader.GetGuid(0),
                        Hostname = reader.GetString(1),
                        ProcessTimestamp = reader.GetDateTime(2),
                        ProcessImagePath = reader.GetString(3),
                        DestinationIp = reader.IsDBNull(4) ? null : reader.GetString(4),
                        DestinationPort = reader.IsDBNull(5) ? null : reader.GetInt32(5),
                        NetworkTimestamp = reader.GetDateTime(6),
                        TargetFilename = reader.IsDBNull(7) ? null : reader.GetString(7),
                        FileTimestamp = reader.IsDBNull(8) ? null : reader.GetDateTime(8)
                    });
                }
            }

            return result;
        }

        public async Task<ProcessingFunnel> GetProcessingFunnel(
            DateTime from,
            DateTime to)
        {
            var result = new ProcessingFunnel();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "rpt.Funnel_E2E";
                command.CommandType = CommandType.StoredProcedure;

                // Add parameters
                var fromParam = command.CreateParameter();
                fromParam.ParameterName = "@from";
                fromParam.Value = from;
                command.Parameters.Add(fromParam);

                var toParam = command.CreateParameter();
                toParam.ParameterName = "@to";
                toParam.Value = to;
                command.Parameters.Add(toParam);
                                
                await _context.Database.OpenConnectionAsync();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.EventsCount = reader.GetInt32(0);
                    result.StatsRecordCount = reader.GetInt32(1);
                    result.AlertsVisibleCount = reader.GetInt32(2);                    
                }
            }

            return result;
        }
    }
}
