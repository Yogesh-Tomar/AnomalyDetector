using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Models;
using AnomalyDetectionDashboard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AnomalyDetectionDashboard.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")]
    public class SettingsController : ControllerBase
    {
        private readonly ISettingsService _settingsService;

        public SettingsController(ISettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _settingsService.GetSettingsAsync();
            return Ok(settings);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSettings([FromBody] SettingsRequest request)
        {
            var username = User.Identity?.Name ?? "Unknown";
            var success = await _settingsService.UpdateSettingsAsync(request, username);
            return success ? Ok() : BadRequest("Failed to update settings");
        }

        // --- Network endpoints ---

        [HttpGet("networks")]
        public async Task<IActionResult> GetAllNetworks()
        {
            var result = await _settingsService.GetAllNetworksAsync();
            return Ok(result);
        }

        [HttpGet("networks/{id:long}")]
        public async Task<IActionResult> GetNetworkById(long id)
        {
            var result = await _settingsService.GetNetworkByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost("networks")]
        public async Task<IActionResult> CreateNetwork([FromBody] Network network)
        {
            var created = await _settingsService.CreateNetworkAsync(network);
            return CreatedAtAction(nameof(GetNetworkById), new { id = created.NetworkId }, created);
        }

        [HttpPut("networks/{id:long}")]
        public async Task<IActionResult> UpdateNetwork(long id, [FromBody] Network network)
        {
            if (id != network.NetworkId)
                return BadRequest("ID mismatch");

            var success = await _settingsService.UpdateNetworkAsync(network);
            return success ? Ok() : NotFound();
        }

        [HttpDelete("networks/{id:long}")]
        public async Task<IActionResult> DeleteNetwork(long id)
        {
            var success = await _settingsService.DeleteNetworkAsync(id);
            return success ? Ok() : NotFound();
        }

        // --- Cmdb endpoints ---

        [HttpGet("cmdb")]
        public async Task<IActionResult> GetAllCmdb()
        {
            var result = await _settingsService.GetAllCmdbAsync();
            return Ok(result);
        }

        [HttpGet("cmdb/{id:long}")]
        public async Task<IActionResult> GetCmdbById(long id)
        {
            var result = await _settingsService.GetCmdbByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost("cmdb")]
        public async Task<IActionResult> CreateCmdb([FromBody] Cmdb cmdb)
        {
            var created = await _settingsService.CreateCmdbAsync(cmdb);
            return CreatedAtAction(nameof(GetCmdbById), new { id = created.CmdbId }, created);
        }

        [HttpPut("cmdb/{id:long}")]
        public async Task<IActionResult> UpdateCmdb(long id, [FromBody] Cmdb cmdb)
        {
            if (id != cmdb.CmdbId)
                return BadRequest("ID mismatch");

            var success = await _settingsService.UpdateCmdbAsync(cmdb);
            return success ? Ok() : NotFound();
        }

        [HttpDelete("cmdb/{id:long}")]
        public async Task<IActionResult> DeleteCmdb(long id)
        {
            var success = await _settingsService.DeleteCmdbAsync(id);
            return success ? Ok() : NotFound();
        }

        [HttpPost("cmdb/bulk-upsert")]
        public async Task<IActionResult> BulkUpsertCmdb([FromBody] CmdbBulkUpsertRequest request)
        {
            var result = await _settingsService.BulkUpsertCmdbAsync(request);
            return Ok(result);
        }
    }
}