import { useState, useEffect } from "react";
import { endpoints } from "../services/api"; // adjust path if needed
import { Link } from "react-router-dom";

export function Entities() {
    const [entities, setEntities] = useState<any[]>([]);
    // KPI calculations
    const [total, setTotal] = useState(0);

    const [active, setActive] = useState(0);
    const [initialized, setInitialized] = useState(0);
    const [percentInit, setPercentInit] = useState(0);

    // Add filter state
    const [filters, setFilters] = useState({
        from: "",
        to: "",
        initialized: "",
        state: "",
        search: "",
    });

    // Loading and error state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any[]>([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // Calculate pagination values
    const totalPages = Math.ceil(entities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEntities = entities.slice(startIndex, endIndex);

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

    // Fetch entities with filters
    const fetchEntities = async () => {
        setLoading(true);
        setError(null);
        try {
            const params: any = {};
            if (filters.from) params.From = filters.from;
            if (filters.to) params.To = filters.to;
            if (filters.initialized)
                params.Initialized = filters.initialized === "true";
            if (filters.state) params.Stale = filters.state === "true";
            if (filters.search) params.Query = filters.search;

            const res = await endpoints.getEntities(params); 
      console.log("API response:", res);
            const mappedEntities = res.data.entities.map((e: any) => ({
                agentId: e.agentId,
                key: e.key,
                keyId: e.keyId,
                buckets: e.bucketsSeen,
                initialized: e.initialized,
                updated: new Date(e.updatedUtc).toLocaleDateString(), // Format as needed
                state: e.isStale ? "Inactive" : "Active",
            }));
      console.log("Fetched entities:", mappedEntities);
            setEntities(mappedEntities);
      setActive(res.data.summary.activeAgents || 0);
      setTotal(res.data.summary.totalAgents || 0);
      setInitialized(res.data.summary.initializedCount || 0);
      setPercentInit(res.data.summary.initializedPercentage || 0);
            
            // Reset to first page when data changes
            setCurrentPage(1);
        } catch (e) {
            setError("Failed to load entities");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEntities();
    }, []);

    // Handle Apply button
    const handleApply = () => {
        fetchEntities();
    };

    // Handle Reset button
    const handleReset = () => {
        setFilters({ from: "", to: "", initialized: "", state: "", search: "" });
        setCurrentPage(1);
        fetchEntities();
    };

    // Pagination handlers
    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const goToPrevious = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const goToNext = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    // Handle key click to open modal
    const handleKeyClick = async (agentId: string, keyId: number, key: string) => {
        setModalOpen(true);
        setModalLoading(true);
        setModalError(null);
        try {
            const params = { agentId, keyId, key };
            console.log("Fetching summary with params:", params);
            const res = await endpoints.getEntitiesSummary(params);
            setModalData(Array.isArray(res.data) ? res.data : [res.data]); // Ensure it's an array
        } catch (e) {
            setModalError("Failed to load summary");
        }
        setModalLoading(false);
    };

    // Close modal
    const closeModal = () => {
        setModalOpen(false);
        setModalData([]);
        setModalError(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-12xl mx-auto space-y-5">
                {/* KPIs */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="text-xs text-slate-500">Active Agents</div>
                        <div className="mt-1 text-3xl font-semibold text-slate-900">
                            {active}
                        </div>
                        <div className="text-xs text-slate-400">Last 24h</div>
                        <div className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                            <i className="fa-solid fa-bolt text-sm"></i>
                        </div>
                    </div>
                    <div className="relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="text-xs text-slate-500">Total Agents</div>
                        <div className="mt-1 text-3xl font-semibold text-slate-900">
                            {total}
                        </div>
                        <div className="text-xs text-slate-400">Baseline objects</div>
                        <div className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                            <i className="fa-solid fa-users text-sm"></i>
                        </div>
                    </div>
                    <div className="relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="text-xs text-slate-500">Initialized</div>
                        <div className="mt-1 text-3xl font-semibold text-slate-900">
                            {percentInit}%
                        </div>
                        <div className="text-xs text-slate-400">Percentage initialized</div>
                        <div className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                            <i className="fa-solid fa-rotate-right text-sm"></i>
                        </div>
                    </div>
                </section>

                {/* FILTER TOOLBAR */}
                <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        {/* Left controls */}
                        <div className="flex flex-wrap items-center gap-3">
                            <label
                                htmlFor="filter-entity-date-from"
                                className="text-xs font-medium text-slate-500"
                            >
                                From
                            </label>
                            <input
                                id="filter-entity-date-from"
                                type="date"
                                className="filter-search w-36"
                                value={filters.from}
                                onChange={(e) =>
                                    setFilters((f) => ({ ...f, from: e.target.value }))
                                }
                            />
                            <label
                                htmlFor="filter-entity-date-to"
                                className="text-xs font-medium text-slate-500"
                            >
                                To
                            </label>
                            <input
                                id="filter-entity-date-to"
                                type="date"
                                className="filter-search w-36"
                                value={filters.to}
                                onChange={(e) =>
                                    setFilters((f) => ({ ...f, to: e.target.value }))
                                }
                            />
                            <label className="text-xs font-medium text-slate-500">
                                Initialized
                            </label>
                            <div className="relative">
                                <select
                                    id="filter-entity-initialized"
                                    className="filter-select"
                                    value={filters.initialized}
                                    onChange={(e) =>
                                        setFilters((f) => ({ ...f, initialized: e.target.value }))
                                    }
                                >
                                    <option value="">All</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                                <span className="select-caret">
                                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                                </span>
                            </div>
                            <label className="text-xs font-medium text-slate-500 ml-1">
                                State
                            </label>
                            <div className="relative">
                                <select
                                    id="filter-entity-stale"
                                    className="filter-select"
                                    value={filters.state}
                                    onChange={(e) =>
                                        setFilters((f) => ({ ...f, state: e.target.value }))
                                    }
                                >
                                    <option value="">All</option>
                                    <option value="false">Active</option>
                                    <option value="true">Inactive</option>
                                </select>
                                <span className="select-caret">
                                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                                </span>
                            </div>
                            <label className="relative ml-1">
                                <span className="search-icon">
                                    <i className="fa-solid fa-magnifying-glass text-xs"></i>
                                </span>
                                <input
                                    id="filter-entity-search"
                                    type="search"
                                    placeholder="Search by key"
                                    className="filter-search"
                                    value={filters.search}
                                    onChange={(e) =>
                                        setFilters((f) => ({ ...f, search: e.target.value }))
                                    }
                                />
                            </label>
                        </div>
                        {/* Right actions */}
                        <div className="flex items-center gap-2 md:justify-end">
                            <button id="filters-reset" className="btn-ghost" onClick={handleReset}>Reset</button>
                            <button id="entities-update" className="btn-primary" onClick={handleApply}>Apply</button>
                        </div>
                    </div>
                    {/* Active filter chips (UI only) */}
                    <div
                        className="mt-3 hidden flex-wrap gap-2"
                        id="active-filter-chips"
                    ></div>
                </section>

                {/* TABLE */}
                <section className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-gray-600">
                            Entity List
                        </h3>
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

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 border-t border-b border-gray-100">
                                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                                    <th className="px-2 py-2">Key</th>
                                    <th className="px-2 py-2">Buckets Seen</th>
                                    <th className="px-2 py-2">Initialized</th>
                                    <th className="px-2 py-2">Updated</th>
                                    <th className="px-2 py-2">State</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentEntities.map((e, i) => (
                                    <tr key={i}>
                                        <td className="px-2 py-4">
                                            <button
                                                className="text-indigo-600 hover:underline text-left"
                                                onClick={() => handleKeyClick(e.agentId, e.keyId, e.key)}
                                            >
                                                {e.key}
                                            </button>
                                        </td>
                                        <td className="px-2 py-2">{e.buckets}</td>
                                        <td className="px-2 py-2">
                                            {e.initialized ? "Yes" : "No"}
                                        </td>
                                        <td className="px-2 py-2">{e.updated}</td>
                                        <td className="px-2 py-2"> <span className={`${e.state === "Active" ? "chip--success" : "text-red-600"}`}>{e.state.toLowerCase()}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Loading and error messages */}
                    {loading && <div className="text-center py-4">Loading...</div>}
                    {error && <div className="text-red-500 text-center py-4">{error}</div>}

                    {/* Pagination Controls */}
                    {!loading && !error && entities.length > 0 && (
                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Results info */}
                            <div className="text-xs text-gray-500">
                                Showing {startIndex + 1} to {Math.min(endIndex, entities.length)} of {entities.length} entries
                            </div>

                            {/* Pagination buttons */}
                            <div className="flex items-center gap-1">
                                {/* Previous button */}
                                <button
                                    onClick={goToPrevious}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                {/* Page numbers */}
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

                                {/* Next button */}
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
                </section>

                {/* Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white px-6 rounded-lg max-w-4xl w-full h-4/5 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 mt-2">
                                <h2 className="text-lg font-semibold">Entity Summaries</h2>
                                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">&times;</button>
                            </div>
                            {modalLoading && <div>Loading summary...</div>}
                            {modalError && <div className="text-red-500">{modalError}</div>}
                            {modalData && modalData.length > 0 && (
                                <div className="space-y-6">
                                    {modalData.map((item, index) => (
                                        <div key={index} className="border-b pb-6">
                                            {/* Entity Details */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h3 className="font-semibold text-lg mb-4">Entity Details #{index + 1}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div><strong>Agent ID:</strong> {item.agentId || 'N/A'}</div>
                                                    <div><strong>Key:</strong> <span className="font-mono text-xs break-all">{item.key || 'N/A'}</span></div>
                                                    <div><strong>Key ID:</strong> {item.keyId ?? 'N/A'}</div>
                                                    <div><strong>Mean:</strong> {item.mean !== undefined ? item.mean.toFixed(6) : 'N/A'}</div>
                                                    <div><strong>Variance:</strong> {item.var !== undefined ? item.var.toExponential(6) : 'N/A'}</div>
                                                    <div><strong>Initialized:</strong> {item.initialized ? 'Yes' : 'No'}</div>
                                                    <div><strong>EWMA Alpha:</strong> {item.ewmaAlpha !== undefined ? item.ewmaAlpha : 'N/A'}</div>
                                                    <div><strong>Buckets Seen:</strong> {item.bucketsSeen ?? 'N/A'}</div>
                                                    <div><strong>Updated (UTC):</strong> {item.updatedUtc && item.updatedUtc !== "0001-01-01T00:00:00" ? new Date(item.updatedUtc).toLocaleString() : 'N/A'}</div>
                                                </div>
                                            </div>
                                            {/* Event Details */}
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <h3 className="font-semibold text-lg mb-4">Event Details #{index + 1}</h3>
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
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}