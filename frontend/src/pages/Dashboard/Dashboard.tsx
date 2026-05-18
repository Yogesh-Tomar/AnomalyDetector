import { DashboardTabs } from './DashboardTabs';
import { useState } from 'react';

export function DashboardNew() {
  const [filter, setFilter] = useState('last30days'); // Initial filter set to 'last30days'
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const handleTabChange = (tabId: string) => {
    // Track tab changes for analytics
    console.log(`Dashboard tab changed to: ${tabId}`);
   
    // Optional: Update URL or store in localStorage
    window.history.replaceState(null, '', `#${tabId}`);
    localStorage.setItem('dashboard-active-tab', tabId);
  };

  // Get initial tab from URL hash or localStorage
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['overview', 'alerts', 'processing', 'entities', 'operations'];
    
    if (validTabs.includes(hash)) {
      return hash;
    }
    
    return localStorage.getItem('dashboard-active-tab') || 'overview';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full">
        <DashboardTabs 
          defaultTab={getInitialTab()}
          onTabChange={handleTabChange}
          filter={filter}
          setFilter={setFilter}
          customFrom={customFrom}
          setCustomFrom={setCustomFrom}
          customTo={customTo}
          setCustomTo={setCustomTo}
        />
      </div>
    </div>
  );
}