using AnomalyDetectionDashboard.DTOs;

namespace AnomalyDetectionDashboard.Services
{
    public interface IVHunt
    {
        Task<IEnumerable<SpikeOneHourDTO>> GetSpikeOneHourDataAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<RareParentChild7dDTO>> GetRareParentChild7dAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<NewSldTodayDTO>> GetNewSldTodayAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<NewLastDayNotSeen30dDTO>> GetNewLastDayNotSeen30dAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event1ProcessCreateDTO>> GetEvent1ProcessCreateAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event2FileCreateTimeChangedDTO>> GetEvent2FileCreateTimeChangedAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event3NetworkConnectDTO>> GetEvent3NetworkConnectAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event4SysmonServiceStateDTO>> GetEvent4SysmonServiceStateAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event5ProcessTerminateDTO>> GetEvent5ProcessTerminateAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event6DriverLoadDTO>> GetEvent6DriverLoadAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event7ImageLoadDTO>> GetEvent7ImageLoadAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event8CreateRemoteThreadDTO>> GetEvent8CreateRemoteThreadAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event9RawAccessReadDTO>> GetEvent9RawAccessReadAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event10ProcessAccessDTO>> GetEvent10ProcessAccessAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event11FileCreateDTO>> GetEvent11FileCreateAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event12RegistryCreateDeleteDTO>> GetEvent12RegistryCreateDeleteAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event13RegistryValueSetDTO>> GetEvent13RegistryValueSetAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event14RegistryRenameDTO>> GetEvent14RegistryRenameAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event15FileCreateStreamHashDTO>> GetEvent15FileCreateStreamHashAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event16SysmonConfigChangeDTO>> GetEvent16SysmonConfigChangeAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event17_18PipeDTO>> GetEvent17_18PipeAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event19WmiEventFilterDTO>> GetEvent19WmiEventFilterAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event20WmiEventConsumerDTO>> GetEvent20WmiEventConsumerAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event21WmiFilterToConsumerDTO>> GetEvent21WmiFilterToConsumerAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event22DnsQueryDTO>> GetEvent22DnsQueryAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event23FileDeleteDTO>> GetEvent23FileDeleteAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Event25ProcessTamperDTO>> GetEvent25ProcessTamperAsync(DateTime? fromDate = null, DateTime? toDate = null);
    }
}
