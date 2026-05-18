import React, { useEffect, useState } from 'react';
import { vHuntApi } from '../services/vHuntApi';

// --- vHunt views (top section) ---
const vHuntViews = [
  { key: 'newS1dToday', label: 'New S1d Today', fetcher: (from: string, to: string) => vHuntApi.getNewS1dToday(from, to) },
  { key: 'newLastdayNotseen3d', label: 'New Lastday Notseen3d', fetcher: (from: string, to: string) => vHuntApi.getNewLastdayNotseen3d(from, to) },
  { key: 'spike1h', label: 'Spike 1h', fetcher: (from: string, to: string) => vHuntApi.getSpike1h(from, to) },
  { key: 'rareParentChild7d', label: 'Rare Parent Child 7d', fetcher: (from: string, to: string) => vHuntApi.getRareParentChild7d(from, to) },
];

// --- Other views (below vHunt views) ---
const otherViews = [
  { key: 'event1', label: 'Process Create', fetcher: (from: string, to: string) => vHuntApi.getEvent1ProcessCreate(from, to) },
  { key: 'event2', label: 'File Create Time Changed', fetcher: (from: string, to: string) => vHuntApi.getEvent2FileCreateTimeChanged(from, to) },
  { key: 'event3', label: 'Network Connect', fetcher: (from: string, to: string) => vHuntApi.getEvent3NetworkConnect(from, to) },
  { key: 'event4', label: 'Sysmon Service State', fetcher: (from: string, to: string) => vHuntApi.getEvent4SysmonServiceState(from, to) },
  { key: 'event5', label: 'Process Terminate', fetcher: (from: string, to: string) => vHuntApi.getEvent5ProcessTerminate(from, to) },
  { key: 'event6', label: 'Driver Load', fetcher: (from: string, to: string) => vHuntApi.getEvent6DriverLoad(from, to) },
  { key: 'event7', label: 'Image Load', fetcher: (from: string, to: string) => vHuntApi.getEvent7ImageLoad(from, to) },
  { key: 'event8', label: 'Create Remote Thread', fetcher: (from: string, to: string) => vHuntApi.getEvent8CreateRemoteThread(from, to) },
  { key: 'event9', label: 'Raw Access Read', fetcher: (from: string, to: string) => vHuntApi.getEvent9RawAccessRead(from, to) },
  { key: 'event10', label: 'Process Access', fetcher: (from: string, to: string) => vHuntApi.getEvent10ProcessAccess(from, to) },
  { key: 'event11', label: 'File Create', fetcher: (from: string, to: string) => vHuntApi.getEvent11FileCreate(from, to) },
  { key: 'event12', label: 'Registry Create/Delete', fetcher: (from: string, to: string) => vHuntApi.getEvent12RegistryCreateDelete(from, to) },
  { key: 'event13', label: 'Registry Value Set', fetcher: (from: string, to: string) => vHuntApi.getEvent13RegistryValueSet(from, to) },
  { key: 'event14', label: 'Registry Rename', fetcher: (from: string, to: string) => vHuntApi.getEvent14RegistryRename(from, to) },
  { key: 'event15', label: 'File Create Stream Hash', fetcher: (from: string, to: string) => vHuntApi.getEvent15FileCreateStreamHash(from, to) },
  { key: 'event16', label: 'Sysmon Config Change', fetcher: (from: string, to: string) => vHuntApi.getEvent16SysmonConfigChange(from, to) },
  { key: 'event17_18', label: 'Pipe', fetcher: (from: string, to: string) => vHuntApi.getEvent17_18Pipe(from, to) },
  { key: 'event19', label: 'WMI Event Filter', fetcher: (from: string, to: string) => vHuntApi.getEvent19WmiEventFilter(from, to) },
  { key: 'event20', label: 'WMI Event Consumer', fetcher: (from: string, to: string) => vHuntApi.getEvent20WmiEventConsumer(from, to) },
  { key: 'event21', label: 'WMI Filter To Consumer', fetcher: (from: string, to: string) => vHuntApi.getEvent21WmiFilterToConsumer(from, to) },
  { key: 'event22', label: 'DNS Query', fetcher: (from: string, to: string) => vHuntApi.getEvent22DnsQuery(from, to) },
  { key: 'event23', label: 'File Delete', fetcher: (from: string, to: string) => vHuntApi.getEvent23FileDelete(from, to) },
  { key: 'event25', label: 'Process Tamper', fetcher: (from: string, to: string) => vHuntApi.getEvent25ProcessTamper(from, to) },
];

