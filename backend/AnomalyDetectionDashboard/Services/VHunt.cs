using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace AnomalyDetectionDashboard.Services
{
    public class VHunt : IVHunt
    {
        private readonly AnomalyDbContext _context;

        public VHunt(AnomalyDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets spike data from the last hour compared to learned baseline
        /// </summary>
        /// <returns>List of entities with their spike analysis data</returns>
        public async Task<IEnumerable<SpikeOneHourDTO>> GetSpikeOneHourDataAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            // Date filters are not applicable for this view (represents last hour spike against baseline)
            return await _context.SpikeOneHourDTOs
                .FromSqlRaw(@"
            SELECT 
                AgentId,
                KeyText,
                cnt_1h as Count1h,
                Mean,
                z as Z
            FROM dbo.vHunt_Spike_1h")
                .ToListAsync();
        }

        public async Task<IEnumerable<RareParentChild7dDTO>> GetRareParentChild7dAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"
            SELECT 
                AgentId,
                [Key],
                cnt7d AS Cnt7d,
                first_seen AS FirstSeen,
                last_seen AS LastSeen
            FROM dbo.vHunt_Rare_PC_7d";

            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE last_seen >= @FromUtc AND last_seen <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE last_seen >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE last_seen <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.RareParentChild7d
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<NewSldTodayDTO>> GetNewSldTodayAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            // This view is constrained to "today" by definition; date parameters are accepted but not applied.
            return await _context.NewSldToday
                .FromSqlRaw(@"
            SELECT 
                AgentId,
                [Key],
                c
            FROM dbo.vHunt_NewSld_Today")
                .ToListAsync();
        }

        public async Task<IEnumerable<NewLastDayNotSeen30dDTO>> GetNewLastDayNotSeen30dAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"
            SELECT 
                AgentId,
                [Key],
                first_seen_recent AS FirstSeenRecent
            FROM dbo.vHunt_New_LastDay_NotSeen30d";

            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE first_seen_recent >= @FromUtc AND first_seen_recent <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE first_seen_recent >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE first_seen_recent <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.NewLastDayNotSeen30d
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }
        public async Task<IEnumerable<Event1ProcessCreateDTO>> GetEvent1ProcessCreateAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_1_ProcessCreate";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event1ProcessCreate
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event2FileCreateTimeChangedDTO>> GetEvent2FileCreateTimeChangedAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_2_FileCreateTimeChanged";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event2FileCreateTimeChanged
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event3NetworkConnectDTO>> GetEvent3NetworkConnectAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_3_NetworkConnect";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event3NetworkConnect
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event4SysmonServiceStateDTO>> GetEvent4SysmonServiceStateAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_4_SysmonServiceState";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event4SysmonServiceState
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event5ProcessTerminateDTO>> GetEvent5ProcessTerminateAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_5_ProcessTerminate";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event5ProcessTerminate
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event6DriverLoadDTO>> GetEvent6DriverLoadAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_6_DriverLoad";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event6DriverLoad
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event7ImageLoadDTO>> GetEvent7ImageLoadAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_7_ImageLoad";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event7ImageLoad
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event8CreateRemoteThreadDTO>> GetEvent8CreateRemoteThreadAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_8_CreateRemoteThread";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event8CreateRemoteThread
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event9RawAccessReadDTO>> GetEvent9RawAccessReadAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_9_RawAccessRead";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event9RawAccessRead
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event10ProcessAccessDTO>> GetEvent10ProcessAccessAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_10_ProcessAccess";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event10ProcessAccess
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event11FileCreateDTO>> GetEvent11FileCreateAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_11_FileCreate";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event11FileCreate
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event12RegistryCreateDeleteDTO>> GetEvent12RegistryCreateDeleteAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_12_RegistryCreateDelete";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event12RegistryCreateDelete
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event13RegistryValueSetDTO>> GetEvent13RegistryValueSetAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_13_RegistryValueSet";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event13RegistryValueSet
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event14RegistryRenameDTO>> GetEvent14RegistryRenameAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_14_RegistryRename";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event14RegistryRename
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event15FileCreateStreamHashDTO>> GetEvent15FileCreateStreamHashAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_15_FileCreateStreamHash";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event15FileCreateStreamHash
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event16SysmonConfigChangeDTO>> GetEvent16SysmonConfigChangeAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_16_SysmonConfigChange";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event16SysmonConfigChange
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event17_18PipeDTO>> GetEvent17_18PipeAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_17_18_Pipe";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event17_18Pipe
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event19WmiEventFilterDTO>> GetEvent19WmiEventFilterAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_19_WmiEventFilter";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event19WmiEventFilter
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event20WmiEventConsumerDTO>> GetEvent20WmiEventConsumerAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_20_WmiEventConsumer";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event20WmiEventConsumer
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event21WmiFilterToConsumerDTO>> GetEvent21WmiFilterToConsumerAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_21_WmiFilterToConsumer";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event21WmiFilterToConsumer
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event22DnsQueryDTO>> GetEvent22DnsQueryAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_22_DnsQuery";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event22DnsQuery
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event23FileDeleteDTO>> GetEvent23FileDeleteAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_23_FileDelete";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event23FileDelete
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }

        public async Task<IEnumerable<Event25ProcessTamperDTO>> GetEvent25ProcessTamperAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var sql = @"SELECT * FROM dbo.vEvent_25_ProcessTamper";
            var parameters = new List<SqlParameter>();
            if (fromDate.HasValue && toDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc AND TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }
            else if (fromDate.HasValue)
            {
                sql += " WHERE TsUtc >= @FromUtc";
                parameters.Add(new SqlParameter("@FromUtc", fromDate.Value));
            }
            else if (toDate.HasValue)
            {
                sql += " WHERE TsUtc <= @ToUtc";
                parameters.Add(new SqlParameter("@ToUtc", toDate.Value));
            }

            return await _context.Event25ProcessTamper
                .FromSqlRaw(sql, parameters.ToArray())
                .ToListAsync();
        }
    }
}
