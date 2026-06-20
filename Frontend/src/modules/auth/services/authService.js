import apiClient from '../../../api/client';

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  registerDistributor: async (data) => {
    const response = await apiClient.post('/auth/register/distributor', data);
    return response.data;
  },

  registerSalesman: async (data) => {
    const response = await apiClient.post('/auth/register/salesman', data);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
