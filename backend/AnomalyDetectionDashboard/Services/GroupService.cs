using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Models;
using Microsoft.EntityFrameworkCore;

namespace AnomalyDetectionDashboard.Services
{
    public class GroupService : IGroupService
    {
        private readonly AnomalyDbContext _context;

        public GroupService(AnomalyDbContext context)
        {
            _context = context;
        }

        public async Task<List<GroupResponse>> GetGroupsAsync()
        {
            var groups = await _context.Groups
                .Include(g => g.ConfigState)
                .Include(g => g.Agents)
                .OrderBy(g => g.Name)
                .ToListAsync();

            return groups.Select(g => new GroupResponse
            {
                GroupId = g.GroupId,
                Name = g.Name,
                Description = g.Description,
                ConfigurationId = g.ConfigStateId,
                ConfigurationName = g.ConfigState?.ConfigName ?? "None",
                AgentIds = g.Agents?.Select(a => a.AgentId).ToList() ?? new List<Guid>(),
                AgentCount = g.Agents?.Count ?? 0,
                CreatedUtc = g.CreatedUtc,
                UpdatedUtc = g.UpdatedUtc
            }).ToList();
        }

        public async Task<List<AgentDropdownItem>> GetAgentDropdownAsync()
        {
            return await _context.Agents
                .OrderBy(c => c.Hostname)
                .Select(c => new AgentDropdownItem
                {
                    Id = c.AgentId,
                    Name = c.Hostname?? "Unnamed"
                })
                .ToListAsync();
        }

        public async Task<GroupResponse?> GetGroupAsync(Guid id)
        {
            var group = await _context.Groups
                .Include(g => g.ConfigState)
                .Include(g => g.Agents)
                .FirstOrDefaultAsync(g => g.GroupId == id);

            if (group == null) return null;

            return new GroupResponse
            {
                GroupId = group.GroupId,
                Name = group.Name,
                Description = group.Description,
                ConfigurationId = group.ConfigStateId,
                ConfigurationName = group.ConfigState?.ConfigName ?? "None",
                AgentIds = group.Agents?.Select(a => a.AgentId).ToList() ?? new List<Guid>(),
                AgentCount = group.Agents?.Count ?? 0,
                CreatedUtc = group.CreatedUtc,
                UpdatedUtc = group.UpdatedUtc
            };
        }

        public async Task<GroupResponse?> CreateGroupAsync(CreateGroupRequest request)
        {
            try
            {
                // Check if name already exists
                var existingGroup = await _context.Groups
                    .FirstOrDefaultAsync(g => g.Name == request.Name);

                if (existingGroup != null) return null;

                var group = new Group
                {
                    GroupId = Guid.NewGuid(),
                    Name = request.Name,
                    Description = request.Description,
                    ConfigStateId = request.ConfigurationId,
                    CreatedUtc = DateTime.UtcNow,
                    UpdatedUtc = DateTime.UtcNow
                };

                _context.Groups.Add(group);
                await _context.SaveChangesAsync();

                return await GetGroupAsync(group.GroupId);
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> UpdateGroupAsync(Guid id, UpdateGroupRequest request)
        {
            try
            {
                var group = await _context.Groups
                    .FirstOrDefaultAsync(g => g.GroupId == id);

                if (group == null) return false;

                // Check for name conflicts
                if (!string.IsNullOrEmpty(request.Name) && request.Name != group.Name)
                {
                    var nameExists = await _context.Groups
                        .AnyAsync(g => g.Name == request.Name && g.GroupId != id);
                    if (nameExists) return false;
                    group.Name = request.Name;
                }

                if (request.Description != null)
                    group.Description = request.Description;

                if (request.ConfigurationId.HasValue)
                    group.ConfigStateId = request.ConfigurationId.Value;

                group.UpdatedUtc = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteGroupAsync(Guid id)
        {
            try
            {
                var group = await _context.Groups
                    .Include(g => g.Agents)
                    .FirstOrDefaultAsync(g => g.GroupId == id);

                if (group == null) return false;

                // Remove all agents from this group
                if (group.Agents?.Any() == true)
                {
                    foreach (var agent in group.Agents)
                    {
                        agent.GroupId = null;
                    }
                }

                _context.Groups.Remove(group);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> AssignAgentsAsync(Guid groupId, List<Guid> agentIds)
        {
            try
            {
                var group = await _context.Groups
                    .FirstOrDefaultAsync(g => g.GroupId == groupId);

                if (group == null) return false;

                // Remove agents from other groups (an agent can only be in one group)
                var allAgents = await _context.Agents
                    .Where(a => agentIds.Contains(a.AgentId))
                    .ToListAsync();

                // Clear existing assignments for these agents
                foreach (var agent in allAgents)
                {
                    agent.GroupId = groupId;
                }

                // Remove agents not in the new list from this group
                var currentGroupAgents = await _context.Agents
                    .Where(a => a.GroupId == groupId && !agentIds.Contains(a.AgentId))
                    .ToListAsync();

                foreach (var agent in currentGroupAgents)
                {
                    agent.GroupId = null;
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}