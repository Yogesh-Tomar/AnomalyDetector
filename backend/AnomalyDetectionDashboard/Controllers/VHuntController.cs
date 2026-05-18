using AnomalyDetectionDashboard.DTOs;
using AnomalyDetectionDashboard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnomalyDetection.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AnalystOrAdmin")]
    public class VHuntController : ControllerBase
    {
        private readonly IVHunt _vHunt;

        public VHuntController(IVHunt vHunt)
        {
            _vHunt = vHunt;
        }

        [HttpGet("spike-1h")]
        public async Task<ActionResult<IEnumerable<SpikeOneHourDTO>>> GetSpikeOneHourData([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetSpikeOneHourDataAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("rare-parent-child-7d")]
        public async Task<ActionResult<IEnumerable<RareParentChild7dDTO>>> GetRareParentChild7d([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetRareParentChild7dAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("new-sld-today")]
        public async Task<ActionResult<IEnumerable<NewSldTodayDTO>>> GetNewSldToday([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetNewSldTodayAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("new-lastday-notseen30d")]
        public async Task<ActionResult<IEnumerable<NewLastDayNotSeen30dDTO>>> GetNewLastDayNotSeen30d([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetNewLastDayNotSeen30dAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-1-process-create")]
        public async Task<ActionResult<IEnumerable<Event1ProcessCreateDTO>>> GetEvent1ProcessCreate([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent1ProcessCreateAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-2-file-create-time-changed")]
        public async Task<ActionResult<IEnumerable<Event2FileCreateTimeChangedDTO>>> GetEvent2FileCreateTimeChanged([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent2FileCreateTimeChangedAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-3-network-connect")]
        public async Task<ActionResult<IEnumerable<Event3NetworkConnectDTO>>> GetEvent3NetworkConnect([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent3NetworkConnectAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-4-sysmon-service-state")]
        public async Task<ActionResult<IEnumerable<Event4SysmonServiceStateDTO>>> GetEvent4SysmonServiceState([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent4SysmonServiceStateAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-5-process-terminate")]
        public async Task<ActionResult<IEnumerable<Event5ProcessTerminateDTO>>> GetEvent5ProcessTerminate([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent5ProcessTerminateAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-6-driver-load")]
        public async Task<ActionResult<IEnumerable<Event6DriverLoadDTO>>> GetEvent6DriverLoad([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent6DriverLoadAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-7-image-load")]
        public async Task<ActionResult<IEnumerable<Event7ImageLoadDTO>>> GetEvent7ImageLoad([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent7ImageLoadAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-8-create-remote-thread")]
        public async Task<ActionResult<IEnumerable<Event8CreateRemoteThreadDTO>>> GetEvent8CreateRemoteThread([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent8CreateRemoteThreadAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-9-raw-access-read")]
        public async Task<ActionResult<IEnumerable<Event9RawAccessReadDTO>>> GetEvent9RawAccessRead([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent9RawAccessReadAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-10-process-access")]
        public async Task<ActionResult<IEnumerable<Event10ProcessAccessDTO>>> GetEvent10ProcessAccess([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent10ProcessAccessAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-11-file-create")]
        public async Task<ActionResult<IEnumerable<Event11FileCreateDTO>>> GetEvent11FileCreate([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent11FileCreateAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-12-registry-create-delete")]
        public async Task<ActionResult<IEnumerable<Event12RegistryCreateDeleteDTO>>> GetEvent12RegistryCreateDelete([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent12RegistryCreateDeleteAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-13-registry-value-set")]
        public async Task<ActionResult<IEnumerable<Event13RegistryValueSetDTO>>> GetEvent13RegistryValueSet([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent13RegistryValueSetAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-14-registry-rename")]
        public async Task<ActionResult<IEnumerable<Event14RegistryRenameDTO>>> GetEvent14RegistryRename([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent14RegistryRenameAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-15-file-create-stream-hash")]
        public async Task<ActionResult<IEnumerable<Event15FileCreateStreamHashDTO>>> GetEvent15FileCreateStreamHash([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent15FileCreateStreamHashAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-16-sysmon-config-change")]
        public async Task<ActionResult<IEnumerable<Event16SysmonConfigChangeDTO>>> GetEvent16SysmonConfigChange([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent16SysmonConfigChangeAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-17-18-pipe")]
        public async Task<ActionResult<IEnumerable<Event17_18PipeDTO>>> GetEvent17_18Pipe([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent17_18PipeAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-19-wmi-event-filter")]
        public async Task<ActionResult<IEnumerable<Event19WmiEventFilterDTO>>> GetEvent19WmiEventFilter([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent19WmiEventFilterAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-20-wmi-event-consumer")]
        public async Task<ActionResult<IEnumerable<Event20WmiEventConsumerDTO>>> GetEvent20WmiEventConsumer([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent20WmiEventConsumerAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-21-wmi-filter-to-consumer")]
        public async Task<ActionResult<IEnumerable<Event21WmiFilterToConsumerDTO>>> GetEvent21WmiFilterToConsumer([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent21WmiFilterToConsumerAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-22-dns-query")]
        public async Task<ActionResult<IEnumerable<Event22DnsQueryDTO>>> GetEvent22DnsQuery([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent22DnsQueryAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-23-file-delete")]
        public async Task<ActionResult<IEnumerable<Event23FileDeleteDTO>>> GetEvent23FileDelete([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent23FileDeleteAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("event-25-process-tamper")]
        public async Task<ActionResult<IEnumerable<Event25ProcessTamperDTO>>> GetEvent25ProcessTamper([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _vHunt.GetEvent25ProcessTamperAsync(fromDate, toDate);
            return Ok(result);
        }
    }
}