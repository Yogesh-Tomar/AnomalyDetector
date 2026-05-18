// Controllers/NetworkGraphController.cs
using AnomalyDetectionDashboard.Services;
using AnomalyDetectionDashboard.DTOs.NetworkGraph;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnomalyDetectionDashboard.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AnalystOrAdmin")]
    public class NetworkGraphController : ControllerBase
    {
        private readonly INetworkGraphService _networkGraphService;
        private readonly ILogger<NetworkGraphController> _logger;

        public NetworkGraphController(
            INetworkGraphService networkGraphService,
            ILogger<NetworkGraphController> logger)
        {
            _networkGraphService = networkGraphService;
            _logger = logger;
        }

        /// <summary>
        /// Get network graph data with optional filtering
        /// </summary>
        /// <param name="request">Graph request parameters</param>
        /// <returns>Network graph with nodes and edges</returns>
        [HttpPost("graph")]
        [ProducesResponseType(typeof(NetworkGraphResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<NetworkGraphResponseDto>> GetNetworkGraph(
            [FromBody] NetworkGraphRequestDto request)
        {
            try
            {
                _logger.LogInformation("Network graph requested by user {UserId} with filters: {@Request}",
                    User.Identity?.Name, request);

                // Validate request
                if (request.StartTime.HasValue && request.EndTime.HasValue &&
                    request.StartTime > request.EndTime)
                {
                    return BadRequest("StartTime cannot be greater than EndTime");
                }

                // Set reasonable defaults and limits
                if (request.MinConnections < 1)
                    request.MinConnections = 1;

                if (!request.MaxNodes.HasValue || request.MaxNodes > 2000)
                    request.MaxNodes = 1000;

                if (!request.MaxEdges.HasValue || request.MaxEdges > 10000)
                    request.MaxEdges = 5000;

                // Set default time range if not provided (last 24 hours)
                if (!request.StartTime.HasValue)
                    request.StartTime = DateTime.UtcNow.AddHours(-24);

                if (!request.EndTime.HasValue)
                    request.EndTime = DateTime.UtcNow;

                //var result = await _networkGraphService.GetNetworkGraphAsync(request);
                var result = await _networkGraphService.ExecuteOptimizedQueryAsync(request);

                _logger.LogInformation("Network graph returned {NodeCount} nodes and {EdgeCount} edges",
                    result.Nodes.Count, result.Edges.Count);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid request for network graph");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing network graph request");
                return StatusCode(500, "An error occurred while processing the request");
            }
        }

        /// <summary>
        /// Get detailed investigation data for a specific network node
        /// </summary>
        /// <param name="ipAddress">IP address of the node to investigate</param>
        /// <param name="startTime">Optional start time for investigation period</param>
        /// <param name="endTime">Optional end time for investigation period</param>
        /// <returns>Detailed node investigation data</returns>
        [HttpGet("investigate/node/{ipAddress}")]
        [ProducesResponseType(typeof(NodeInvestigationDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<NodeInvestigationDto>> InvestigateNode(
            string ipAddress,
            [FromQuery] DateTime? startTime = null,
            [FromQuery] DateTime? endTime = null)
        {
            try
            {
                _logger.LogInformation("Node investigation requested for {IpAddress} by user {UserId}",
                    ipAddress, User.Identity?.Name);

                if (string.IsNullOrWhiteSpace(ipAddress))
                {
                    return BadRequest("IP address is required");
                }

                // Validate IP address format
                if (!System.Net.IPAddress.TryParse(ipAddress, out _))
                {
                    return BadRequest("Invalid IP address format");
                }

                var result = await _networkGraphService.GetNodeInvestigationAsync(ipAddress, startTime, endTime);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Node not found: {IpAddress}", ipAddress);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error investigating node {IpAddress}", ipAddress);
                return StatusCode(500, "An error occurred while processing the request");
            }
        }

        /// <summary>
        /// Get detailed information about connections between two nodes
        /// </summary>
        /// <param name="sourceIp">Source IP address</param>
        /// <param name="targetIp">Target IP address</param>
        /// <param name="startTime">Optional start time for investigation period</param>
        /// <param name="endTime">Optional end time for investigation period</param>
        /// <returns>Connection details between the two nodes</returns>
        [HttpGet("investigate/edge/{sourceIp}/{targetIp}")]
        [ProducesResponseType(typeof(List<ConnectionDetailDto>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<List<ConnectionDetailDto>>> InvestigateEdge(
            string sourceIp,
            string targetIp,
            [FromQuery] DateTime? startTime = null,
            [FromQuery] DateTime? endTime = null)
        {
            try
            {
                _logger.LogInformation("Edge investigation requested between {SourceIp} and {TargetIp} by user {UserId}",
                    sourceIp, targetIp, User.Identity?.Name);

                if (string.IsNullOrWhiteSpace(sourceIp) || string.IsNullOrWhiteSpace(targetIp))
                {
                    return BadRequest("Both source and target IP addresses are required");
                }

                // Validate IP address formats
                if (!System.Net.IPAddress.TryParse(sourceIp, out _) ||
                    !System.Net.IPAddress.TryParse(targetIp, out _))
                {
                    return BadRequest("Invalid IP address format");
                }

                var result = await _networkGraphService.GetEdgeDetailsAsync(sourceIp, targetIp, startTime, endTime);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error investigating edge between {SourceIp} and {TargetIp}", sourceIp, targetIp);
                return StatusCode(500, "An error occurred while processing the request");
            }
        }

        /// <summary>
        /// Get network graph statistics for a given time period
        /// </summary>
        /// <param name="startTime">Start time for statistics period</param>
        /// <param name="endTime">End time for statistics period</param>
        /// <returns>Network graph statistics</returns>
        [HttpGet("statistics")]
        [ProducesResponseType(typeof(NetworkGraphStatsDto), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<NetworkGraphStatsDto>> GetStatistics(
            [FromQuery] DateTime? startTime = null,
            [FromQuery] DateTime? endTime = null)
        {
            try
            {
                _logger.LogInformation("Network statistics requested by user {UserId}", User.Identity?.Name);

                var request = new NetworkGraphRequestDto
                {
                    StartTime = startTime ?? DateTime.UtcNow.AddHours(-24),
                    EndTime = endTime ?? DateTime.UtcNow,
                    MinConnections = 1,
                    MaxNodes = int.MaxValue,
                    MaxEdges = int.MaxValue
                };

                var result = await _networkGraphService.GetNetworkGraphAsync(request);

                return Ok(result.Statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting network statistics");
                return StatusCode(500, "An error occurred while processing the request");
            }
        }

        /// <summary>
        /// Get available connection types for filtering
        /// </summary>
        /// <returns>List of available connection types</returns>
        [HttpGet("connection-types")]
        [ProducesResponseType(typeof(List<string>), 200)]
        public async Task<ActionResult<List<string>>> GetConnectionTypes()
        {
            var connectionTypes = await _networkGraphService.GetNetworkConnections();
            return Ok(connectionTypes);
        }

        /// <summary>
        /// Get available protocols for filtering
        /// </summary>
        /// <returns>List of available protocols</returns>
        [HttpGet("protocols")]
        [ProducesResponseType(typeof(List<string>), 200)]
        public async Task<ActionResult<List<string>>> GetProtocols()
        {
            try
            {
                // This could be cached or computed periodically
                var protocols = await _networkGraphService.GetDistinctProtocolsAsync();
                return Ok(protocols);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available protocols");
                return StatusCode(500, "An error occurred while processing the request");
            }
        }

        /// Get available processes for filtering
        /// </summary>
        /// <returns>List of available processes</returns>
        [HttpGet("processes")]
        [ProducesResponseType(typeof(List<string>), 200)]
        public async Task<ActionResult<List<string>>> GetProcesses()
        {
            try
            {
                // This could be cached or computed periodically
                var protocols = await _networkGraphService.GetDistinctProcessAsync();
                return Ok(protocols);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available processes");
                return StatusCode(500, "An error occurred while processing the request");
            }
        }


        /// <summary>
        /// Get all distinct target IP addresses for dropdowns
        /// </summary>
        /// <returns>List of unique target IPs</returns>
        [HttpGet("ip-origins")]
        [ProducesResponseType(typeof(List<string>), 200)]
        public async Task<ActionResult<List<string>>> GetTargetIps()
        {
            try
            {
                var ips = await _networkGraphService.GetDistinctTargetIpsAsync();
                return Ok(ips);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting distinct target IPs");
                return StatusCode(500, "An error occurred while processing the request");
            }
        }

        /// <summary>
        /// Get all distinct target IP addresses for dropdowns
        /// </summary>
        /// <returns>List of unique target IPs</returns>
        [HttpGet("source-hosts")]
        [ProducesResponseType(typeof(List<string>), 200)]
        public async Task<ActionResult<List<string>>> GetSourceHost()
        {
            try
            {
                var ips = await _networkGraphService.GetSourceHostsAsync();
                return Ok(ips);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting distinct target IPs");
                return StatusCode(500, "An error occurred while processing the request");
            }
        }
    }
}