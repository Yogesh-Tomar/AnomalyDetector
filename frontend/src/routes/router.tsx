import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { Layout } from '../shared/Layout'
// import { Dashboard } from '../pages/Dashboard'
import { Upload } from '../pages/Upload'
import { Anomalies } from '../pages/Anomalies'
import { Settings } from '../pages/Settings'
import { Login } from '../pages/Login'
import { Alerts } from '../pages/Alerts'
import { Entities } from '../pages/Entities'
import { Groups } from '../pages/Groups'
import { Configurations } from '../pages/Configurations'
import { UserManagement } from '../pages/UserManagement'
import { ProtectedRoute } from '../services/ProtectedRoute'
import { NetworkGraph } from '../pages/Networks/NetworkGraph'
import { DashboardNew } from '../pages/Dashboard/Dashboard'
import { ExcludeRulesManager } from '../pages/ExcludeRuleManager'
import { Investigations } from '../pages/VHuntDashboard'
import { NetworkManagement } from '../pages/NetworkUpsert'
import { CmdbManagement } from '../pages/CmdbUpsert'
import { Dumps } from '../pages/Dumps'

// Wrapper to redirect / to dashboard or login
function RootRedirect() {
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  return jwt ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <RootRedirect /> },
      {
        element: <ProtectedRoute roles={['admin', 'analyst']} />,
        children: [
          // { path: 'dashboard', element: <Dashboard /> },
          { path: 'dashboard', element: <DashboardNew /> },
          { path: 'vhunt', element: <Investigations /> },
          { path: 'alerts', element: <Alerts /> },
          { path: 'dumps', element: <Dumps /> },
          { path: 'entities', element: <Entities /> },
          { path: 'anomalies', element: <Anomalies /> },
          { path: 'upload', element: <Upload /> },
          { path: 'network-graph', element: <NetworkGraph /> },
        ]
      },
      {
        element: <ProtectedRoute roles={['admin']} />,
        children: [
          { path: 'settings', element: <Settings /> },
          { path: 'whitelist-rule-management', element: <ExcludeRulesManager />},
          { path: 'configurations', element: <Configurations /> },
          { path: 'groups', element: <Groups /> },
          { path: 'user-management', element: <UserManagement /> },
          { path: 'network-graph', element: <NetworkGraph /> },
          { path: 'cmdb', element: <CmdbManagement /> },
          { path: 'network', element: <NetworkManagement /> },
        ]
      }
    ]
  }
])