const getInitialDateTimes = () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const toLocal = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return {
    fromDateTime: toLocal(yesterday),
    toDateTime: toLocal(now),
    hostname: '',
    user: '',
    agentId: '',
  };
};

const defaultFilters = getInitialDateTimes();

// Pagination settings
const PAGE_SIZE = 5;

export const Investigations: React.FC = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<Record<string, string>>({});
  const [twoRows, setTwoRows] = useState(true);
  const [fullscreenView, setFullscreenView] = useState<string | null>(null);
  const [page, setPage] = useState<Record<string, number>>({}); // page per view
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryModalData, setSummaryModalData] = useState<any>(null);
  const [summaryModalLoading, setSummaryModalLoading] = useState(false);
  const [summaryModalError, setSummaryModalError] = useState<string | null>(null);

  // General filter params
  const getFilterParams = () => ({
    fromDateTime: filters.fromDateTime + 'T00:00:00',
    toDateTime: filters.toDateTime + 'T23:59:59',
    hostname: filters.hostname,
    user: filters.user,
    agentId: filters.agentId,
  });

  // Fetch all views
  const fetchAllViews = async () => {
    if (loading) return; // Prevent concurrent fetches
    setLoading(true);
    setError(null);
    try {
      const params = getFilterParams();
      const from = params.fromDateTime;
      const to = params.toDateTime;
      const results: Record<string, any[]> = {};
      for (const view of [...vHuntViews, ...otherViews]) {
        results[view.key] = await view.fetcher(from, to);
      }
      setData(results);
    } catch (err: any) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filters.fromDateTime || !filters.toDateTime) {
      setError('From and To are required');
      return;
    }
    fetchAllViews();
  };

  // Per-view search filter
  const filterTableData = (viewKey: string, rows: any[]) => {
    const q = (search[viewKey] || '').toLowerCase();
    if (!q) return rows;
    return rows.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(q)
      )
    );
  };

  // Pagination helpers
  const getPageData = (viewKey: string, rows: any[]) => {
    const currentPage = page[viewKey] || 1;
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  };

  const getTotalPages = (viewKey: string, rows: any[]) => {
    return Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  };

  // Row click handler
  const handleRowClick = async (row: any) => {
    setSummaryModalOpen(true);
    setSummaryModalLoading(true);
    setSummaryModalError(null);
    try {
      // Assuming you have an API endpoint for getting details
      const params = {
        agentId: row.agentId,
        keyId: row.keyId,
        key: row.key,
      };
      setSummaryModalData(row); // For now, just show the row data
      // You can add API call here similar to Alerts component if needed
      // const res = await endpoints.getEventDetails(params);
      // setSummaryModalData(res.data);
    } catch (e) {
      setSummaryModalError("Failed to load details");
    }
    setSummaryModalLoading(false);
  };

  const closeSummaryModal = () => {
    setSummaryModalOpen(false);
    setSummaryModalData(null);
    setSummaryModalError(null);
  };

  // ESC key handler
  useEffect(() => {
    if (!summaryModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSummaryModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [summaryModalOpen]);

  // Add useEffect to fetch data on component mount
  useEffect(() => {
    fetchAllViews();
  }, []); // Empty dependency array means this runs once on mount

  // Layout logic
  const renderViews = (views: typeof vHuntViews | typeof otherViews) => (
    <div className={twoRows ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-6'}>
      {views.map(view => {
        const isFullscreen = fullscreenView === view.key;
        const filteredRows = data[view.key] ? filterTableData(view.key, data[view.key]) : [];
        const pagedRows = getPageData(view.key, filteredRows);
        const totalPages = getTotalPages(view.key, filteredRows);
        const currentPage = page[view.key] || 1;

        return (
          <section
            key={view.key}
            className={
              (isFullscreen
                ? 'fixed inset-0 z-50 bg-white overflow-auto p-8 flex flex-col'
                : 'bg-white rounded-2xl shadow-lg border border-gray-200 p-0 overflow-hidden'
              )
            }
            style={isFullscreen ? { maxHeight: '100vh' } : undefined}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <h3 className="text-lg font-semibold text-blue-900">{view.label}</h3>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Search in view"
                  value={search[view.key] || ''}
                  onChange={e => {
                    setSearch(s => ({ ...s, [view.key]: e.target.value }));
                    setPage(p => ({ ...p, [view.key]: 1 })); // Reset to first page on search
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-64"
                />
                <button
                  type="button"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  onClick={() => setFullscreenView(isFullscreen ? null : view.key)}
                  className="px-2 py-1 rounded hover:bg-gray-100 border border-gray-300 text-gray-700 flex items-center"
                  style={{ fontSize: '1.2em' }}
                >
                  <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {pagedRows[0]
                      ? Object.keys(pagedRows[0]).map(col => (
                          <th key={col} className="py-3 px-4 text-left font-medium text-gray-700 border-b">{col}</th>
                        ))
                      : <th className="py-3 px-4 text-left font-medium text-gray-700 border-b">No Data</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length > 0 ? (
                    pagedRows.map((row, i) => (
                      <tr 
                        key={i} 
                        className="border-t last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(row)}
                      >
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="py-2 px-4">{String(val)}</td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={pagedRows[0] ? Object.keys(pagedRows[0]).length : 1}
                          className="py-6 px-4 text-center text-gray-400">
                        No data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {filteredRows.length > PAGE_SIZE && (
              <div className="flex justify-center items-center gap-2 py-4">
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage(p => ({ ...p, [view.key]: currentPage - 1 }))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <span className="px-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage(p => ({ ...p, [view.key]: currentPage + 1 }))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
            {isFullscreen && (
              <button
                className="mt-6 self-end px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                onClick={() => setFullscreenView(null)}
              >
                Close Fullscreen
              </button>
            )}
          </section>
        );
      })}
    </div>
  );

  return (
    <div>
      {/* Header & Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-blue-900">Investigations</h2>
        <button
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => setTwoRows(r => !r)}
        >
          {twoRows ? 'Single Row' : 'Two Rows'}
        </button>
      </div>

      {/* General Filter Bar */}
      <form className="bg-white border-b border-gray-200 p-4 mb-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={filters.fromDateTime}
              onChange={e => setFilters(f => ({ ...f, fromDateTime: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={filters.toDateTime}
              onChange={e => setFilters(f => ({ ...f, toDateTime: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">Hostname</label>
            <input
              type="text"
              value={filters.hostname}
              onChange={e => setFilters(f => ({ ...f, hostname: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm mb-0"
              placeholder="Enter hostname"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">User</label>
            <input
              type="text"
              value={filters.user}
              onChange={e => setFilters(f => ({ ...f, user: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              placeholder="Enter user"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">AgentId</label>
            <input
              type="text"
              value={filters.agentId}
              onChange={e => setFilters(f => ({ ...f, agentId: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              placeholder="Enter AgentId"
            />
          </div>
          <div className="flex gap-2 mt-4 md:mt-3 justify-end col-span-1 md:col-span-5">
            <button
              type="button"
              onClick={() => setFilters(defaultFilters)}
              disabled={loading}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      </form>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="text-gray-700">Loading data...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* vHunt Views */}
      <div className="mb-8">{renderViews(vHuntViews)}</div>
      
      {/* Other Views */}
      <div>{renderViews(otherViews)}</div>

      {/* Add Summary Modal */}
      {summaryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded-lg max-w-4xl w-full h-4/5 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Event Details</h2>
              <button 
                onClick={closeSummaryModal} 
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            {summaryModalLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            )}

            {summaryModalError && (
              <div className="text-red-500 p-4 text-center">{summaryModalError}</div>
            )}

            {summaryModalData && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-base mb-4">Event Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {Object.entries(summaryModalData).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="font-medium text-gray-600">{key}</span>
                        <span className="font-mono text-xs break-all">
                          {typeof value === 'object' 
                            ? JSON.stringify(value, null, 2)
                            : String(value)
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}