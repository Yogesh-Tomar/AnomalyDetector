using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AnomalyDetectionDashboard.Services;

namespace AnomalyDetection.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AnalystOrAdmin")]
    public class DashboardNewController : ControllerBase
    {
        private readonly IDashboardNew _dashboardNewService;

        public DashboardNewController(IDashboardNew dashboardNewService)
        {
            _dashboardNewService = dashboardNewService;
        }

        [HttpGet("agent-health-report")]
        public async Task<IActionResult> GetReportAgentHealth([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            try
            {
                var kpis = await _dashboardNewService.GetReportAgentHealth(from, to);
                return Ok(kpis);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch KPIs", error = ex.Message });
            }
        }

        [HttpGet("alerts-heatmap")]
        public async Task<IActionResult> GetAlertsHeatmap([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            try
            {
                var result = await _dashboardNewService.GetAlertsHeatmap(from, to);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch alerts heatmap", error = ex.Message });
            }
        }

        [HttpGet("suppressions-trend")]
        public async Task<IActionResult> GetSuppressionsTrend([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            try
            {
                var result = await _dashboardNewService.GetSuppressionsTrend(from, to);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch suppressions trend", error = ex.Message });
            }
        }

        [HttpGet("events-duplicate-rate")]
        public async Task<IActionResult> GetEventsDuplicateRate([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            try
            {
                var result = await _dashboardNewService.GetEventsDuplicateRate(from, to);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch events duplicate rate", error = ex.Message });
            }
        }

        [HttpGet("entities-init-coverage")]
        public async Task<IActionResult> GetEntitiesInitCoverage()
        {
            try
            {
                var result = await _dashboardNewService.GetEntitiesInitCoverage();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch entities initialization coverage", error = ex.Message });
            }
        }

        [HttpGet("alerts-by-severity")]
        public async Task<IActionResult> GetAlertsBySeverity(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to,
            [FromQuery] Guid? agentId = null,
            [FromQuery] byte? metric = null)
        {
            try
            {
                var result = await _dashboardNewService.GetAlertsBySeverity(from, to, agentId, metric);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch alerts by severity", error = ex.Message });
            }
        }

        [HttpGet("alerts-z-distribution")]
        public async Task<IActionResult> GetAlertsZDistribution(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to,
            [FromQuery] byte? metric = null,
            [FromQuery] decimal binStep = 0.5m)
        {
            try
            {
                var result = await _dashboardNewService.GetAlertsZDistribution(from, to, metric, binStep);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch alerts Z-score distribution", error = ex.Message });
            }
        }

        [HttpGet("alerts-top-keys-by-zload")]
        public async Task<IActionResult> GetAlertsTopKeysByZLoad(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to,
            [FromQuery] int top = 20)
        {
            try
            {
                var result = await _dashboardNewService.GetAlertsTopKeysByZLoad(from, to, top);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch top keys by Z-load", error = ex.Message });
            }
        }

        [HttpGet("alerts-backlog-status")]
        public async Task<IActionResult> GetAlertsBacklogStatus(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to)
        {
            try
            {
                var result = await _dashboardNewService.GetAlertsBacklogStatus(from, to);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch alerts backlog status", error = ex.Message });
            }
        }

        [HttpGet("alerts-open-age-histogram")]
        public async Task<IActionResult> GetAlertsOpenAgeHistogram([FromQuery] DateTime from,
            [FromQuery] DateTime to, [FromQuery] int binHours = 6)
        {
            try
            {
                var result = await _dashboardNewService.GetAlertsOpenAgeHistogram(from, to, binHours);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch open alerts age histogram", error = ex.Message });
            }
        }

        [HttpGet("events-first-seen-keys")]
        public async Task<IActionResult> GetEventsFirstSeenKeys(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to,
            [FromQuery] int top = 200)
        {
            try
            {
                var result = await _dashboardNewService.GetEventsFirstSeenKeys(from, to, top);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch first seen event keys", error = ex.Message });
            }
        }

        [HttpGet("entities-drift-daily")]
        public async Task<IActionResult> GetEntitiesDriftDaily([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            try
            {
                var result = await _dashboardNewService.GetEntitiesDriftDaily(from, to);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch daily entity drifts", error = ex.Message });
            }
        }

        [HttpGet("entities-top-drifted-agents")]
        public async Task<IActionResult> GetEntitiesTopDriftedAgents([FromQuery] int top = 20)
        {
            try
            {
                var result = await _dashboardNewService.GetEntitiesTopDriftedAgents(top);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch top drifted agents", error = ex.Message });
            }
        }

        [HttpGet("noise-top-agents")]
        public async Task<IActionResult> GetNoiseTopAgents(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to,
            [FromQuery] int top = 10)
        {
            try
            {
                var result = await _dashboardNewService.GetNoiseTopAgents(from, to, top);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch top noisy agents", error = ex.Message });
            }
        }

        [HttpGet("noise-top-users")]
        public async Task<IActionResult> GetNoiseTopUsers(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to,
            [FromQuery] int top = 10)
        {
            try
            {
                var result = await _dashboardNewService.GetNoiseTopUsers(from, to, top);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch top noisy users", error = ex.Message });
            }
        }

        [HttpGet("noise-top-processes")]
        public async Task<IActionResult> GetNoiseTopProcesses(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to,
            [FromQuery] int top = 10)
        {
            try
            {
                var result = await _dashboardNewService.GetNoiseTopProcesses(from, to, top);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch top noisy processes", error = ex.Message });
            }
        }

        [HttpGet("alerts-vs-entities-baseline")]
        public async Task<IActionResult> GetAlertsVsEntitiesBaseline([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            try
            {
                var result = await _dashboardNewService.GetAlertsVsEntitiesBaseline(from, to);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch alerts vs entities baseline comparison", error = ex.Message });
            }
        }

        [HttpGet("sequence-proc-net-file")]
        public async Task<IActionResult> GetSequenceProcNetFile(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to,
            [FromQuery] int windowMinutes = 5,
            [FromQuery] int top = 100)
        {
            try
            {
                var result = await _dashboardNewService.GetSequenceProcNetFile(from, to, windowMinutes, top);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch process-network-file sequences", error = ex.Message });
            }
        }

        [HttpGet("processing-funnel")]
        public async Task<IActionResult> GetProcessingFunnel(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to)
        {
            try
            {
                var result = await _dashboardNewService.GetProcessingFunnel(from, to);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to Processing Funnel", error = ex.Message });
            }
        }
    }
}