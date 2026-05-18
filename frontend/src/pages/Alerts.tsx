import { useEffect, useState } from "react";
import { endpoints } from "../services/api";
import { AlertInvestigationDialog } from "./AlertInvestigationDialog";
import Select from 'react-select';  // Add this import

interface AlertFilters {
  from?: string;
  to?: string;
  user?: string;
  host?: string;
  process?: string;
  unreadOnly: boolean;
}

export function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<{
    agentId: string;
    tsUtc: string;
    metric: number;
    keyId: number;
  } | null>(null);
  const [showInvestigation, setShowInvestigation] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryModalData, setSummaryModalData] = useState<any>(null);
  const [summaryModalLoading, setSummaryModalLoading] = useState(false);
  const [summaryModalError, setSummaryModalError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<AlertFilters>({
    unreadOnly: false
  });
  const [userOptions, setUserOptions] = useState<string[]>([]);
  const [hostOptions, setHostOptions] = useState<string[]>([]);
  const [processOptions, setProcessOptions] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Transform options for react-select (each needs {value, label})
  const userOpts = userOptions.map(u => ({ value: u, label: u }));
  const hostOpts = hostOptions.map(h => ({ value: h, label: h }));
  const processOpts = processOptions.map(p => ({ value: p, label: p }));

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        From: filters.from,
        To: filters.to,
        User: filters.user,
        Host: filters.host,
        Process: filters.process,
        Unread: filters.unreadOnly
      };
      const res = await endpoints.getAlerts(params);
      setAlerts(res.data.result.alerts || []);
      
      // Extract unique values for filter dropdowns
      // const users = [...new Set(res.data.alerts?.map((a: any) => a.user).filter(Boolean))];
      // const hosts = [...new Set(res.data.alerts?.map((a: any) => a.host).filter(Boolean))];
      // const processes = [...new Set(res.data.alerts?.map((a: any) => a.process).filter(Boolean))];
      
      // setUserOptions(users);
      // setHostOptions(hosts);
      // setProcessOptions(processes);
    } catch (err: any) {
      setError("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Fetch filter options on mount
    endpoints.getFilterOptions().then(res => {
      const data = res.data.success;
      setUserOptions(data.users || []);
      setHostOptions(data.hosts || []);
      setProcessOptions(data.processes || []);
    });
  }, []);

  // Reset to first page when alerts change
  useEffect(() => {
    setCurrentPage(1);
  }, [alerts.length]);

  const handleApplyFilters = () => {
    fetchAlerts();
  };

  const handleResetFilters = () => {
    setFilters({ unreadOnly: false });
    setTimeout(() => fetchAlerts(), 0);
  };

  const handleInvestigate = (alert: any) => {
    setSelectedAlert({
      agentId: alert.agentId,
      tsUtc: alert.tsUtc,
      metric: alert?.metric,
      keyId: alert.keyId
    });
    setShowInvestigation(true);
  };

  const handleMarkRead = (agentId: string, tsUtc: string, metric: number, keyId: number) => {
    setAlerts(alerts.map(alert => 
      alert.agentId === agentId && alert.tsUtc === tsUtc && alert.metric === metric && alert.keyId === keyId
        ? { ...alert, isRead: true } 
        : alert
    ));
    fetchAlerts();
  };

  const handleMarkAllRead = async () => {
    try {
      await endpoints.markAllRead();
      setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };
  
  const handleRowClick = async (alert: any) => {
    setSummaryModalOpen(true);
    setSummaryModalLoading(true);
    setSummaryModalError(null);
    try {
      const params = {
        agentId: alert.agentId,        
        keyId: alert.keyId,
        key: alert.key,
      };
      const res = await endpoints.getAlertSummary(params); // Make sure this matches your API
      setSummaryModalData(res.data);
    } catch (e) {
      setSummaryModalError("Failed to load alert summary");
    }
    setSummaryModalLoading(false);
  };

  const closeSummaryModal = () => {
    setSummaryModalOpen(false);
    setSummaryModalData(null);
    setSummaryModalError(null);
  };

  // Close summary modal on Escape key
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

  // Pagination calculations
  const totalPages = Math.ceil(alerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlerts = alerts.slice(startIndex, endIndex);

  // Generate page numbers for pagination controls
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Pagination handlers
  const goToPage = (page: number) => setCurrentPage(page);
  const goToPrevious = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNext = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const [filtersVisible, setFiltersVisible] = useState(true);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
    <div className="min-h-screen">
      {/* Toggle Filters Icon Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setFiltersVisible(v => !v)}
          className="p-2 rounded-full bg-indigo-600 text-white text-lg hover:bg-indigo-700 transition flex items-center"
          title={filtersVisible ? "Hide Filters" : "Show Filters"}
        >
          <i className="fa-solid fa-filter"></i>
        </button>
      </div>

      {/* FILTER TOOLBAR */}
      {filtersVisible && (
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm mb-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">From</label>
              <input
                id="filter-from"
                type="datetime-local"
                value={filters.from || ''}
                onChange={(e) => setFilters({...filters, from: e.target.value})}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                placeholder="From"
              />
            </div>
            {/* To */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">To</label>
              <input
                id="filter-to"
                type="datetime-local"
                value={filters.to || ''}
                onChange={(e) => setFilters({...filters, to: e.target.value})}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                placeholder="To"
              />
            </div>
            {/* User */}
            <div>
              <label htmlFor="filter-alert-user" className="block text-xs font-medium text-slate-500 mb-1">User</label>
              <Select
                id="filter-alert-user"
                options={userOpts}
                value={filters.user ? { value: filters.user, label: filters.user } : null}
                onChange={(selected) => setFilters({ ...filters, user: selected ? selected.value : undefined })}
                isClearable
                placeholder="All"
                className="w-full"
                styles={{
                  control: (provided) => ({ ...provided, minHeight: '2.2rem', fontSize: '0.95rem' }),
                  menu: (provided) => ({ ...provided, width: '100%', maxHeight: '200px', overflowY: 'auto' })
                }}
              />
            </div>
            {/* Host */}
            <div>
              <label htmlFor="filter-alert-host" className="block text-xs font-medium text-slate-500 mb-1">Host</label>
              <Select
                id="filter-alert-host"
                options={hostOpts}
                value={filters.host ? { value: filters.host, label: filters.host } : null}
                onChange={(selected) => setFilters({ ...filters, host: selected ? selected.value : undefined })}
                isClearable
                placeholder="All"
                className="w-full"
                styles={{
                  control: (provided) => ({ ...provided, minHeight: '2.2rem', fontSize: '0.95rem' }),
                  menu: (provided) => ({ ...provided, width: '100%', maxHeight: '200px', overflowY: 'auto' })
                }}
              />
            </div>
            {/* Process */}
            <div>
              <label htmlFor="filter-alert-process" className="block text-xs font-medium text-slate-500 mb-1">Process</label>
              <Select
                id="filter-alert-process"
                options={processOpts}
                value={filters.process ? { value: filters.process, label: filters.process } : null}
                onChange={(selected) => setFilters({ ...filters, process: selected ? selected.value : undefined })}
                isClearable
                placeholder="All"
                className="w-full"
                styles={{
                  control: (provided) => ({ ...provided, minHeight: '2.2rem', fontSize: '0.95rem' }),
                  menu: (provided) => ({ ...provided, width: '100%', maxHeight: '200px', overflowY: 'auto' })
                }}
              />
            </div>
            {/* Actions + Unread only */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <input
                  id="filter-alert-unread"
                  type="checkbox"
                  checked={filters.unreadOnly}
                  onChange={(e) => setFilters({...filters, unreadOnly: e.target.checked})}
                  className="accent-indigo-600"
                />
                <label htmlFor="filter-alert-unread" className="text-xs text-slate-700 cursor-pointer select-none">
                  Unread only
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-ghost w-1/4 flex items-center justify-center gap-1"
                  title="Reset"
                >
                  <i className="fa-solid fa-rotate-right"></i>
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="btn-primary w-1/2"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest alerts table */}
      <div className="bg-white overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-gray-500">entries</span>
          </div>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Time</th>
              <th className="px-2 py-2">User</th>
              <th className="px-2 py-2">Host</th>
              <th className="px-2 py-2">Process</th>
              <th className="px-2 py-2 text-center">Z-Score</th>
              <th className="px-2 py-2 text-center">Count</th>
              <th className="px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentAlerts.map((a, i) => (
              <tr
                key={`${a.agentId}-${a.tsUtc}-${a.metric}-${a.keyId}` || i}
                className={!a.isRead ? 'bg-red-50 cursor-pointer' : 'cursor-pointer'}
                onClick={(e) => {
                  // Prevent modal if clicking the Investigate button
                  if ((e.target as HTMLElement).closest('.investigate-btn')) return;
                  handleRowClick(a);
                }}
              >
                <td className="px-2 py-2">
                  {!a.isRead ? (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Unread</span>
                  ) : (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Read</span>
                  )}
                </td>
                <td className="px-2 py-2">{a.tsUtc}</td>
                <td className="px-2 py-2">{a.user}</td>
                <td className="px-2 py-2">{a.hostname}</td>
                <td className="px-2 py-2">{a.process}</td>
                <td className="px-2 py-2 text-center font-mono">{a.zScore}</td>
                <td className="px-2 py-2 text-center">{a.count}</td>
                <td className="px-2 py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInvestigate(a);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 investigate-btn"
                    title="View details"
                  >
                    <i className="fa-solid fa-eye"></i> Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {alerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">No alerts found</div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && alerts.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results info */}
            <div className="text-xs text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, alerts.length)} of {alerts.length} entries
            </div>
            {/* Pagination buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 text-xs border rounded ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Investigation Dialog */}
      {selectedAlert && (
        <AlertInvestigationDialog
          alert={selectedAlert}
          isOpen={showInvestigation}
          onClose={() => {
            setShowInvestigation(false);
            setSelectedAlert(null);
          }}
          onMarkRead={handleMarkRead}
        />
      )}

      {/* Summary Modal */}
      {summaryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded-lg max-w-4xl w-full h-4/5 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Alert Summary</h2>
              <button onClick={closeSummaryModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {summaryModalLoading && <div>Loading summary...</div>}
            {summaryModalError && <div className="text-red-500">{summaryModalError}</div>}
            {summaryModalData && Array.isArray(summaryModalData) && summaryModalData.length > 0 ? (
              <div className="space-y-6">
                {summaryModalData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="border-b pb-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-2">
                      <h3 className="font-semibold text-base mb-2">#{idx + 1}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><strong>Agent ID:</strong> {item.agentId || 'N/A'}</div>
                        <div><strong>Key:</strong> <span className="font-mono text-xs break-all">{item.key || 'N/A'}</span></div>
                        <div><strong>Key ID:</strong> {item.keyId ?? 'N/A'}</div>
                        <div><strong>Mean:</strong> {item.mean !== undefined ? item.mean.toFixed(6) : 'N/A'}</div>
                        <div><strong>Std Dev:</strong> {item.std !== undefined ? item.std.toFixed(6) : 'N/A'}</div>
                        <div><strong>Z-Score:</strong> {item.z !== undefined ? item.z.toFixed(2) : 'N/A'}</div>
                        <div><strong>Metric:</strong> {item.metric ?? 'N/A'}</div>
                        <div><strong>Process:</strong> <span className="font-mono text-xs break-all">{item.process || 'N/A'}</span></div>
                        <div><strong>Is Read:</strong> {item.isRead ? 'Yes' : 'No'}</div>
                        <div><strong>Is Muted:</strong> {item.isMuted ? 'Yes' : 'No'}</div>
                        <div><strong>Analyst Note:</strong> {item.analystNote ?? 'N/A'}</div>
                        <div><strong>Updated (UTC):</strong> {item.updatedUtc && item.updatedUtc !== "0001-01-01T00:00:00" ? new Date(item.updatedUtc).toLocaleString() : 'N/A'}</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-base mb-2">Event Details #{idx + 1}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><strong>Event Row ID:</strong> {item.eventRowId ?? 'N/A'}</div>
                        <div><strong>Event ID:</strong> {item.eventId ?? 'N/A'}</div>
                        <div><strong>Event Timestamp:</strong> {item.eventTsUtc && item.eventTsUtc !== "0001-01-01T00:00:00" ? new Date(item.eventTsUtc).toLocaleString() : 'N/A'}</div>
                        <div><strong>Event User:</strong> <span className="font-mono text-xs break-all">{item.eventUser || 'N/A'}</span></div>
                        <div><strong>Event Process:</strong> <span className="font-mono text-xs break-all">{item.eventProcess || 'N/A'}</span></div>
                        <div><strong>Process GUID:</strong> {item.processGuid || 'N/A'}</div>
                        <div><strong>PID:</strong> {item.pid ?? 'N/A'}</div>
                        <div><strong>Event Metric:</strong> {item.eventMetric ?? 'N/A'}</div>
                        <div><strong>Metric Matches:</strong> {item.metricMatches ?? 'N/A'}</div>
                        <div><strong>Event Data:</strong>
                          <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{item.eventData ? JSON.stringify(JSON.parse(item.eventData), null, 2) : 'N/A'}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : summaryModalData && typeof summaryModalData === 'object' ? (
              // fallback for single object
              <div className="space-y-4">
                {/* ...reuse previous single-object rendering here if needed... */}
              </div>
            ) : (
              <div className="text-gray-500">No summary data available.</div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}