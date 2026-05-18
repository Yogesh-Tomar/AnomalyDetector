using AnomalyDetectionDashboard.Models;
using AnomalyDetectionDashboard.Services;
using AnomalyDetectionDashboard.DTOs.NetworkGraph;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace AnomalyDetectionDashboard.Services
{
    public class NetworkGraphService : INetworkGraphService
    {
        private readonly AnomalyDbContext _context;
        private readonly ILogger<NetworkGraphService> _logger;
        private readonly string _connectionString;
        public NetworkGraphService(AnomalyDbContext context, ILogger<NetworkGraphService> logger, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string not found.");
        }

        public async Task<NetworkGraphResponseDto> GetNetworkGraphAsync(NetworkGraphRequestDto request)
        {
            try
            {
                _logger.LogInformation("Fetching network graph data with filters: {@Request}", request);

                var startTime = request.StartTime ?? DateTime.UtcNow.AddHours(-24);
                var endTime = request.EndTime ?? DateTime.UtcNow;
                var minConnections = request.MinConnections;

                var edges = new List<NetworkGraphEdge>();

                using (var conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();
                    using (var cmd = new SqlCommand(
                        "SELECT * FROM dbo.fn_GetNetworkGraphTimeWindow(@startTime, @endTime, @minConnections)", conn))
                    {
                        cmd.Parameters.AddWithValue("@startTime", startTime);
                        cmd.Parameters.AddWithValue("@endTime", endTime);
                        cmd.Parameters.AddWithValue("@minConnections", minConnections);

                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            // Cache column ordinals
                            int edgeIdOrdinal = reader.GetOrdinal("EdgeId");
                            int destinationScopeOrdinal = reader.GetOrdinal("DestinationScope");
                            int hostnameOrdinal = reader.GetOrdinal("Hostname");
                            int sourceNodeOrdinal = reader.GetOrdinal("SourceNode");
                            int targetNodeOrdinal = reader.GetOrdinal("TargetNode");
                            int portOrdinal = reader.GetOrdinal("Port");
                            int protocolOrdinal = reader.GetOrdinal("Protocol");
                            int techniqueIdOrdinal = reader.GetOrdinal("TechniqueId");
                            int processOrdinal = reader.GetOrdinal("Process");
                            int userOrdinal = reader.GetOrdinal("User");
                            int connectionCountOrdinal = reader.GetOrdinal("ConnectionCount");
                            int firstSeenOrdinal = reader.GetOrdinal("FirstSeen");
                            int lastSeenOrdinal = reader.GetOrdinal("LastSeen");
                            int agentCountOrdinal = reader.GetOrdinal("AgentCount");
                            int rulesOrdinal = reader.GetOrdinal("Rules");
                            int durationMinutesOrdinal = reader.GetOrdinal("DurationMinutes");
                            //int sourceNodeTypeOrdinal = reader.GetOrdinal("SourceNodeType");
                            //int targetNodeTypeOrdinal = reader.GetOrdinal("TargetNodeType");

                            while (await reader.ReadAsync())
                            {
                                var edge = new NetworkGraphEdge
                                {
                                    EdgeId = reader.IsDBNull(edgeIdOrdinal) ? Array.Empty<byte>() : (byte[])reader[edgeIdOrdinal],
                                    DestinationScope = reader.IsDBNull(destinationScopeOrdinal) ? null : reader.GetString(destinationScopeOrdinal),
                                    Hostname = reader.IsDBNull(hostnameOrdinal) ? null : reader.GetString(hostnameOrdinal),
                                    SourceNode = reader.IsDBNull(sourceNodeOrdinal) ? "" : reader.GetString(sourceNodeOrdinal),
                                    TargetNode = reader.IsDBNull(targetNodeOrdinal) ? "" : reader.GetString(targetNodeOrdinal),
                                    Port = reader.IsDBNull(portOrdinal) ? (int?)null : reader.GetInt32(portOrdinal),
                                    Protocol = reader.IsDBNull(protocolOrdinal) ? null : reader.GetString(protocolOrdinal),
                                    TechniqueId = reader.IsDBNull(techniqueIdOrdinal) ? null : reader.GetString(techniqueIdOrdinal),
                                    Process = reader.IsDBNull(processOrdinal) ? null : reader.GetString(processOrdinal),
                                    User = reader.IsDBNull(userOrdinal) ? null : reader.GetString(userOrdinal),
                                    ConnectionCount = reader.IsDBNull(connectionCountOrdinal) ? 0 : reader.GetInt32(connectionCountOrdinal),
                                    FirstSeen = reader.IsDBNull(firstSeenOrdinal) ? DateTime.MinValue : reader.GetDateTime(firstSeenOrdinal),
                                    LastSeen = reader.IsDBNull(lastSeenOrdinal) ? DateTime.MinValue : reader.GetDateTime(lastSeenOrdinal),
                                    AgentCount = reader.IsDBNull(agentCountOrdinal) ? 0 : reader.GetInt32(agentCountOrdinal),
                                    Rules = reader.IsDBNull(rulesOrdinal) ? null : reader.GetString(rulesOrdinal),
                                    DurationMinutes = reader.IsDBNull(durationMinutesOrdinal) ? 0 : reader.GetInt32(durationMinutesOrdinal),
                                    //SourceNodeType = reader.IsDBNull(sourceNodeTypeOrdinal) ? null : reader.GetString(sourceNodeTypeOrdinal),
                                    //TargetNodeType = reader.IsDBNull(targetNodeTypeOrdinal) ? null : reader.GetString(targetNodeTypeOrdinal)
                                };
                                edges.Add(edge);
                            }
                        }
                    }
                }

                // Get edges from the view with time window
                //var edgesQuery = _context.Database
                //    .SqlQueryRaw<NetworkGraphEdge>(@"
                //    SELECT * FROM dbo.fn_GetNetworkGraphTimeWindow(@startTime, @endTime, @minConnections)",
                //        new Microsoft.Data.SqlClient.SqlParameter("@startTime", startTime),
                //        new Microsoft.Data.SqlClient.SqlParameter("@endTime", endTime),
                //        new Microsoft.Data.SqlClient.SqlParameter("@minConnections", minConnections));

                //var edges = await edgesQuery.ToListAsync();

                // Apply additional filters
                edges = ApplyFilters(edges, request);

                // Filter out unicast/broadcast addresses
                edges = edges.Where(e =>
                    e.SourceNode != e.TargetNode &&
                    !IsUnicastOrBroadcast(e.SourceNode) &&
                    !IsUnicastOrBroadcast(e.TargetNode)
                ).ToList();

                // Limit results if specified
                if (request.MaxEdges.HasValue && edges.Count > request.MaxEdges.Value)
                {
                    edges = edges.OrderByDescending(e => e.ConnectionCount).Take(request.MaxEdges.Value).ToList();
                }

                // Get all unique IP addresses from edges
                var allIps = edges.SelectMany(e => new[] { e.SourceNode, e.TargetNode }).Distinct().ToList();

                // Get node information
                var nodes = await GetNodesAsync(allIps);

                // Limit nodes if specified
                if (request.MaxNodes.HasValue && nodes.Count > request.MaxNodes.Value)
                {
                    var topNodes = nodes.OrderByDescending(n => n.TotalConnections).Take(request.MaxNodes.Value).ToList();
                    var topNodeIps = topNodes.Select(n => n.IpAddress).ToHashSet();

                    // Filter edges to only include connections between top nodes
                    edges = edges.Where(e => topNodeIps.Contains(e.SourceNode) && topNodeIps.Contains(e.TargetNode)).ToList();
                    nodes = topNodes;
                }

                // Convert to DTOs
                var nodesDtos = nodes.Select(n => ConvertToNodeDto(n)).ToList();
                var edgesDtos = edges.Select(e => ConvertToEdgeDto(e)).ToList();

                var response = new NetworkGraphResponseDto
                {
                    Nodes = nodesDtos,
                    Edges = edgesDtos,
                    Statistics = await CalculateStatistics(nodesDtos, edgesDtos)
                };

                _logger.LogInformation("Retrieved {NodeCount} nodes and {EdgeCount} edges",
                    nodesDtos.Count, edgesDtos.Count);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching network graph data");
                throw;
            }
        }

        private bool IsUnicastOrBroadcast(string ipAddress)
        {
            if (string.IsNullOrEmpty(ipAddress)) return true;

            // Filter broadcast/loopback/multicast
            if (ipAddress == "0.0.0.0" || ipAddress == "255.255.255.255" ||
                ipAddress == "127.0.0.1" || ipAddress == "::1" || ipAddress == "::")
                return true;

            // IPv4 multicast (224.0.0.0/4)
            if (ipAddress.StartsWith("224.") || ipAddress.StartsWith("239."))
                return true;

            // IPv6 multicast (ff00::/8)
            if (ipAddress.StartsWith("ff"))
                return true;

            // Link-local addresses
            if (ipAddress.StartsWith("169.254.") || ipAddress.StartsWith("fe80:"))
                return true;

            return false;
        }

        public async Task<NodeInvestigationDto> GetNodeInvestigationAsync(string ipAddress, DateTime? startTime = null, DateTime? endTime = null)
        {
            try
            {
                var start = startTime ?? DateTime.UtcNow.AddHours(-24);
                var end = endTime ?? DateTime.UtcNow;

                // Get node information
                var node = await _context.Database
                    .SqlQueryRaw<NetworkNode>("SELECT * FROM vNetworkNodes WHERE IpAddress = {0}", ipAddress)
                    .FirstOrDefaultAsync();

                if (node == null)
                {
                    throw new ArgumentException($"Node with IP {ipAddress} not found");
                }

                // Get recent connections
                var connections = await _context.Database
                .SqlQueryRaw<NetworkConnection>(@"
                SELECT TOP 100 * FROM vNetworkConnections
                WHERE (SourceIp = {0} OR DestinationIp = {0}) 
                AND TsUtc >= {1} AND TsUtc <= {2}
                ORDER BY TsUtc DESC", ipAddress, start, end)
                .ToListAsync();

                // Group by processes and users
                var topProcesses = connections
                    .Where(c => !string.IsNullOrEmpty(c.Process))
                    .GroupBy(c => c.Process!)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => g.Key)
                    .ToList();

                var topUsers = connections
                    .Where(c => !string.IsNullOrEmpty(c.User))
                    .GroupBy(c => c.User!)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => g.Key)
                    .ToList();

                // Group by techniques
                var techniques = connections
                    .Where(c => !string.IsNullOrEmpty(c.TechniqueId))
                    .GroupBy(c => c.TechniqueId!)
                    .Select(g => new TechniqueUsageDto
                    {
                        TechniqueId = g.Key,
                        Count = g.Count(),
                        LastSeen = g.Max(x => x.TsUtc)
                    })
                    .OrderByDescending(t => t.Count)
                    .ToList();

                // Convert connections to details
                var connectionDetails = connections.Take(50).Select(c => new ConnectionDetailDto
                {
                    RemoteIp = c.DestinationIp,
                    Port = c.DestinationPort,
                    Protocol = c.Protocol ?? "unknown",
                    Process = c.Process ?? "unknown",
                    User = c.User ?? "unknown",
                    Timestamp = c.TsUtc,
                    TechniqueId = c.TechniqueId
                }).ToList();

                return new NodeInvestigationDto
                {
                    IpAddress = node.IpAddress,
                    DestinationScope = node.DestinationScope,
                    Hostname = node.Hostname,
                    NodeType = node.DestinationScope,
                    TotalConnections = node.TotalConnections,
                    OutgoingTargets = node.OutgoingTargets,
                    IncomingSources = node.IncomingSources,
                    LastActivity = node.LastActivity,
                    RecentConnections = connectionDetails,
                    TopProcesses = topProcesses,
                    TopUsers = topUsers,
                    TechniquesUsed = techniques
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error investigating node {IpAddress}", ipAddress);
                throw;
            }
        }

        public async Task<List<ConnectionDetailDto>> GetEdgeDetailsAsync(string sourceIp, string targetIp, DateTime? startTime = null, DateTime? endTime = null)
        {
            try
            {
                var start = startTime ?? DateTime.UtcNow.AddHours(-24);
                var end = endTime ?? DateTime.UtcNow;

                var connections = await _context.Database
                    .SqlQueryRaw<NetworkConnection>(@"
                        SELECT * FROM vNetworkConnections 
                        WHERE ((SourceIp = {0} AND DestinationIp = {1}) OR (SourceIp = {1} AND DestinationIp = {0}))
                        AND TsUtc >= {2} AND TsUtc <= {3}", sourceIp, targetIp, start, end)
                    .ToListAsync();

                connections = connections
                    .OrderByDescending(c => c.TsUtc)
                    .Take(100)
                    .ToList();

                return connections.Select(c => new ConnectionDetailDto
                {
                    RemoteIp = c.DestinationIp,
                    Port = c.DestinationPort,
                    Protocol = c.Protocol ?? "unknown",
                    Process = c.Process ?? "unknown",
                    User = c.User ?? "unknown",
                    Timestamp = c.TsUtc,
                    TechniqueId = c.TechniqueId
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting edge details between {SourceIp} and {TargetIp}", sourceIp, targetIp);
                throw;
            }
        }
        public async Task<List<string>> GetDistinctTargetIpsAsync()
        {
            var targetIps = await _context.Database
                .SqlQueryRaw<string>(@"
                    SELECT DISTINCT SourceIp 
                    FROM vNetworkConnections 
                    WHERE SourceIp IS NOT NULL
                ")
                .ToListAsync();

            return targetIps;
        }
        private async Task<List<NetworkNode>> GetNodesAsync(List<string> ipAddresses)
        {
            var nodes = new List<NetworkNode>();

            // Batch the requests to avoid parameter limits
            const int batchSize = 100;
            for (int i = 0; i < ipAddresses.Count; i += batchSize)
            {
                var batch = ipAddresses.Skip(i).Take(batchSize).ToList();
                var inClause = string.Join(",", batch.Select((ip, index) => $"{{{index}}}"));
                var parameters = batch.Cast<object>().ToArray();

                var batchNodes = await _context.Database
                    .SqlQueryRaw<NetworkNode>($"SELECT * FROM vNetworkNode WHERE IpAddress IN ({inClause})", parameters)
                    .ToListAsync();

                nodes.AddRange(batchNodes);
            }

            return nodes;
        }

        private List<NetworkGraphEdge> ApplyFilters(List<NetworkGraphEdge> edges, NetworkGraphRequestDto request)
        {
            var filtered = edges.AsEnumerable();

            if (!string.IsNullOrEmpty(request.Protocol))
            {
                filtered = filtered.Where(e => e.Protocol?.Equals(request.Protocol, StringComparison.OrdinalIgnoreCase) == true);
            }

            // Add Host filtering (source node)
            if (!string.IsNullOrEmpty(request.Host))
            {
                filtered = filtered.Where(e => e.Hostname == request.Host);
            }

            //if (!string.IsNullOrEmpty(request.ipOrigin))
            //{
            //    filtered = filtered.Where(e => e.SourceNode == request.ipOrigin || e.TargetNode == request.ipOrigin);
            //}

            switch (request.ConnectionType)
            {
                case "LAN":
                    filtered = filtered.Where(e => e.DestinationScope == "LAN");
                    break;
                case "external":
                    filtered = filtered.Where(e => e.DestinationScope == "external");
                    break;               
            }

            return filtered.ToList();
        }

        private NetworkNodeDto ConvertToNodeDto(NetworkNode node)
        {
            var size = Math.Max(20, Math.Min(80, 20 + node.TotalConnections * 2)); // Scale node size
            var color = GetNodeColor(node.DestinationScope);

            return new NetworkNodeDto
            {
                Id = node.IpAddress,
                Label = node.IpAddress,
                Type = node.DestinationScope,
                TotalConnections = node.TotalConnections,
                OutgoingTargets = node.OutgoingTargets,
                IncomingSources = node.IncomingSources,
                LastActivity = node.LastActivity,
                NetworkDescription = node.NetworkDescription,
                Size = size,
                Color = color
            };
        }

        private NetworkEdgeDto ConvertToEdgeDto(NetworkGraphEdge edge)
        {
            var weight = Math.Max(1, Math.Min(8, edge.ConnectionCount / 10 + 1)); // Scale edge weight
            var color = GetEdgeColorByConnectionCount(edge.ConnectionCount);
            var label = edge.Port.HasValue ? $"{edge.Protocol?.ToUpper()}:{edge.Port}" : edge.Protocol?.ToUpper() ?? "";

            return new NetworkEdgeDto
            {
                Id = Convert.ToHexString(edge.EdgeId),
                Source = edge.SourceNode,
                Target = edge.TargetNode,
                DestinationScope = edge.DestinationScope,
                Label = label,
                Protocol = edge.Protocol ?? "unknown",
                Port = edge.Port,
                ConnectionCount = edge.ConnectionCount,
                FirstSeen = edge.FirstSeen,
                LastSeen = edge.LastSeen,
                TechniqueId = edge.TechniqueId,
                Process = edge.Process,
                User = edge.User,
                Weight = weight,
                Color = color
            };
        }

        private async Task<List<NetworkGraphStatsDto>> CalculateStatistics(List<NetworkNodeDto> nodes, List<NetworkEdgeDto> edges)
        {
            var stats = new List<NetworkGraphStatsDto>
            {
                new NetworkGraphStatsDto { Name = "TotalNodes", Count = nodes.Count },
                new NetworkGraphStatsDto { Name = "TotalEdges", Count = edges.Count },
                //new NetworkGraphStatsDto { Name = "External", Count = edges.Count(e => e.DestinationScope == "external") }
            };

            var connectionTypes = await GetNetworkConnections();
            foreach (var type in connectionTypes)
            {
                var count = edges.Count(e => string.Equals(e.DestinationScope, type, StringComparison.OrdinalIgnoreCase));
                var name = string.IsNullOrEmpty(type) ? type : char.ToUpper(type[0]) + type.Substring(1);
                stats.Add(new NetworkGraphStatsDto { Name = name, Count = count });
            }

            return stats;
        }

        private string GetNodeColor(string nodeType) => nodeType switch
        {
            "managed" => "#10b981",   // Green
            "external" => "#ef4444",  // Red
            "internal" => "#3b82f6",  // Blue
            _ => "#6b7280"            // Gray
        };

        private string GetEdgeColorByConnectionCount(int connectionCount)
        {
            if (connectionCount > 100)
                return "#dc2626"; // Red for high activity
            if (connectionCount > 20)
                return "#f59e0b"; // Yellow for medium activity
            return "#6b7280";     // Gray for low activity
        }

        public async Task<List<string>> GetNetworkConnections()
        {
            var connectionTypes = await _context.Networks
                .Where(n => n.Description != null)
                .Select(n => n.Description)
                .Distinct()
                .ToListAsync();
            connectionTypes.Add("external");
            return connectionTypes;
        }

        public async Task<List<string>> GetSourceHostsAsync()
        {
            var hosts = await _context.Database
            .SqlQueryRaw<string>(@"
                SELECT DISTINCT ag.Hostname
                FROM Events e
                INNER JOIN Agents ag ON e.AgentId = ag.AgentId
                WHERE e.EventId = 3 AND ag.Hostname IS NOT NULL
                ORDER BY ag.Hostname")
            .ToListAsync();

            return hosts;
        }

        public async Task<List<string>> GetDistinctProtocolsAsync()
        {
            var protocols = await _context.Database
                .SqlQueryRaw<string>(@"
            SELECT DISTINCT JSON_VALUE([EventData], '$.Protocol') AS Protocol
            FROM [Events]
            WHERE JSON_VALUE([EventData], '$.Protocol') IS NOT NULL
        ")
                .ToListAsync();

            return protocols;
        }

        public async Task<List<string>> GetDistinctProcessAsync()
        {
            var processes = await _context.Database
                .SqlQueryRaw<string>(@"
            SELECT DISTINCT Process 
            FROM [Events]
            WHERE Process IS NOT NULL
        ")
                .ToListAsync();

            return processes;
        }

        public async Task<NetworkGraphResponseOptimizeDto> ExecuteOptimizedQueryAsync(NetworkGraphRequestDto request)
        {
            var edges = new List<NetworkEdgeDto>();
            var nodes = new List<NetworkNodeDto>();
            var stats = new List<NetworkGraphStatsDto>();
            if (request.ConnectionType == "all")
                request.ConnectionType = string.Empty;
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                using (var command = new SqlCommand("dbo.usp_GetNetworkGraph_v2", connection))
                {
                    command.CommandType = System.Data.CommandType.StoredProcedure;
                    command.CommandTimeout = 120; // 2 minutes

                    command.Parameters.AddWithValue("@StartTime", request.StartTime);
                    command.Parameters.AddWithValue("@EndTime", request.EndTime);
                    command.Parameters.AddWithValue("@MinConnections", request.MinConnections);
                    command.Parameters.AddWithValue("@MaxEdges", request.MaxEdges.HasValue ? (object)request.MaxEdges.Value : DBNull.Value);
                    command.Parameters.AddWithValue("@MaxNodes", request.MaxNodes.HasValue ? (object)request.MaxNodes.Value : DBNull.Value);
                    command.Parameters.AddWithValue("@Protocol", string.IsNullOrEmpty(request.Protocol) ? DBNull.Value : request.Protocol);
                    command.Parameters.AddWithValue("@Process", string.IsNullOrEmpty(request.Process) ? DBNull.Value : request.Process);
                    command.Parameters.AddWithValue("@Host", string.IsNullOrEmpty(request.Host) ? DBNull.Value : request.Host);
                    command.Parameters.AddWithValue("@ConnectionType", string.IsNullOrEmpty(request.ConnectionType) ? DBNull.Value : request.ConnectionType);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        // First result set: Edges
                        while (await reader.ReadAsync())
                        {
                            edges.Add(ReadEdgeFromReader(reader));
                        }

                        // Second result set: Nodes
                        await reader.NextResultAsync();
                        while (await reader.ReadAsync())
                        {
                            nodes.Add(ReadNodeFromReader(reader));
                        }

                        // Third result set: Statistics
                        await reader.NextResultAsync();
                        while (await reader.ReadAsync())
                        {
                            stats.Add(new NetworkGraphStatsDto
                            {
                                Name = reader.GetString(0),
                                Count = reader.GetInt32(1)
                            });
                        }
                    }
                }
            }

            //return (edges, nodes, stats);

            var response = new NetworkGraphResponseOptimizeDto
            {
                Nodes = nodes,
                Edges = edges,
                Statistics = stats
            };

            _logger.LogInformation("Retrieved {NodeCount} nodes and {EdgeCount} edges",
                nodes.Count, edges.Count);

            return response;
        }

        private NetworkEdgeDto ReadEdgeFromReader(SqlDataReader reader)
        {
            // Check if "Rules" column exists
            int rulesOrdinal = -1;
            try
            {
                rulesOrdinal = reader.GetOrdinal("Rules");
            }
            catch (IndexOutOfRangeException)
            {
                // Column does not exist
            }

            return new NetworkEdgeDto
            {
                Id = reader["Id"] as string,
                Label = reader["Id"] as string,
                DestinationScope = reader["DestinationScope"] as string,                
                Source = reader["Source"] as string ?? "",
                Target = reader["Target"] as string ?? "",
                Port = reader["Port"] as int?,
                Protocol = reader["Protocol"] as string,
                TechniqueId = reader["TechniqueId"] as string,
                Process = reader["Process"] as string,
                User = reader["User"] as string,
                ConnectionCount = reader.GetInt32(reader.GetOrdinal("ConnectionCount")),
                FirstSeen = reader.GetDateTime(reader.GetOrdinal("FirstSeen")),
                LastSeen = reader.GetDateTime(reader.GetOrdinal("LastSeen"))
            };
        }

        private NetworkNodeDto ReadNodeFromReader(SqlDataReader reader)
        {
            return new NetworkNodeDto
            {
                Id = reader.GetString(reader.GetOrdinal("Id")),
                Label = reader.GetString(reader.GetOrdinal("Id")),
                Type = reader["Type"] as string,
                TotalConnections = reader.GetInt32(reader.GetOrdinal("TotalConnections")),
                OutgoingTargets = reader.GetInt32(reader.GetOrdinal("OutgoingTargets")),
                IncomingSources = reader.GetInt32(reader.GetOrdinal("IncomingSources")),
                LastActivity = reader.GetDateTime(reader.GetOrdinal("LastActivity")),
                Size = reader.GetInt32(reader.GetOrdinal("Size")),
                Color = reader.GetString(reader.GetOrdinal("Color"))
            };
        }
    }
}   
