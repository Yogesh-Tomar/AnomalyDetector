import { useEffect, useState } from "react";
import { endpoints } from "../services/api";
import Select from 'react-select';

interface DumpFilters {
  from?: string;
  to?: string;
  malware?: string; // 'All', 'Yes', 'No'
  status?: string; // 'All', 'Active', 'Inactive'
}

interface Dump {
  dumpId: string;
  agentId: string;
  fileName: string;
  sizeBytes: number;
  createdUtc: string;
  isAnalized?: boolean;
  malware?: boolean;
  status?: string;
  sha256Hex?: string;
  verifiedUtc?: string;
  rowVersion?: string;
  categorie?: string | null;
  stage1Pred?: number;
  stage1Score?: number;
  stage2Pred?: number;
  stage2Proba?: number;
  stage2Category?: string | null;
  stage2CategoryConf?: number;
  analysisUtc?: string;
  analysisModelBin?: string | null;
  analysisModelCat?: string | null;
  featureCount?: number;
  extractionMs?: number;
  catTopKJson?: string | null;
}

export function Dumps() {
  const [dumps, setDumps] = useState<Dump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDump, setSelectedDump] = useState<Dump | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsModalData, setDetailsModalData] = useState<any>(null);
  const [detailsModalLoading, setDetailsModalLoading] = useState(false);
  const [detailsModalError, setDetailsModalError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<DumpFilters>({});
  const [agentOptions, setAgentOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Transform options for react-select
  const malwareOpts = [
    { value: 'All', label: 'All' },
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ];
  const statusOpts = [
    { value: 'All', label: 'All' },
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ];

  // Fetch dumps from backend
  const fetchDumps = async (filters?: DumpFilters) => {
    console.log("Fetching dumps with filters:", filters);
    setLoading(true);
    setError("");
    try {
      const params: any = {};
      if (filters?.from) params.FromDate = new Date(filters.from).toISOString();
      if (filters?.to) params.ToDate = new Date(filters.to).toISOString();
      if (filters?.malware && filters.malware !== 'All') params.Malware = filters.malware === 'Yes';
      if (filters?.status && filters.status !== 'All') params.Status = filters.status === 'Yes';
      console.log("Fetching dumps with params:", params);
      const res = await endpoints.getDumps(params);
      // Assuming the response is an array directly, based on the sample provided
      setDumps(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError("Failed to load dumps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDumps({});
    // Removed duplicate call to endpoints.getDumps() to avoid multiple API calls
    // If filter options are needed, implement a separate endpoint or adjust API
  }, []);

  // Reset to first page when dumps change
  useEffect(() => {
    setCurrentPage(1);
  }, [dumps.length]);

  const handleApplyFilters = () => {
    fetchDumps(filters);
  };

  const handleResetFilters = () => {
    setFilters({});
    setTimeout(() => fetchDumps({}), 0);
  };

  const handleRowClick = async (dump: Dump) => {
    setDetailsModalOpen(true);
    setDetailsModalLoading(true);
    setDetailsModalError(null);
    try {      
      const res = await endpoints.getDumpById(dump.dumpId);
      setDetailsModalData(res.data);
    } catch (e) {
      setDetailsModalError("Failed to load dump details");
    }
    setDetailsModalLoading(false);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setDetailsModalData(null);
    setDetailsModalError(null);
  };

  // Close details modal on Escape key
  useEffect(() => {
    if (!detailsModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDetailsModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [detailsModalOpen]);

  // Pagination calculations
  const totalPages = Math.ceil(dumps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDumps = dumps.slice(startIndex, endIndex);

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
            {/* Malware */}
            <div>
              <label htmlFor="filter-malware" className="block text-xs font-medium text-slate-500 mb-1">Malware</label>
              <Select
                id="filter-malware"
                options={malwareOpts}
                value={filters.malware ? { value: filters.malware, label: filters.malware } : null}
                onChange={(selected) => setFilters({ ...filters, malware: selected ? selected.value : undefined })}
                isClearable
                placeholder="All"
                className="w-full"
                styles={{
                  control: (provided) => ({ ...provided, minHeight: '2.2rem', fontSize: '0.95rem' }),
                  menu: (provided) => ({ ...provided, width: '100%', maxHeight: '200px', overflowY: 'auto' })
                }}
              />
            </div>
            {/* Status */}
            <div>
              <label htmlFor="filter-status" className="block text-xs font-medium text-slate-500 mb-1">Analyzed</label>
              <Select
                id="filter-status"
                options={statusOpts}
                value={filters.status ? { value: filters.status, label: filters.status } : null}
                onChange={(selected) => setFilters({ ...filters, status: selected ? selected.value : undefined })}
                isClearable
                placeholder="All"
                className="w-full"
                styles={{
                  control: (provided) => ({ ...provided, minHeight: '2.2rem', fontSize: '0.95rem' }),
                  menu: (provided) => ({ ...provided, width: '100%', maxHeight: '200px', overflowY: 'auto' })
                }}
              />
            </div>
            {/* Actions */}
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
        </section>
      )}

      {/* Dumps table */}
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
              <th className="px-2 py-2">Dump ID</th>
              <th className="px-2 py-2">Agent ID</th>
              <th className="px-2 py-2">File Name</th>
              <th className="px-2 py-2">Size (Bytes)</th>
              <th className="px-2 py-2">Created (UTC)</th>
              <th className="px-2 py-2">Analyzed</th>
              <th className="px-2 py-2">Malware</th>
              <th className="px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentDumps.map((d, i) => (
              <tr
                key={d.dumpId || i}
                className={`cursor-pointer hover:bg-gray-50 ${
                  d.malware == false ? 'bg-green-50' : d.malware == true ? 'bg-red-50' : ''
                }`}
                onClick={() => handleRowClick(d)}
              >
                <td className="px-2 py-2 font-mono text-xs">{d.dumpId}</td>
                <td className="px-2 py-2 font-mono text-xs">{d.agentId}</td>
                <td className="px-2 py-2">{d.fileName}</td>
                <td className="px-2 py-2 text-center">{d.sizeBytes.toLocaleString()}</td>
                <td className="px-2 py-2">{new Date(d.createdUtc).toLocaleString()}</td>
                <td className="px-2 py-2 text-center">{d.isAnalized ? 'Yes' : 'No'}</td>
                <td className="px-2 py-2">{d.malware ? 'Yes' : 'No'}</td>
                <td className="px-2 py-2">{d.status || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {dumps.length === 0 && (
          <div className="text-center py-8 text-gray-500">No dumps found</div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && dumps.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results info */}
            <div className="text-xs text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, dumps.length)} of {dumps.length} entries
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

      {/* Details Modal */}
      {detailsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white px-8 py-6 rounded-lg max-w-4xl w-full h-4/5 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Dump Details</h2>
              <button onClick={closeDetailsModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {detailsModalLoading && <div>Loading details...</div>}
            {detailsModalError && <div className="text-red-500">{detailsModalError}</div>}
            {detailsModalData && (
              <div className="space-y-4 px-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Dump ID:</strong> <span className="font-mono text-xs">{detailsModalData.dumpId || 'N/A'}</span></div>
                  <div><strong>Agent ID:</strong> <span className="font-mono text-xs">{detailsModalData.agentId || 'N/A'}</span></div>
                  <div><strong>File Name:</strong> {detailsModalData.fileName || 'N/A'}</div>
                  <div><strong>Size (Bytes):</strong> {detailsModalData.sizeBytes?.toLocaleString() || 'N/A'}</div>
                  <div><strong>Created (UTC):</strong> {detailsModalData.createdUtc ? new Date(detailsModalData.createdUtc).toLocaleString() : 'N/A'}</div>
                  <div><strong>Analyzed:</strong> {detailsModalData.isAnalyzed ? 'Yes' : 'No'}</div>
                  <div><strong>Malware:</strong> {detailsModalData.malware ? 'Yes' : 'No'}</div>
                  <div><strong>Status:</strong> {detailsModalData.status || 'N/A'}</div>
                  <div><strong>SHA256 Hex:</strong> <span className="font-mono text-xs">{detailsModalData.sha256Hex || 'N/A'}</span></div>
                  <div><strong>Verified (UTC):</strong> {detailsModalData.verifiedUtc ? new Date(detailsModalData.verifiedUtc).toLocaleString() : 'N/A'}</div>
                  <div><strong>Row Version:</strong> {detailsModalData.rowVersion || 'N/A'}</div>
                  <div><strong>Category:</strong> {detailsModalData.categorie || 'N/A'}</div>
                  <div><strong>Stage 1 Prediction:</strong> {detailsModalData.stage1Pred ?? 'N/A'}</div>
                  <div><strong>Stage 1 Score:</strong> {detailsModalData.stage1Score ?? 'N/A'}</div>
                  <div><strong>Stage 2 Prediction:</strong> {detailsModalData.stage2Pred ?? 'N/A'}</div>
                  <div><strong>Stage 2 Probability:</strong> {detailsModalData.stage2Proba ?? 'N/A'}</div>
                  <div><strong>Stage 2 Category:</strong> {detailsModalData.stage2Category || 'N/A'}</div>
                  <div><strong>Stage 2 Category Confidence:</strong> {detailsModalData.stage2CategoryConf ?? 'N/A'}</div>
                  <div><strong>Analysis (UTC):</strong> {detailsModalData.analysisUtc ? new Date(detailsModalData.analysisUtc).toLocaleString() : 'N/A'}</div>
                  <div><strong>Analysis Model Bin:</strong> {detailsModalData.analysisModelBin || 'N/A'}</div>
                  <div><strong>Analysis Model Cat:</strong> {detailsModalData.analysisModelCat || 'N/A'}</div>
                  <div><strong>Feature Count:</strong> {detailsModalData.featureCount ?? 'N/A'}</div>
                  <div><strong>Extraction MS:</strong> {detailsModalData.extractionMs ?? 'N/A'}</div>
                  <div><strong>Cat Top K JSON:</strong> {detailsModalData.catTopKJson || 'N/A'}</div>
                </div>
                {/* Add more fields if the API returns additional data */}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}