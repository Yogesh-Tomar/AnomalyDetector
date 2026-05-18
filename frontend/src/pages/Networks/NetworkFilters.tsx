import React, { useState, useEffect, useRef } from 'react';
import networkGraphService, { NetworkGraphFilters } from '../../services/networkGraphService';

interface NetworkFiltersProps {
  filters: NetworkGraphFilters;
  onChange: (filters: NetworkGraphFilters) => void;
  onApply: () => void;
  onReset: () => void;
  loading: boolean;
  onRefresh?: () => void;
  connectionTypes?: string[];
}

// Custom Process Dropdown Component
const ProcessDropdown: React.FC<{
  processes: string[];
  selectedProcess: string;
  onSelect: (value: string) => void;
}> = ({ processes, selectedProcess, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const displayValue = selectedProcess || 'All Processes';
  
  // Filter processes based on search term
  const filteredProcesses = processes.filter(process =>
    process.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={dropdownRef} style={{ position: 'relative', maxWidth: '300px' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        title={selectedProcess || 'All Processes'}
        style={{
          width: '100%',
          padding: '0.375rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          backgroundColor: '#fff'
        }}
      >
        {displayValue}
      </div>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '300px',
            maxHeight: '250px',
            backgroundColor: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            marginTop: '0.25rem',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Search Input */}
          <div style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search processes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '0.375rem 0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>
          
          {/* Options List */}
          <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
            <div
              onClick={() => {
                onSelect('');
                setIsOpen(false);
                setSearchTerm('');
              }}
              title="All Processes"
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                backgroundColor: !selectedProcess ? '#e0e7ff' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedProcess) e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                if (selectedProcess) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              All Processes
            </div>
            {filteredProcesses.length > 0 ? (
              filteredProcesses.map((process) => (
                <div
                  key={process}
                  onClick={() => {
                    onSelect(process);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  title={process}
                  style={{
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    backgroundColor: selectedProcess === process ? '#e0e7ff' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProcess !== process) e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProcess !== process) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {process}
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '0.75rem',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}
              >
                No processes found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const NetworkFilters: React.FC<NetworkFiltersProps> = ({ 
  filters, 
  onChange, 
  onApply, 
  onReset, 
  loading,
  onRefresh,
  connectionTypes = []
}) => {
  // const [connectionTypes, setConnectionTypes] = useState<string[]>([]);
  const [processes, setProcesses] = useState<string[]>([]);
  const [protocols, setProtocols] = useState<string[]>([]);
  const [sourceHosts, setSourceHosts] = useState<string[]>([]);
  const [ipOrigins, setIpOrigins] = useState<string[]>([]);

  useEffect(() => {
    loadFilterOptions();
    // Set default startTime to 1st of current month if not set
    if (!filters.startTime) {
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const isoString = firstOfMonth.toISOString().slice(0, 10); // Format for date (YYYY-MM-DD)
      onChange({ ...filters, startTime: isoString });
    }
  }, []);

  const loadFilterOptions = async (): Promise<void> => {
    try {
      const [ processes, protocols, hosts, origins] = await Promise.all([
        // networkGraphService.getConnectionTypes(),
        networkGraphService.getProcesses(),
        networkGraphService.getProtocols(),
        networkGraphService.getSourceHosts(),
        networkGraphService.getIpOrigins(),
      ]);
      // setConnectionTypes(types);
      setProcesses(processes);
      setProtocols(protocols);      
      setSourceHosts(hosts);
      setIpOrigins(origins);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleInputChange = (field: keyof NetworkGraphFilters, value: string | number): void => {
    let updatedFilters = { ...filters, [field]: value };

    // Enforce startTime <= endTime
    if (field === 'startTime' && filters.endTime && value > filters.endTime) {
      updatedFilters.endTime = value as string;
    } else if (field === 'endTime' && filters.startTime && value < filters.startTime) {
      updatedFilters.startTime = value as string;
    }

    onChange(updatedFilters);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-end">
        {/* Time Range */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
          <input
            type="date"
            value={filters.startTime || ''}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
          <input
            type="date"
            value={filters.endTime || ''}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Connection Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Connection Type</label>
          <select
            value={filters.connectionType || 'all'}
            onChange={(e) => handleInputChange('connectionType', e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            {connectionTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Protocol */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Protocol</label>
          <select
            value={filters.protocol || ''}
            onChange={(e) => handleInputChange('protocol', e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Protocols</option>
            {protocols.map((protocol) => (
              <option key={protocol} value={protocol}>
                {protocol.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

         {/* Process */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Process</label>
          <ProcessDropdown
            processes={processes}
            selectedProcess={filters.process || ''}
            onSelect={(value) => handleInputChange('process', value)}
          />
        </div>

        {/* Min Connections */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Min Connections</label>
          <input
            type="number"
            min="1"
            value={filters.minConnections || 1}
            onChange={(e) => handleInputChange('minConnections', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Host */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Host</label>
          <select
            value={filters.host || ''}
            onChange={(e) => handleInputChange('host', e.target.value)}
            disabled={loading}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">All Hosts</option>
            {sourceHosts.map((host) => (
              <option key={host} value={host}>
                {host}
              </option>
            ))}
          </select>
        </div>

        {/* IP Origin */}
        {/* <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">IP Origin</label>
          <select
            value={filters.ipOrigin || ''}
            onChange={(e) => handleInputChange('ipOrigin', e.target.value)}
            disabled={loading}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">All IP Origins</option>
            {ipOrigins.map((ip) => (
              <option key={ip} value={ip}>
                {ip}
              </option>
            ))}
          </select>
        </div> */}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onReset}
            disabled={loading}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            title="Reset"
          >
            <i className="fas fa-undo"></i>
          </button>
          <button
            onClick={onApply}
            disabled={loading}
            className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
            title="Apply"
          >
            <i className="fas fa-check"></i>
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
              title="Refresh"
            >
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};