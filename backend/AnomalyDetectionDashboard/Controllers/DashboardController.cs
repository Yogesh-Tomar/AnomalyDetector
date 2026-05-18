using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AnomalyDetectionDashboard.Services;

namespace AnomalyDetection.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AnalystOrAdmin")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("kpis")]
        public async Task<IActionResult> GetKpis(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            try
            {
                var kpis = await _dashboardService.GetKpisAsync(from, to);
                return Ok(kpis);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch KPIs", error = ex.Message });
            }
        }

        [HttpGet("charts/events-by-hour")]
        public async Task<IActionResult> GetEventsByHour(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            try
            {
                var data = await _dashboardService.GetEventsByHourAsync(from, to);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch events by hour", error = ex.Message });
            }
        }

        [HttpGet("charts/heatmap")]
        public async Task<IActionResult> GetHeatmap(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            try
            {
                var heatmap = await _dashboardService.GetHeatmapAsync(from, to);
                return Ok(heatmap);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch heatmap", error = ex.Message });
            }
        }

        [HttpGet("charts/top-items")]
        public async Task<IActionResult> GetTopItems(           
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
             [FromQuery] string type,
            [FromQuery] int limit = 10)
        {
            try
            {
                var items = await _dashboardService.GetTopItemsAsync(type, limit, from, to);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to fetch top {type}", error = ex.Message });
            }
        }
    }
}