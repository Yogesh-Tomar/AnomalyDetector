using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AnomalyDetectionDashboard.Services;
using AnomalyDetectionDashboard.DTOs;

namespace AnomalyDetectionDashboard.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")]
    public class GroupsController : ControllerBase
    {
        private readonly IGroupService _groupService;

        public GroupsController(IGroupService groupService)
        {
            _groupService = groupService;
        }

        [HttpGet]
        public async Task<IActionResult> GetGroups()
        {
            var groups = await _groupService.GetGroupsAsync();
            return Ok(groups);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetGroup(Guid id)
        {
            var group = await _groupService.GetGroupAsync(id);
            return group != null ? Ok(group) : NotFound();
        }

        [HttpGet("agent-dropdown")]
        public async Task<IActionResult> GetAgentDropdown()
        {
            var items = await _groupService.GetAgentDropdownAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest request)
        {
            var group = await _groupService.CreateGroupAsync(request);
            return group != null
                ? CreatedAtAction(nameof(GetGroup), new { id = group.GroupId }, group)
                : BadRequest("Failed to create group");
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateGroup(Guid id, [FromBody] UpdateGroupRequest request)
        {
            var success = await _groupService.UpdateGroupAsync(id, request);
            return success ? Ok() : BadRequest("Failed to update group");
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteGroup(Guid id)
        {
            var success = await _groupService.DeleteGroupAsync(id);
            return success ? Ok() : BadRequest("Failed to delete group");
        }

        [HttpPost("{id:guid}/agents")]
        public async Task<IActionResult> AssignAgents(Guid id, [FromBody] AssignAgentsRequest request)
        {
            var success = await _groupService.AssignAgentsAsync(id, request.AgentIds);
            return success ? Ok() : BadRequest("Failed to assign agents");
        }
    }

    public class AssignAgentsRequest
    {
        public List<Guid> AgentIds { get; set; } = new();
    }
}