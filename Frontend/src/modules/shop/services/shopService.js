import { apiClient } from '../../../api/client';

export const shopService = {
  checkDuplicate: async (data) => {
    const response = await apiClient.post('/shops/check-duplicate', data);
    return response.data;
  },

  createShop: async (data) => {
    const response = await apiClient.post('/shops', data);
    return response.data;
  },

  uploadShopImage: async (shopId, formData) => {
    const response = await apiClient.post(`/shop-images/${shopId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getShops: async (params) => {
    const response = await apiClient.get('/shops', { params });
    return response.data;
  },

  getShopById: async (id) => {
    const response = await apiClient.get(`/shops/${id}`);
    return response.data;
  },
};
