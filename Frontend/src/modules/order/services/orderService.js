import apiClient from '../../../api/client';

export const orderService = {
  createOrder: async (payload) => {
    const response = await apiClient.post('/orders', payload);
    return response.data;
  },

  getOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id, payload) => {
    const response = await apiClient.patch(`/orders/${id}/cancel`, payload);
    return response.data;
  },

  getOrderRevisions: async (id) => {
    const response = await apiClient.get(`/orders/${id}/revisions`);
    return response.data;
  }
};
