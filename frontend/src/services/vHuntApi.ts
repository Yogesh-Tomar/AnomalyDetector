import axios, { AxiosError, AxiosInstance } from "axios";

class VHuntAPI {
  private baseUrl: string;
  private client: AxiosInstance;

constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL + 'api/VHunt/' || '/api/VHunt/';
    this.client = axios.create({
      baseURL: this.baseUrl,
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
    
  async getNewS1dToday(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'new-sld-today', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getNewLastdayNotseen3d(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'new-lastday-notseen30d', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getSpike1h(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'spike-1h', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }
  async getRareParentChild1d(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'rare-parent-child-1d', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getRareParentChild7d(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'rare-parent-child-7d', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent14RegistryRename(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-14-registry-rename', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent15FileCreateStreamHash(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-15-file-create-stream-hash', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }
  async getEvent16SysmonConfigChange(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-16-sysmon-config-change', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent17_18Pipe(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-17-18-pipe', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent19WmiEventFilter(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-19-wmi-event-filter', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent20WmiEventConsumer(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-20-wmi-event-consumer', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent21WmiFilterToConsumer(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-21-wmi-filter-to-consumer', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent22DnsQuery(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-22-dns-query', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent23FileDelete(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-23-file-delete', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent25ProcessTamper(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-25-process-tamper', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent1ProcessCreate(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-1-process-create', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent2FileCreateTimeChanged(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-2-file-create-time-changed', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent3NetworkConnect(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-3-network-connect', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent4SysmonServiceState(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-4-sysmon-service-state', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent5ProcessTerminate(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-5-process-terminate', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent6DriverLoad(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-6-driver-load', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent7ImageLoad(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-7-image-load', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent8CreateRemoteThread(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-8-create-remote-thread', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent9RawAccessRead(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-9-raw-access-read', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent10ProcessAccess(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-10-process-access', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent11FileCreate(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-11-file-create', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }

  async getEvent12RegistryCreateDelete(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-12-registry-create-delete', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }
  async getEvent13RegistryValueSet(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get<any>(this.baseUrl + 'event-13-registry-value-set', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error investigating node:', error);
      throw new Error(this.getErrorMessage(error as AxiosError));
    }
  }
}

// Create singleton instance
export const vHuntApi = new VHuntAPI();