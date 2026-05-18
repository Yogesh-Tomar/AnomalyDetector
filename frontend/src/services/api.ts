import axios from 'axios'
import { get } from 'http';
import { a } from 'vitest/dist/chunks/suite.B2jumIFP.js';

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

export const api = axios.create({ baseURL })

// Attach JWT token to all requests if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const endpoints = {
  // Auth endpoints
  login: (username: string, password: string) => api.post('/api/Auth/login', { username, password }),
  logout: () => api.post('/api/Auth/logout'),
  refresh: () => api.post('/api/Auth/refresh'),

  // Example endpoints to implement later
  ping: () => api.get('/api/ping'),
  upload: (data: FormData) => api.post('/api/upload', data),
  anomalies: () => api.get('/api/anomalies'),
  dashboardKpis: (from?: string, to?: string) => api.get('/api/Dashboard/kpis', { params: { from, to } }),

  // Dashboard chart endpoints
  eventsByHour: (from?: string, to?: string) =>
    api.get('/api/dashboard/charts/events-by-hour', { params: { from, to } }),
  heatmap: (from?: string, to?: string) =>
    api.get('/api/dashboard/charts/heatmap', { params: { from, to } }),
  topItems: (type: string, from?: string, to?: string, limit: number = 20) =>
    api.get('/api/Dashboard/charts/top-items', { params: { type, from, to, limit } }),

  // Settings endpoints
  getSettings: () => api.get('/api/Settings'),
  updateSettings: (data: any) => api.put('/api/Settings', data),

  // Entity endpoints
  getEntities: (params?: {
    Initialized?: boolean;
    Stale?: boolean;
    Query?: string;
    From?: string;
    To?: string;
    Page?: number;
    PageSize?: number;
  }) => api.get('/api/Entities', { params }),
  getEntitiesSummary: (params?: { agentId: string; keyId: number; 
    key: string }) => api.get(`/api/Entities/summary`, { params }),

  // User management endpoints
  getUsers: () => api.get('/api/Users'),
  getUser: (id: string) => api.get(`/api/Users/${id}`),
  createUser: (data: { username: string; email: string; password: string; role: string }) =>
    api.post('/api/Users', data),
  updateUser: (id: string, data: { email: string; role: string; isActive: boolean }) =>
    api.put(`/api/Users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/api/Users/${id}`),
  resetPassword: (id: string, newPassword: string) =>
    api.post(`/api/Users/${id}/reset-password`, { newPassword }),
  toggleStatus: (id: string) => api.post(`/api/Users/${id}/toggle-status`),

   // Configuration endpoints
  getConfigurations: () => api.get('/api/Configurations'),
  createConfiguration: (data: any) => api.post('/api/Configurations', data),
  getConfiguration: (id: string) => api.get(`/api/Configurations/${id}`),
    updateConfiguration: (id: string, data: any) => api.put(`/api/Configurations/${id}`, data),
  deleteConfiguration: (id: string) => api.delete(`/api/Configurations/${id}`),

  // Group endpoints
  getGroups: () => api.get('/api/Groups'),
  getConfigurationsDropdown: () => api.get('/api/Configurations/dropdown'),
  getAgentDropdown: () => api.get('/api/Groups/agent-dropdown'),
  createGroup: (data: any) => api.post('/api/Groups', data),
  assignAgentsToGroup: (groupId: string, agentIds: string[]) =>
    api.post(`/api/Groups/${groupId}/agents`, { agentIds }),
  getGroup: (id: string) => api.get(`/api/Groups/${id}`),
  updateGroup: (id: string, data: any) => api.put(`/api/Groups/${id}`, data),
  deleteGroup: (id: string) => api.delete(`/api/Groups/${id}`),

  // Alert endpoints
  getAlerts: (params?: { From?: string; To?: string; User?: string; Host?: string; Process?: string; Unread?: boolean; Page?: number; PageSize?: number }) =>
    api.get('/api/Alerts', { params }),
  getFilterOptions: () => api.get('/api/Alerts/filter-options'),
  getAlertSummary: (params?: { agentId: string; keyId: number; 
    key: string }) => api.get(`/api/Alerts/summary`, { params }),

  markAlertRead: (agentId: string, tsUtc: string, metric: number, keyId: number) => 
    api.post(`/api/Alerts/${agentId}/${tsUtc}/${metric}/${keyId}/mark-read`),
  markAllRead: () => api.post('/api/Alerts/mark-all-read'),
  getAlertDetails: (params:any) => 
    api.get(`/api/Alerts/context`, { params }),
  addAnalystNote: (agentId: string, tsUtc: string, metric: number, keyId: number, note: string) => api.post(`/api/Alerts/${agentId}/${tsUtc}/${keyId}/${note}/note`),
  muteKey: (entityId: string) => api.post(`/api/Entities/${entityId}/mute`),
  excludeAlert: (data: any) => api.post('/api/Alerts/exclude', data),
  getWhiteListRules: () => api.get('/api/Alerts/white-list-rules'),  
  updateWhiteListRule: (id: number, data: any) => api.put(`/api/Alerts/update-white-list-rule/${id}`, data),
  deleteWhiteList: (id: number) => api.delete(`/api/Alerts/delete-white-list-rule/${id}`),

  // Dumps
  getDumps: (params?: { From?: string; To?: string; Malware?: string; Status?: string }) => api.get('/api/Alerts/dumps', { params }),
  getDumpById: (id: string) => api.get(`/api/Alerts/dump/${id}`),

  // CMDB endpoints
  getCmdbs: () => api.get('/api/Settings/cmdb'),
  getCmdbById: (id: string) => api.get(`/api/Settings/cmdb/${id}`),
  createCmdb: (data: { ipAddress: string; hostname: string; networkId: string }) =>
    api.post('/api/Settings/cmdb', data),
  bulkUpsertCmdb: (data: { entries: Array<{ ipAddress: string; hostname?: string; networkId: string }> }) =>
    api.post('/api/Settings/cmdb/bulk-upsert', data),
  updateCmdb: (id: string, data: { ipAddress: string; hostname: string; networkId: string }) =>
    api.put(`/api/Settings/cmdb/${id}`, data),
  deleteCmdb: (id: string) => api.delete(`/api/Settings/cmdb/${id}`),

  // Network endpoints
  getNetworks: () => api.get('/api/Settings/networks'),
  getNetworkById: (id: string) => api.get(`/api/Settings/networks/${id}`),
  createNetwork: (data: { subnetz: string; description?: string }) =>
    api.post('/api/Settings/networks', data),
  deleteNetwork: (id: string) => api.delete(`/api/Settings/networks/${id}`),
  updateNetwork: (id: string, data: { subnetz: string; description?: string }) =>
    api.put(`/api/Settings/networks/${id}`, data),

  MicrosoftAuth: (data: MicrosoftAuthResponse) =>
    api.post('/MicrosoftAuth/microsoft-login', data),
}

interface MicrosoftAuthResponse {
  idToken: string;
  accessToken: string;
  account: {
    username: string;
    email: string;
    name: string;
    role: string;
    azureId: string;
    claims: any;
  };
}