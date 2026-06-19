import apiClient from '../../../api/client';

export const visitService = {
  getVisits: async () => {
    const response = await apiClient.get('/visits');
    return response.data;
  },

  startVisit: async (payload) => {
    const response = await apiClient.post('/visits/start', payload);
    return response.data;
  },

  endVisit: async (payload) => {
    const response = await apiClient.post('/visits/end', payload);
    return response.data;
  },

  noOrderVisit: async (payload) => {
    const response = await apiClient.post('/visits/no-order', payload);
    return response.data;
  }
};
