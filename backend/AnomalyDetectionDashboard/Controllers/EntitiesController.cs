using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AnomalyDetectionDashboard.Services;
using AnomalyDetectionDashboard.DTOs;

namespace AnomalyDetectionDashboard.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AnalystOrAdmin")]
    public class EntitiesController : ControllerBase
    {
        private readonly IEntityService _entityService;

        public EntitiesController(IEntityService entityService)
        {
            _entityService = entityService;
        }

        [HttpGet]
        public async Task<IActionResult> GetEntities([FromQuery] EntityFilters filters)
        {
            var (entities, totalCount, summary) = await _entityService.GetEntitiesAsync(filters);
            return Ok(new { entities, totalCount, summary });
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetEntitySummary(
            [FromQuery] EntitySummaryRequest request)
        {
            var summary = await _entityService.GetEntitySummaryAsync(request.AgentId, request.KeyId, request.Key);
            return Ok(summary);
        }
    }
}