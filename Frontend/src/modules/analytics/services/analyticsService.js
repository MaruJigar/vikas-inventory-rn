import apiClient from '../../../api/client';

export const analyticsService = {
  getDashboard: async () => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },
};
