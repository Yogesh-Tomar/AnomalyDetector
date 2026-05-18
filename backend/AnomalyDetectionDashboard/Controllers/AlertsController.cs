using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Models;
using AnomalyDetectionDashboard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnomalyDetectionDashboard.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AnalystOrAdmin")]
    public class AlertsController : ControllerBase
    {
        private readonly IAlertService _alertService;

        public AlertsController(IAlertService alertService)
        {
            _alertService = alertService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAlerts([FromQuery] AlertFilterDto filters)
        {
            var result = await _alertService.GetAlertsAsync(filters);
            return Ok(new { result });
        }

        [HttpPost("{agentId:guid}/{tsUtc:datetime}/{metric:int}/{keyId:long}/mark-read")]
        public async Task<IActionResult> InvestigateAlert(
        Guid agentId, DateTime tsUtc, int metric, long keyId)
        {
            var success = await _alertService.InvestigateAlertAsync(agentId, tsUtc, (byte)metric, keyId);
            return success ? Ok() : BadRequest("Failed to investigate alert");
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetAlertSummary(
            [FromQuery] AlertSummaryRequest request)
        {
            var summary = await _alertService.GetAlertSummaryAsync(request.AgentId, request.KeyId, request.Key);
            return Ok(summary);
        }

        [HttpPost("{agentId:guid}/mute")]
        public async Task<IActionResult> MuteAlert(Guid agentId)
        {
            var success = await _alertService.MuteAlertAsync(agentId);
            return success ? Ok() : BadRequest("Failed to mute alert");
        }

        [HttpGet("context")]
        public async Task<IActionResult> GetAlertContext([FromQuery] AlertInvestigationRequest request)
        {
            var context = await _alertService.GetAlertInvestigationAsync(request);
            return context != null ? Ok(context) : NotFound();
        }

        [HttpPost("exclude")]
        public async Task<IActionResult> ExcludeAlert([FromBody] AlertWhitelistRuleRequest request)
        {
            var success = await _alertService.ExcludeAlertAsync(request);
            return success ? Ok() : BadRequest("Failed to exclude alert");
        }

        [HttpGet("white-list-rule/{id:long}")]
        public async Task<IActionResult> GetWhiteListRule(long id)
        {
            var user = await _alertService.GetWhitelistRuleAsync(id);
            return user != null ? Ok(user) : NotFound();
        }

        [HttpGet("white-list-rules")]
        public async Task<IActionResult> GetWhiteListRules()
        {
            var whitelistRules = await _alertService.GetActiveWhitelistRulesAsync();
            return Ok(whitelistRules);
        }

        [HttpPut("update-white-list-rule/{id:long}")]
        public async Task<IActionResult> UpdateWhitelistRule(long id, [FromBody] AlertWhitelistRuleRequest request)
        {
            var success = await _alertService.UpdateWhitelistRuleAsync(id, request);
            return success ? Ok() : BadRequest("Failed to update user");
        }

        [HttpDelete("delete-white-list-rule/{id:long}")]
        public async Task<IActionResult> DeleteWhiteListRule(long id)
        {
            var success = await _alertService.DeleteWhitelistRuleAsync(id);
            return success ? Ok() : BadRequest("Failed to delete user");
        }

        [HttpGet("{agentId:guid}/{alertTsUtc:datetime}/{keyId:long}/investigate")]
        public async Task<ActionResult<AlertInvestigationResponse>> InvestigateAlert(
        Guid agentId, DateTime alertTsUtc, long keyId)
        {
            var result = await _alertService.InvestigateAlertAsync(agentId, alertTsUtc, keyId);

            if (result == null)
                return NotFound();

            // Mark as read
            await _alertService.MarkAlertAsReadAsync(agentId, alertTsUtc, keyId);

            return Ok(result);
        }

        [HttpPost("{agentId}/{alertTsUtc}/{keyId}/mark-read")]
        public async Task<IActionResult> MarkAsRead(Guid agentId, DateTime alertTsUtc, long keyId)
        {
            await _alertService.MarkAlertAsReadAsync(agentId, alertTsUtc, keyId);
            return Ok();
        }

        [HttpPost("{agentId}/{alertTsUtc}/{keyId}/{note}/note")]
        public async Task<IActionResult> AddNote(Guid agentId, DateTime alertTsUtc, long keyId, string note)
        {
            // Try to get the full name from claims, fallback to Name or NameIdentifier
            var createdBy = User.Claims.FirstOrDefault(c => c.Type == "name")?.Value
                         ?? User.Claims.FirstOrDefault(c => c.Type == "fullname")?.Value
                         ?? User.Identity?.Name
                         ?? User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name")?.Value
                         ?? "Unknown";

            await _alertService.AddNote(agentId, alertTsUtc, keyId, note, createdBy);
            return Ok();
        }

        [HttpGet("filter-options")]
        public async Task<IActionResult> FilterOptions()
        {
            var success = await _alertService.GetFilterOptionsAsync();
            return Ok(new { success });
        }
                
        [HttpGet("dump/{id:guid}")]
        public async Task<IActionResult> GetDump(Guid id)
        {
            var dump = await _alertService.GetDumpByIdAsync(id);
            return dump != null ? Ok(dump) : NotFound();
        }

        [HttpGet("dumps")]
        public async Task<IActionResult> GetDumps([FromQuery] DumpsFilterDto filters)
        {
            var Dumps = await _alertService.GetAllDumpsAsync(filters);
            return Ok(Dumps);
        }

        [HttpGet("distinct-values")]
        public async Task<IActionResult> GetDistinctValues([FromQuery] string field)
        {
            var values = await _alertService.GetDistinctValuesAsync(field);
            return Ok(values);
        }
    }

    public class InvestigateAlertRequest
    {
        public string? AnalystNote { get; set; }
    }
}