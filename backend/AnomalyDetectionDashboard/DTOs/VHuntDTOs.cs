namespace AnomalyDetectionDashboard.DTOs
{
    public class SpikeOneHourDTO
    {
        public Guid AgentId { get; set; }
        public string KeyText { get; set; } = string.Empty;
        public int Count1h { get; set; }
        public double Mean { get; set; }
        public double? Z { get; set; }
    }

    public class RareParentChild7dDTO
    {
        public Guid AgentId { get; set; }
        public string Key { get; set; } = string.Empty;
        public int Cnt7d { get; set; }
        public DateTime FirstSeen { get; set; }
        public DateTime LastSeen { get; set; }
    }

    public class NewSldTodayDTO
    {
        public Guid AgentId { get; set; }
        public string Key { get; set; } = string.Empty;
        public int C { get; set; }
    }

    public class NewLastDayNotSeen30dDTO
    {
        public Guid AgentId { get; set; }
        public string Key { get; set; } = string.Empty;
        public DateTime FirstSeenRecent { get; set; }
    }

    public class Event1ProcessCreateDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? CommandLine { get; set; }
        public string? CurrentDirectory { get; set; }
        public string? User { get; set; }
        public string? ParentProcessGuid { get; set; }
        public int? ParentProcessId { get; set; }
        public string? ParentImage { get; set; }
        public string? ParentCommandLine { get; set; }
        public string? LogonGuid { get; set; }
        public string? IntegrityLevel { get; set; }
        public string? Hashes { get; set; }
    }

    public class Event2FileCreateTimeChangedDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? TargetFilename { get; set; }
        public string? PreviousCreationUtcTime { get; set; }
        public string? CreationUtcTime { get; set; }
        public string? User { get; set; }
    }

    public class Event3NetworkConnectDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? Image { get; set; }
        public string? User { get; set; }
        public string? Protocol { get; set; }
        public bool Initiated { get; set; }
        public string? SourceIp { get; set; }
        public int? SourcePort { get; set; }
        public string? DestinationIp { get; set; }
        public int? DestinationPort { get; set; }
    }

    public class Event4SysmonServiceStateDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? State { get; set; }
        public string? Version { get; set; }
        public string? SchemaVersion { get; set; }
    }

    public class Event5ProcessTerminateDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? User { get; set; }
    }

    public class Event6DriverLoadDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ImageLoaded { get; set; }
        public string? Hashes { get; set; }
        public bool Signed { get; set; }
        public string? Signature { get; set; }
        public string? SignatureStatus { get; set; }
        public string? Image { get; set; }
        public string? User { get; set; }
    }

    public class Event7ImageLoadDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? ImageLoaded { get; set; }
        public string? Hashes { get; set; }
        public bool Signed { get; set; }
        public string? Signature { get; set; }
        public string? SignatureStatus { get; set; }
        public string? User { get; set; }
    }

    public class Event8CreateRemoteThreadDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? SourceProcessGuid { get; set; }
        public int? SourceProcessId { get; set; }
        public string? SourceImage { get; set; }
        public string? TargetProcessGuid { get; set; }
        public int? TargetProcessId { get; set; }
        public string? TargetImage { get; set; }
        public int? NewThreadId { get; set; }
        public string? StartAddress { get; set; }
        public string? StartModule { get; set; }
        public string? StartFunction { get; set; }
        public string? User { get; set; }
    }

    public class Event9RawAccessReadDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? Device { get; set; }
        public string? User { get; set; }
    }

    public class Event10ProcessAccessDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? SourceProcessGuid { get; set; }
        public int? SourceProcessId { get; set; }
        public string? SourceImage { get; set; }
        public string? TargetProcessGuid { get; set; }
        public int? TargetProcessId { get; set; }
        public string? TargetImage { get; set; }
        public string? GrantedAccess { get; set; }
        public string? CallTrace { get; set; }
        public string? User { get; set; }
    }

    public class Event11FileCreateDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? TargetFilename { get; set; }
        public string? User { get; set; }
    }

    public class Event12RegistryCreateDeleteDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? EventType { get; set; }
        public string? TargetObject { get; set; }
        public string? User { get; set; }
    }

    public class Event13RegistryValueSetDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? TargetObject { get; set; }
        public string? Details { get; set; }
        public string? User { get; set; }
    }

    public class Event14RegistryRenameDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? TargetObject { get; set; }
        public string? NewName { get; set; }
        public string? User { get; set; }
    }

    public class Event15FileCreateStreamHashDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? TargetFilename { get; set; }
        public string? CreationUtcTime { get; set; }
        public string? Hashes { get; set; }
        public string? User { get; set; }
    }

    public class Event16SysmonConfigChangeDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? Configuration { get; set; }
        public string? ConfigurationFileHash { get; set; }
        public string? ConfigurationVersion { get; set; }
    }

    public class Event17_18PipeDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public short EventId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? PipeName { get; set; }
        public string? User { get; set; }
    }

    public class Event19WmiEventFilterDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? Operation { get; set; }
        public string? EventNamespace { get; set; }
        public string? Name { get; set; }
        public string? Query { get; set; }
        public string? User { get; set; }
    }
    public class Event20WmiEventConsumerDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? Operation { get; set; }
        public string? Name { get; set; }
        public string? Type { get; set; }
        public string? Destination { get; set; }
        public string? CommandLineTemplate { get; set; }
        public string? User { get; set; }
    }

    public class Event21WmiFilterToConsumerDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? Operation { get; set; }
        public string? Filter { get; set; }
        public string? Consumer { get; set; }
        public string? User { get; set; }
    }

    public class Event22DnsQueryDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? QueryName { get; set; }
        public string? QueryStatus { get; set; }
        public string? QueryResults { get; set; }
        public string? User { get; set; }
    }

    public class Event23FileDeleteDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? TargetFilename { get; set; }
        public string? Hashes { get; set; }
        public string? User { get; set; }
    }

    public class Event25ProcessTamperDTO
    {
        public long EventRowId { get; set; }
        public Guid AgentId { get; set; }
        public DateTime TsUtc { get; set; }
        public long KeyId { get; set; }
        public string? RuleName { get; set; }
        public string? ProcessGuid { get; set; }
        public int? ProcessId { get; set; }
        public string? Image { get; set; }
        public string? TamperType { get; set; }
        public string? User { get; set; }
    }

}
