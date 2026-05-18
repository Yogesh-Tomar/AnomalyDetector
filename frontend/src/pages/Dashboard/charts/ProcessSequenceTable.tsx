import React, { useState, useMemo } from 'react';
import { ChartContainer, BaseChartProps } from './BaseChart';

export interface SequenceData {
  agentId: string;
  hostname: string;
  processImagePath: string;
  processTimestamp: string;
  destinationIp: string;
  destinationPort: string;
  networkTimestamp: string;
  targetFilename: string;
  fileTimestamp: string;
}

interface ProcessSequenceTableProps extends BaseChartProps {
  data: SequenceData[] | null;
  onRowClick?: (sequence: SequenceData) => void;
  pageSize?: number;
}

export function ProcessSequenceTable({ 
  data, 
  loading, 
  error, 
  height = 400,
  onRowClick,
  pageSize = 20 
}: ProcessSequenceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SequenceData | null;
    direction: 'asc' | 'desc';
  }>({ key: 'processTimestamp', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedData = useMemo(() => {
    if (!data) return [];

    // Filter by search term
    let filtered = data.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Sort
    if (sortConfig.key) {
      filtered = filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

  const handleSort = (key: keyof SequenceData) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString();
  };

  const getTimeDiff = (time1: string, time2: string) => {
    const diff = new Date(time2).getTime() - new Date(time1).getTime();
    return `+${Math.round(diff / 1000)}s`;
  };

  return (
    <ChartContainer loading={loading} error={error} height={height}>
      <div className="space-y-4">
        {/* Search and Controls */}
        <div className="flex justify-between items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sequences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <i className="fa-solid fa-search absolute left-3 top-3 text-gray-400 text-xs"></i>
          </div>
          <div className="text-sm text-gray-500">
            {filteredAndSortedData.length} sequences found
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" style={{ height: height - 100 }}>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th 
                  className="px-3 py-2 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('agentId')}
                >
                  Agent
                  {sortConfig.key === 'agentId' && (
                    <i className={`fa-solid fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></i>
                  )}
                </th>                
                <th className="px-3 py-2 text-left">Network</th>
                <th 
                  className="px-3 py-2 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('processTimestamp')}
                >
                  Process
                  {sortConfig.key === 'processTimestamp' && (
                    <i className={`fa-solid fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></i>
                  )}
                </th>
                <th className="px-3 py-2 text-left">File</th>
                {/* <th className="px-3 py-2 text-left">Timeline</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((sequence, index) => (
                <tr 
                  key={index}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onRowClick?.(sequence)}
                >
                  <td className="px-3 py-3">
                    <div className="font-mono text-xs text-gray-600 truncate max-w-[50px]">
                      {sequence.hostname}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs">
                      <div className="font-medium">{sequence.destinationIp}:{sequence.destinationPort}</div>
                      <div className="text-gray-500">
                        {formatTime(sequence.networkTimestamp)}
                        <span className="ml-1 text-blue-600">
                          {getTimeDiff(sequence.processTimestamp, sequence.networkTimestamp)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs">
                      <div className="font-medium">{ sequence.processImagePath }</div>
                      <div className="text-gray-500">{ formatTime(sequence.processTimestamp) }</div>
                    </div>
                  </td>                  
                  <td className="px-3 py-3">
                    <div className="text-xs">
                      <div className="font-medium" title={sequence.targetFilename}>
                        {sequence.targetFilename}
                      </div>
                      <div className="text-gray-500">
                        {formatTime(sequence.fileTimestamp)}
                        <span className="ml-1 text-green-600">
                          {getTimeDiff(sequence.networkTimestamp, sequence.fileTimestamp)}
                        </span>
                      </div>
                    </div>
                  </td>
                  {/* <td className="px-3 py-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" title="Process"></div>
                      <div className="w-4 h-0.5 bg-gray-300"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Network"></div>
                      <div className="w-4 h-0.5 bg-gray-300"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="File"></div>
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                      currentPage === page ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </ChartContainer>
  );
}