using AnomalyDetectionDashboard.Models;
using System.ComponentModel.DataAnnotations;

namespace AnomalyDetectionDashboard.Models
{
    public class NetworkConnection
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }

        public string? Hostname { get; set; }
        public DateTime TsUtc { get; set; }
        public string? User { get; set; }
        public string? Process { get; set; }
        public string? ProcessGuid { get; set; }
        public int? Pid { get; set; }
        public string? RuleName { get; set; }
        public string? Protocol { get; set; }
        public int? Initiated { get; set; }
        public string? SourceIp { get; set; }
        public int? SourcePort { get; set; }
        public int? SourceIsIpv6 { get; set; }
        public string? DestinationIp { get; set; }
        public int? DestinationPort { get; set; }
        public int? DestinationIsIpv6 { get; set; }
        public string? TechniqueId { get; set; }
        //public string? LocalIp { get; set; }
        //public string? RemoteIp { get; set; }
        //public int? RemotePort { get; set; }
    }
}

namespace AnomalyDetectionDashboard.Models
{
    public class NetworkGraphEdge
    {
        public byte[] EdgeId { get; set; } = null!;

        public string? DestinationScope { get; set; }
        public string? Hostname { get; set; }
        public string SourceNode { get; set; } = null!;
        public string TargetNode { get; set; } = null!;
        public int? Port { get; set; }
        public string? Protocol { get; set; }
        public string? TechniqueId { get; set; }
        public string? Process { get; set; }
        public string? User { get; set; }
        public int ConnectionCount { get; set; }
        public DateTime FirstSeen { get; set; }
        public DateTime LastSeen { get; set; }
        public int AgentCount { get; set; }
        public string? Rules { get; set; }
        public int DurationMinutes { get; set; }
        //public string? SourceHostname { get; set; }
        //public string? SourceNodeType { get; set; }
        //public string? TargetHostname { get; set; }
        //public string? TargetNodeType { get; set; }
    }
}


namespace AnomalyDetectionDashboard.Models
{
    public class NetworkNode
    {
        public string IpAddress { get; set; } = null!;
        public string DestinationScope { get; set; }
        public string Hostname { get; set; } = "Unknown";
        public string NetworkDescription { get; set; } = "Unknown Network";
        public int TotalConnections { get; set; }
        public int OutgoingTargets { get; set; }
        public int IncomingSources { get; set; }
        public DateTime? LastActivity { get; set; }
        //public string NodeType { get; set; } = null!;

        // Add these new properties
        //public int Size { get; set; }
        //public string Color { get; set; } = string.Empty;
    }
}

namespace AnomalyDetectionDashboard.DTOs.NetworkGraph
{
    public class NetworkGraphRequestDto
    {
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int MinConnections { get; set; } = 1;
        public string? ConnectionType { get; set; }
        public string? Protocol { get; set; }
        public string? Process { get; set; }
        public string? Host { get; set; }
        public string? ipOrigin { get; set; }
        public int? MaxNodes { get; set; }
        public int? MaxEdges { get; set; }
    }
    public class NetworkNodeOptimized
    {
        public string IpAddress { get; set; } = string.Empty;
        public string? DestinationScope { get; set; }
        public string? Hostname { get; set; }
        public string? NetworkDescription { get; set; }
        public int TotalConnections { get; set; }
        public int OutgoingTargets { get; set; }
        public int IncomingSources { get; set; }
        public DateTime LastActivity { get; set; }
        public string? NodeType { get; set; }
        public int Size { get; set; }
        public string Color { get; set; } = string.Empty;
    }
}

namespace AnomalyDetectionDashboard.DTOs.NetworkGraph
{
    public class NetworkGraphResponseDto
    {
        public List<NetworkNodeDto> Nodes { get; set; } = new();
        public List<NetworkEdgeDto> Edges { get; set; } = new();
        public List<NetworkGraphStatsDto> Statistics { get; set; } = new();
    }

    public class NetworkGraphResponseOptimizeDto
    {
        public List<NetworkNodeDto> Nodes { get; set; } = new();
        public List<NetworkEdgeDto> Edges { get; set; } = new();
        public List<NetworkGraphStatsDto> Statistics { get; set; } = new();
    }


    public class NetworkNodeDto
    {
        public string Id { get; set; } = null!;
        public string Label { get; set; } = null!;
        public string Type { get; set; } = null!; // managed, internal, external        
        public int TotalConnections { get; set; }
        public int OutgoingTargets { get; set; }
        public int IncomingSources { get; set; }
        public DateTime? LastActivity { get; set; }
        public string NetworkDescription { get; set; } = null!;
        public int Size { get; set; } // For graph visualization
        public string Color { get; set; } = null!;
    }

    public class NetworkEdgeDto
    {
        public string Id { get; set; } = null!;
        public string Source { get; set; } = null!;
        public string Target { get; set; } = null!;
        public string DestinationScope { get; set; } = null!;
        public string Label { get; set; } = null!;
        public string Protocol { get; set; } = null!;
        public int? Port { get; set; }
        public int ConnectionCount { get; set; }
        public DateTime FirstSeen { get; set; }
        public DateTime LastSeen { get; set; }
        public string? TechniqueId { get; set; }
        public string? Process { get; set; }
        public string? User { get; set; }
        public int Weight { get; set; } // For graph visualization
        public string Color { get; set; } = null!;
    }

    public class NetworkGraphStatsDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}

namespace AnomalyDetectionDashboard.DTOs.NetworkGraph
{
    public class NodeInvestigationDto
    {
        public string IpAddress { get; set; } = null!;
        public string DestinationScope { get; set; }
        public string Hostname { get; set; } = null!;
        public string NodeType { get; set; } = null!;
        public int TotalConnections { get; set; }
        public int OutgoingTargets { get; set; }
        public int IncomingSources { get; set; }
        public DateTime? LastActivity { get; set; }
        public List<ConnectionDetailDto> RecentConnections { get; set; } = new();
        public List<string> TopProcesses { get; set; } = new();
        public List<string> TopUsers { get; set; } = new();
        public List<TechniqueUsageDto> TechniquesUsed { get; set; } = new();
    }

    public class ConnectionDetailDto
    {
        public string RemoteIp { get; set; } = null!;
        public string? RemoteHostname { get; set; }
        public int? Port { get; set; }
        public string Protocol { get; set; } = null!;
        public string Process { get; set; } = null!;
        public string User { get; set; } = null!;
        public DateTime Timestamp { get; set; }
        public string? TechniqueId { get; set; }
    }

    public class TechniqueUsageDto
    {
        public string TechniqueId { get; set; } = null!;
        public int Count { get; set; }
        public DateTime LastSeen { get; set; }
    }
}