using AnomalyDetectionDashboard.DTOs;

namespace AnomalyDetectionDashboard.Services
{
    public interface IDashboardService
    {
        Task<DashboardKpis> GetKpisAsync(DateTime? from, DateTime? to);
        Task<int[]> GetEventsByHourAsync(DateTime? from, DateTime? to);
        Task<int[][]> GetHeatmapAsync(DateTime? from, DateTime? to);
        Task<List<TopItem>> GetTopItemsAsync(string type, int limit, DateTime? from, DateTime? to);
    }
}
