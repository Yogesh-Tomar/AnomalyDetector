using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AnomalyDetectionDashboard.Services;
using AnomalyDetectionDashboard.DTOs;

namespace AnomalyDetectionDashboard.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ConfigurationsController : ControllerBase
    {
        private readonly IConfigurationService _configurationService;

        public ConfigurationsController(IConfigurationService configurationService)
        {
            _configurationService = configurationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetConfigurations()
        {
            var configurations = await _configurationService.GetConfigurationsAsync();
            return Ok(configurations);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetConfiguration(Guid id)
        {
            var configuration = await _configurationService.GetConfigurationAsync(id);
            return configuration != null ? Ok(configuration) : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> CreateConfiguration([FromBody] CreateConfigurationRequest request)
        {
            var configuration = await _configurationService.CreateConfigurationAsync(request);
            return configuration != null
                ? CreatedAtAction(nameof(GetConfiguration), new { id = configuration.ConfigStateId }, configuration)
                : BadRequest("Failed to create configuration");
        }

        [HttpGet("dropdown")]
        public async Task<IActionResult> GetConfigurationDropdown()
        {
            var items = await _configurationService.GetConfigurationDropdownAsync();
            return Ok(items);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateConfiguration(Guid id, [FromBody] UpdateConfigurationRequest request)
        {
            var success = await _configurationService.UpdateConfigurationAsync(id, request);
            return success ? Ok() : BadRequest("Failed to update configuration");
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteConfiguration(Guid id)
        {
            var result = await _configurationService.DeleteConfigurationAsync(id);
            if (result.Success) return NoContent();
            return StatusCode(result.StatusCode, result.Error);
        }
    }
}
