import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Adjust this URL to match the backend running environment via EXPO_PUBLIC_API_URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL) {
  console.warn('⚠️ WARNING: EXPO_PUBLIC_API_URL is not set. Falling back to localhost:3000. Physical devices may fail to connect.');
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle Timeouts and Network Errors explicitly
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = 'Connection timed out. Please check your internet and try again.';
      return Promise.reject(error);
    }
    if (!error.response && error.message === 'Network Error') {
      error.message = 'Network error. Cannot reach the server.';
      return Promise.reject(error);
    }

    // If we receive a 401 and haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
        
        // Save new tokens
        await useAuthStore.getState().setAuthData({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          user: useAuthStore.getState().user // retain current user until we refetch me
        });

        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + data.access_token;
        originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;
        
        processQueue(null, data.access_token);
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
