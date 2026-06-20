import apiClient from '../../../api/client';

export const productService = {
  getProducts: async ({ page = 1, limit = 50, search = '' } = {}) => {
    const response = await apiClient.get('/products', {
      params: { page, limit, search },
    });
    return response.data;
  },
};
