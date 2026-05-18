using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace AnomalyDetectionDashboard.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AnomalyDbContext _context;

        public DashboardService(AnomalyDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardKpis> GetKpisAsync(DateTime? from, DateTime? to)
        {
            var fromParam = new SqlParameter("@FromUtc", from ?? DateTime.UtcNow.AddDays(-7));
            var toParam = new SqlParameter("@ToUtc", to ?? DateTime.UtcNow);

            var result = _context.Database
            .SqlQueryRaw<DashboardKpis>("EXEC usp_GetDashboardKpis @FromUtc, @ToUtc", fromParam, toParam)
            .AsEnumerable()
            .ToList();

            return result.FirstOrDefault() ?? new DashboardKpis();
        }

        public async Task<int[]> GetEventsByHourAsync(DateTime? from, DateTime? to)
        {
            var fromParam = new SqlParameter("@FromUtc", from ?? DateTime.UtcNow.AddDays(-7));
            var toParam = new SqlParameter("@ToUtc", to ?? DateTime.UtcNow);

            var results = await _context.Database
                .SqlQueryRaw<EventsByHourResult>("EXEC usp_GetEventsByHour @FromUtc, @ToUtc", fromParam, toParam)
                .ToListAsync();

            // Ensure we have data for all 24 hours
            var hourlyData = new int[24];
            foreach (var result in results)
            {
                if (result.HourOfDay >= 0 && result.HourOfDay < 24)
                {
                    hourlyData[result.HourOfDay] = result.EventCount;
                }
            }

            return hourlyData;
        }

        public async Task<int[][]> GetHeatmapAsync(DateTime? from, DateTime? to)
        {
            var fromParam = new SqlParameter("@FromUtc", from ?? DateTime.UtcNow.AddDays(-7));
            var toParam = new SqlParameter("@ToUtc", to ?? DateTime.UtcNow);

            var results = await _context.Database
                .SqlQueryRaw<HeatmapResult>("EXEC usp_GetHeatmapData @FromUtc, @ToUtc", fromParam, toParam)
                .ToListAsync();

            // Initialize 7x24 matrix (7 weekdays, 24 hours)
            var heatmap = new int[7][];
            for (int i = 0; i < 7; i++)
            {
                heatmap[i] = new int[24];
            }

            // Fill matrix with data
            foreach (var result in results)
            {
                if (result.WeekdayIndex >= 0 && result.WeekdayIndex < 7 &&
                    result.HourOfDay >= 0 && result.HourOfDay < 24)
                {
                    heatmap[result.WeekdayIndex][result.HourOfDay] = result.EventCount;
                }
            }

            return heatmap;
        }

        public async Task<List<TopItem>> GetTopItemsAsync(string type, int limit, DateTime? from, DateTime? to)
        {
            var typeParam = new SqlParameter("@ItemType", type);
            var limitParam = new SqlParameter("@Limit", limit);
            var fromParam = new SqlParameter("@FromUtc", from ?? DateTime.UtcNow.AddDays(-7));
            var toParam = new SqlParameter("@ToUtc", to ?? DateTime.UtcNow);

            var results = await _context.Database
                .SqlQueryRaw<TopItem>("EXEC usp_GetTopItems @ItemType, @Limit, @FromUtc, @ToUtc",
                    typeParam, limitParam, fromParam, toParam)
                .ToListAsync();

            return results;
        }
    }

    // Helper result classes for stored procedures
    public class EventsByHourResult
    {
        public int HourOfDay { get; set; }
        public int EventCount { get; set; }
    }

    public class HeatmapResult
    {
        public int WeekdayIndex { get; set; }
        public int HourOfDay { get; set; }
        public int EventCount { get; set; }
    }

    public class TopItem
    {
        public string Hostname { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public long Count { get; set; }
    }
}
