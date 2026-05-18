import { useState, useEffect } from 'react'
import { endpoints } from '../services/api'
import { Modal } from '../shared/Modal'
import {
  EventsPerHourChart,
  TopProcessesChart,
  TopUsersChart,
  HeatmapChart,
  TopKeysChart
} from './DashboardCharts'

export function Dashboard() {

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string } | null>(null)
  const [kpis, setKpis] = useState([
    { name: 'Events', value: '-', icon: 'fa-chart-line', desc: 'Total number of events' },
    { name: 'Entities', value: '-', icon: 'fa-table-list', desc: 'Total number of entities' },
    { name: 'Initialized', value: '-', icon: 'fa-rotate-right', desc: 'Percentage of initialized entities' },
    { name: 'Outliers', value: '-', icon: 'fa-triangle-exclamation', desc: 'Total number of outliers' },
  ])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<{title: string, body: string}|null>(null)
  function handleKpiClick(kpi: typeof kpis[number]) {
    setModalContent({ title: kpi.name, body: kpi.desc + ' (Demo modal)' })
    setModalOpen(true)
  }

  // Add this type for your chart data state:
  type ChartDataState = {
    eventsPerHour: any | null;
    topProcesses: any | null;
    topUsers: any | null;
    heatmap: any | null;
    topKeys: any | null;
  };

 const [chartData, setChartData] = useState<ChartDataState>({
    eventsPerHour: null,
    topProcesses: null,
    topUsers: null,
    heatmap: null,
    topKeys: null
  });
  
  const [loading, setLoading] = useState({
    eventsPerHour: true,
    topProcesses: true,
    topUsers: true,
    heatmap: true,
    topKeys: true
  });
  const [error, setError] = useState<{
    eventsPerHour: string | null,
    topProcesses: string | null,
    topUsers: string | null,
    heatmap: string | null,
    topKeys: string | null
  }>({
    eventsPerHour: null,
    topProcesses: null,
    topUsers: null,
    heatmap: null,
    topKeys: null
  });

  useEffect(() => {
    endpoints.dashboardKpis().then(res => {
      const d = res.data
      setKpis([
        { name: 'Events', value: d.totalEvents, icon: 'fa-chart-line', desc: 'Total number of events' },
        { name: 'Entities', value: d.totalEntities, icon: 'fa-table-list', desc: 'Total number of entities' },
        { name: 'Initialized', value: d.initializedPercentage + '%', icon: 'fa-rotate-right', desc: 'Percentage of initialized entities' },
        { name: 'Outliers', value: d.outliers, icon: 'fa-triangle-exclamation', desc: 'Total number of outliers' },
      ])
    }).catch(() => {
      // fallback: do nothing, keep dashes
    })
  }, [])

  useEffect(() => {
    if (!dateFilter) return;

    console.log('Date Filter:', dateFilter);
    console.log('API Call Triggered with Date Filter:', dateFilter);

    setLoading({
      eventsPerHour: true,
      topProcesses: true,
      topUsers: true,
      heatmap: true,
      topKeys: true
    });

    endpoints.eventsByHour(dateFilter.from, dateFilter.to)
      .then(res => {
        setChartData(prev => ({ ...prev, eventsPerHour: toEventsPerHourChartData(res.data) }));
        setLoading(prev => ({ ...prev, eventsPerHour: false }));
      })
      .catch(() => {
        setError(prev => ({ ...prev, eventsPerHour: 'Failed to load data' }));
        setLoading(prev => ({ ...prev, eventsPerHour: false }));
      });

    endpoints.topItems('processes', dateFilter.from, dateFilter.to, 4)
      .then(res => {
        setChartData(prev => ({ ...prev, topProcesses:  toEventsPerHourChartData(res.data) }));
        setLoading(prev => ({ ...prev, topProcesses: false }));
      })
      .catch(() => {
        setError(prev => ({ ...prev, topProcesses: 'Failed to load data' }));
        setLoading(prev => ({ ...prev, topProcesses: false }));
      });

    endpoints.topItems('users', dateFilter.from, dateFilter.to, 4)
      .then(res => {
        setChartData(prev => ({ ...prev, topUsers: res.data }));
        setLoading(prev => ({ ...prev, topUsers: false }));
      })
      .catch(() => {
        setError(prev => ({ ...prev, topUsers: 'Failed to load data' }));
        setLoading(prev => ({ ...prev, topUsers: false }));
      });

    endpoints.heatmap(dateFilter.from, dateFilter.to)
      .then(res => {
        setChartData(prev => ({ ...prev, heatmap: res.data }));
        setLoading(prev => ({ ...prev, heatmap: false }));
      })
      .catch(() => {
        setError(prev => ({ ...prev, heatmap: 'Failed to load data' }));
        setLoading(prev => ({ ...prev, heatmap: false }));
      });

    endpoints.topItems('keys', dateFilter.from, dateFilter.to, 4)
      .then(res => {
        setChartData(prev => ({ ...prev, topKeys: res.data }));
        setLoading(prev => ({ ...prev, topKeys: false }));
      })
      .catch(() => {
        setError(prev => ({ ...prev, topKeys: 'Failed to load data' }));
        setLoading(prev => ({ ...prev, topKeys: false }));
      });
  }, [dateFilter]);

  // Fetch initial data for charts on mount (with no filter)
  useEffect(() => {
    if (dateFilter !== null) return;
    setLoading({
      eventsPerHour: true,
      topProcesses: true,
      topUsers: true,
      heatmap: true,
      topKeys: true
    });
    endpoints.eventsByHour()
      .then(res => {
        setChartData(prev => ({ ...prev, eventsPerHour:  toEventsPerHourChartData(res.data) }));
        setLoading(prev => ({ ...prev, eventsPerHour: false }));
      })
      .catch(() => {
        setError(prev => ({ ...prev, eventsPerHour: 'Failed to load data' }));
        setLoading(prev => ({ ...prev, eventsPerHour: false }));
      });
    endpoints.topItems('processes', undefined, undefined, 5)
      .then(res => {
        setChartData(prev => ({ ...prev, topProcesses: toTopItemsChartData(res.data) }));
        setLoading(prev => ({ ...prev, topProcesses: false }));
      })
      .catch(() => {
        setError(prev => ({ ...prev, topProcesses: 'Failed to load data' }));
        setLoading(prev => ({ ...prev, topProcesses: false }));
      });
    endpoints.topItems('users', undefined, undefined, 3)
      .then(res => {
        setChartData(prev => ({ ...prev, topUsers: toTopItemsChartData(res.data) }));
        setLoading(prev => ({ ...prev, topUsers: false }));
      })
      .catch(() => {
        setError(prev => ({ ...prev, topUsers: 'Failed to load data' }));
        setLoading(prev => ({ ...prev, topUsers: false }));
      });
    endpoints.heatmap()
      .then(res => {
        setChartData(prev => ({ ...prev, heatmap: toHeatmapData(res.data)  }));
        setLoading(prev => ({ ...prev, heatmap: false }));
      })
      .catch(() => {
        setError(prev => ({ ...prev, heatmap: 'Failed to load data' }));
        setLoading(prev => ({ ...prev, heatmap: false }));
      });
    endpoints.topItems('keys', undefined, undefined, 5)
      .then(res => {
        setChartData(prev => ({ ...prev, topKeys: toTopItemsChartData(res.data) }));
        setLoading(prev => ({ ...prev, topKeys: false }));
      })
      .catch(() => {
        setError(prev => ({ ...prev, topKeys: 'Failed to load data' }));
        setLoading(prev => ({ ...prev, topKeys: false }));
      });
  }, []);

  function toEventsPerHourChartData(arr: number[] | null) {
  if (!arr || !Array.isArray(arr) || arr.length !== 24) return null;
  return {
    labels: Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')),
    datasets: [
      {
        label: 'Events',
        data: arr,
        fill: false,
        borderColor: '#2563eb',
        backgroundColor: '#60a5fa',
        tension: 0.3,
        pointRadius: 2,
      }
    ]
  };
}

  function toTopItemsChartData(arr: Array<{ name: string, count: number }> | null, label = 'Count') {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
    return {
      labels: arr.map(item => item.name),
      datasets: [
        {
          label,
          data: arr.map(item => item.count),
          backgroundColor: '#4f46e5',
          borderColor: '#2563eb',
          borderWidth: 1,
        }
      ]
    };
  }

  function toHeatmapData(arr: number[][] | null) {
    // Expects arr to be 7 rows (days) × 24 columns (hours)
    if (
      !arr ||
      !Array.isArray(arr) ||
      arr.length !== 7 ||
      !arr.every(row => Array.isArray(row) && row.length === 24)
    ) {
      return null;
    }
    return arr;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      {/* Date range filter card */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <form
          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          onSubmit={(e) => {
            e.preventDefault()
            if (dateFrom && dateTo) {
              setDateFilter({ from: dateFrom, to: dateTo })
            }
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">From</label>
              <input
                type="date"
                className="filter-search w-36 datepicker-pill px-4 py-2"
                style={{ minWidth: 0 }}
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
              <label className="text-xs font-medium text-slate-500 ml-2">To</label>
              <input
                type="date"
                className="filter-search w-36 datepicker-pill px-4 py-2"
                style={{ minWidth: 0 }}
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 md:justify-end">
            <button type="submit" className="btn-primary" disabled={!dateFrom || !dateTo}>
              Apply
            </button>
          </div>
        </form>
      </section>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {kpis.map(kpi => (
          <div
            key={kpi.name}
            className="relative bg-white border border-gray-200 rounded-lg p-4 card cursor-pointer hover:shadow-lg transition"
            onClick={() => handleKpiClick(kpi)}
            tabIndex={0}
            role="button"
            aria-label={`Show details for ${kpi.name}`}
          >
            <i className={`fa-solid ${kpi.icon} absolute top-2 right-2 text-gray-300`} aria-hidden="true"></i>
            <div className="text-xs text-gray-500">{kpi.name}</div>
            <div className="text-3xl font-semibold text-gray-900 mt-1">{kpi.value}</div>
            <div className="text-xs text-gray-400">{kpi.desc}</div>
          </div>
        ))}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={modalContent?.title}>
        <div>{modalContent?.body}</div>
      </Modal>

      {/* Row of charts: events per hour, top processes, top users */}
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-3 mb-4">
        <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-4 card" style={{ height: '432px' }}>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Events per hour</h3>
          <EventsPerHourChart
            data={chartData.eventsPerHour}
            loading={loading.eventsPerHour}
            error={error.eventsPerHour}
            height={110}
            bottom={20}
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 card">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Top Processes</h3>
            <TopProcessesChart
              data={chartData.topProcesses}
              loading={loading.topProcesses}
              error={error.topProcesses}
            />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 card">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Top Users</h3>
            <TopUsersChart
              data={chartData.topUsers}
              loading={loading.topUsers}
              error={error.topUsers}
            />
          </div>
        </div>
      </div>

      {/* Second row: heatmap and top keys */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-auto card">
          <HeatmapChart
            data={chartData.heatmap}
            loading={loading.heatmap}
            error={error.heatmap}
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 card">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Top Keys</h3>
          <TopKeysChart
            data={chartData.topKeys}
            loading={loading.topKeys}
            error={error.topKeys}
          />
        </div>
      </div>
    </div>
  )
}
