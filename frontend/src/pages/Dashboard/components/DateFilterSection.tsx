import React, { useState, useEffect } from 'react';

interface DateRange {
  from: string;
  to: string;
}

interface DateFilterSectionProps {
  filter: string;
  setFilter: (filter: string) => void;
  onDateChange: (range: DateRange | null) => void;
  customFrom: string;
  setCustomFrom: (from: string) => void;
  customTo: string;
  setCustomTo: (to: string) => void;
  showQuickFilters?: boolean;
}

export function DateFilterSection({ 
  filter,
  setFilter,
  onDateChange,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  showQuickFilters = true 
}: DateFilterSectionProps) {
  // Map filter to selectedRange
  const getSelectedRange = (f: string) => {
    switch (f) {
      case 'last24hours': return '24h';
      case 'last7days': return '7d';
      case 'last30days': return '30d';
      case 'custom': return 'custom';
      default: return '30d';
    }
  };

  const selectedRange = getSelectedRange(filter);

  useEffect(() => {
    if (filter !== 'custom') {
      const now = new Date();
      let from: Date;
      switch (filter) {
        case 'last24hours':
          from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'last7days':
          from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30days':
          from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      onDateChange({
        from: from.toISOString(),
        to: now.toISOString()
      });
    } else if (filter === 'custom' && customFrom && customTo) {
      onDateChange({ from: customFrom, to: customTo });
    }
  }, [filter, onDateChange, customFrom, customTo]);

  const quickFilters = [
    { id: '24h', label: 'Last 24 Hours', value: 'last24hours' },
    { id: '7d', label: 'Last 7 Days', value: 'last7days' },
    { id: '30d', label: 'Last 30 Days', value: 'last30days' },
    { id: 'custom', label: 'Custom Range', value: 'custom' }
  ];

  const handleQuickFilter = (filterValue: string) => {
    setFilter(filterValue);
    if (filterValue !== 'custom') {
      const now = new Date();
      let from: Date;
      switch (filterValue) {
        case 'last24hours':
          from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'last7days':
          from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30days':
          from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      onDateChange({
        from: from.toISOString(),
        to: now.toISOString()
      });
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFrom && customTo) {
      onDateChange({ from: customFrom, to: customTo });
    }
  };

  const resetFilters = () => {
    setFilter('last30days');
    setCustomFrom('');
    setCustomTo('');
    const now = new Date();
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    onDateChange({
      from: from.toISOString(),
      to: now.toISOString()
    });
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Quick Filters */}
        {showQuickFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Time Range:</span>
            {quickFilters.map(f => (
              <button
                key={f.id}
                onClick={() => handleQuickFilter(f.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedRange === f.id
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={resetFilters}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 ml-2"
            >
              Reset
            </button>
          </div>
        )}

        {/* Custom Date Range */}
        {selectedRange === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">From</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="filter-search w-36 datepicker-pill px-4 py-2"
                required
              />
              <label className="text-xs font-medium text-slate-500 ml-2">To</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="filter-search w-36 datepicker-pill px-4 py-2"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={!customFrom || !customTo}
            >
              Apply
            </button>
          </form>
        )}
      </div>
    </section>
  );
}