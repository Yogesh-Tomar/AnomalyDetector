// services/networkGraphService.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

// Types and Interfaces
export interface NetworkGraphFilters {
  startTime?: string;
  endTime?: string;
  minConnections?: number;
  connectionType?: string;
  protocol?: string | null;
  process?: string | null;
  maxNodes?: number;
  maxEdges?: number;
  host?: string;
  ipOrigin?: string;
}

export interface NetworkNodeDto {
  id: string;
  label: string;
  type: string; // managed, internal, external
  activityLevel: string; // low, medium, high
  totalConnections: number;
  outgoingTargets: number;
  incomingSources: number;
  lastActivity?: string;
  networkDescription: string;
  size: number; // For graph visualization
  color: string;
}

export interface NetworkEdgeDto {
  id: string;
  source: string;
  destinationScope: string; // internal, external
  target: string;
  label: string;
  protocol: string;
  port?: number;
  riskLevel: string; // info, low, medium, high
  connectionCount: number;
  firstSeen: string;
  lastSeen: string;
  techniqueId?: string;
  process?: string;
  user?: string;
  weight: number; // For graph visualization
  color: string;
}

export interface NetworkGraphStatsDto {
  name: string;
  count: number;
}

export interface NetworkGraphResponseDto {
  nodes: NetworkNodeDto[];
  edges: NetworkEdgeDto[];
  statistics: NetworkGraphStatsDto[];
}

export interface ConnectionDetailDto {
  remoteIp: string;
  remoteHostname?: string;
  port?: number;
  protocol: string;
  process: string;
  user: string;
  timestamp: string;
  techniqueId?: string;
  riskLevel: string;
}

export interface TechniqueUsageDto {
  techniqueId: string;
  count: number;
  lastSeen: string;
}

export interface NodeInvestigationDto {
  ipAddress: string;
  hostname: string;
  nodeType: string;
  activityLevel: string;
  totalConnections: number;
  outgoingTargets: number;
  incomingSources: number;
  lastActivity?: string;
  recentConnections: ConnectionDetailDto[];
  topProcesses: string[];
  topUsers: string[];
  techniquesUsed: TechniqueUsageDto[];
}

class NetworkGraphService {
  private readonly baseURL: string;
  private readonly client: AxiosInstance;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL + 'api' || '/api';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('jwt'); // changed from 'token' to 'jwt'
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get network graph data with filtering options
   * @param filters - Filter parameters
   * @returns Promise with network graph data
   */
  async getNetworkGraph(filters: NetworkGraphFilters = {}): Promise<NetworkGraphResponseDto> {
    try {
      const response = await this.client.post<NetworkGraphResponseDto>('/networkgraph/graph', {
        startTime: filters.startTime,
        endTime: filters.endTime,
        minConnections: filters.minConnections || 1,
        connectionType: filters.connectionType || 'all',
        protocol: filters.protocol || null,
        process: filters.process || null,
        maxNodes: filters.maxNodes || 1000,
        maxEdges: filters.maxEdges || 5000,
        host: filters.host || null,
        ipOrigin: filters.ipOrigin || null,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching network graph:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  /**
   * Get detailed investigation data for a specific node
   * @param ipAddress - IP address to investigate
   * @param startTime - Start time (optional)
   * @param endTime - End time (optional)
   * @returns Promise with node investigation data
   */
  async investigateNode(
    ipAddress: string, 
    startTime: string | null = null, 
    endTime: string | null = null
  ): Promise<NodeInvestigationDto> {
    try {
      const params = new URLSearchParams();
      if (startTime) params.append('startTime', startTime);
      if (endTime) params.append('endTime', endTime);

      const response = await this.client.get<NodeInvestigationDto>(
        `/networkgraph/investigate/node/${encodeURIComponent(ipAddress)}?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  /**
   * Get detailed information about connections between two nodes
   * @param sourceIp - Source IP address
   * @param targetIp - Target IP address
   * @param startTime - Start time (optional)
   * @param endTime - End time (optional)
   * @returns Promise with connection details
   */
  async investigateEdge(
    sourceIp: string, 
    targetIp: string, 
    startTime: string | null = null, 
    endTime: string | null = null
  ): Promise<ConnectionDetailDto[]> {
    try {
      const params = new URLSearchParams();
      if (startTime) params.append('startTime', startTime);
      if (endTime) params.append('endTime', endTime);

      const response = await this.client.get<ConnectionDetailDto[]>(
        `/networkgraph/investigate/edge/${encodeURIComponent(sourceIp)}/${encodeURIComponent(targetIp)}?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error investigating edge:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  /**
   * Get network graph statistics
   * @param startTime - Start time (optional)
   * @param endTime - End time (optional)
   * @returns Promise with statistics data
   */
  async getStatistics(
    startTime: string | null = null, 
    endTime: string | null = null
  ): Promise<NetworkGraphStatsDto> {
    try {
      const params = new URLSearchParams();
      if (startTime) params.append('startTime', startTime);
      if (endTime) params.append('endTime', endTime);

      const response = await this.client.get<NetworkGraphStatsDto>(
        `/networkgraph/statistics?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  /**
   * Get available connection types
   * @returns Promise with connection types array
   */
  async getConnectionTypes(): Promise<string[]> {
    try {
      const response = await this.client.get<string[]>('/networkgraph/connection-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching connection types:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  /**
   * Get available protocols
   * @returns Promise with protocols array
   */
  async getProtocols(): Promise<string[]> {
    try {
      const response = await this.client.get<string[]>('/networkgraph/protocols');
      return response.data;
    } catch (error) {
      console.error('Error fetching protocols:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  /**
   * Get available processes
   * @returns Promise with processes array
   */
  async getProcesses(): Promise<string[]> {
    try {
      const response = await this.client.get<string[]>('/networkgraph/processes');
      return response.data;
    } catch (error) {
      console.error('Error fetching processes:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  /**
   * Get available Source Host for filtering
   * @returns Promise with target IPs array
   */
  async getSourceHosts(): Promise<string[]> {
    try {
      const response = await this.client.get<string[]>('/networkgraph/source-hosts');
      return response.data;
    } catch (error) {
      console.error('Error fetching target IPs:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  /**
   * Get available target IPs for filtering
   * @returns Promise with target IPs array
   */
  async getIpOrigins(): Promise<string[]> {
    try {
      const response = await this.client.get<string[]>('/networkgraph/ip-origins');
      return response.data;
    } catch (error) {
      console.error('Error fetching IP Origins:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  /**
   * Extract error message from error object
   * @param error - Axios error object
   * @returns Error message string
   */
  private getErrorMessage(error: AxiosError): string {
    if (error.response?.data && typeof error.response.data === 'object') {
      const responseData = error.response.data as any;
      if (responseData.message) {
        return responseData.message;
      }
    }
    if (error.response?.data && typeof error.response.data === 'string') {
      return error.response.data;
    }
    return error.message || 'Network error occurred';
  }
}

export default new NetworkGraphService();