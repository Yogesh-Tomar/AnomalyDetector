import React, { useState, lazy, Suspense } from 'react';

// Lazy load tab components for better performance
const OverviewTab = lazy(() => import('./tabs/OverviewTab'));
const AlertAnalyticsTab = lazy(() => import('./tabs/AlertAnalyticsTab'));
const ProcessingTab = lazy(() => import('./tabs/ProcessingTab'));
const EntityMonitoringTab = lazy(() => import('./tabs/EntityMonitoringTab'));
const OperationsTab = lazy(() => import('./tabs/OperationsTab'));

// Loading skeleton for tab content
function TabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-24"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
        ))}
      </div>
    </div>
  );
}

interface DashboardTabsProps {
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  customFrom: string;
  setCustomFrom: (from: string) => void;
  customTo: string;
  setCustomTo: (to: string) => void;
}

export function DashboardTabs({ defaultTab = 'overview', onTabChange, filter, setFilter, customFrom, setCustomFrom, customTo, setCustomTo }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loadedTabs, setLoadedTabs] = useState(new Set([defaultTab]));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fa-chart-line', description: 'Key metrics and trends' },
    { id: 'alerts', label: 'Alert Analytics', icon: 'fa-bell', description: 'Alert severity and analysis' },
    { id: 'processing', label: 'Processing', icon: 'fa-gears', description: 'Data processing pipeline' },
    { id: 'entities', label: 'Entity Monitoring', icon: 'fa-layer-group', description: 'Baseline monitoring' },
    { id: 'operations', label: 'Operations', icon: 'fa-chart-bar', description: 'Operational intelligence' }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Load tab content if not already loaded
    if (!loadedTabs.has(tabId)) {
      setLoadedTabs(prev => new Set([...prev, tabId]));
    }
    
    onTabChange?.(tabId);
  };

  const renderTabContent = () => {
    if (!loadedTabs.has(activeTab)) {
      return <TabSkeleton />;
    }

    const TabComponent = {
      overview: OverviewTab,
      alerts: AlertAnalyticsTab,
      processing: ProcessingTab,
      entities: EntityMonitoringTab,
      operations: OperationsTab
    }[activeTab];

    if (!TabComponent) return <div>Tab not found</div>;

    return (
      <Suspense fallback={<TabSkeleton />}>
        <TabComponent filter={filter} setFilter={setFilter} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} />
      </Suspense>
    );
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8 px-6" aria-label="Dashboard tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`group flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                title={tab.description}
              >
                <i className={`fa-solid ${tab.icon} ${
                  activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}></i>
                <span>{tab.label}</span>
                {!loadedTabs.has(tab.id) && tab.id !== activeTab && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}