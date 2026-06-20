import apiClient from '../../../api/client';

export const workingDayService = {
  getHistory: async () => {
    const response = await apiClient.get('/working-day/history');
    return response.data;
  },
  
  checkIn: async (payload) => {
    const response = await apiClient.post('/working-day/check-in', payload);
    return response.data;
  },
  
  checkOut: async (payload) => {
    const response = await apiClient.post('/working-day/check-out', payload);
    return response.data;
  }
};
