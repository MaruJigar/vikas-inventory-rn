import { apiClient } from '@/api/client';
import type { ListQuery, Paginated } from '@/api/types';
import type { Category, Product } from '@/types/product';

export const productsApi = {
  list: (query: ListQuery) =>
    apiClient
      .get<Paginated<Product>>('/products', { params: query })
      .then((r) => r.data),

  categories: (query: ListQuery) =>
    apiClient
      .get<Paginated<Category>>('/product-categories', { params: query })
      .then((r) => r.data),
};
