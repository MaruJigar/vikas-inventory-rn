import { Platform } from 'react-native';

import { apiClient, API_BASE_URL } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import type { ListQuery, Paginated } from '@/api/types';
import type { Category, CreateProductPayload, Product } from '@/types/product';
import type { PickedImage } from '@/types/shop';

export const productsApi = {
  list: (query: ListQuery) =>
    apiClient
      .get<Paginated<Product>>('/products', { params: query })
      .then((r) => r.data),

  categories: (query: ListQuery) =>
    apiClient
      .get<Paginated<Category>>('/product-categories', { params: query })
      .then((r) => r.data),

  create: (payload: CreateProductPayload) =>
    apiClient.post<Product>('/products', payload).then((r) => r.data),

  /** Upload a product image (multipart, field `image`) → returns its URL. */
  uploadImage: async (image: PickedImage): Promise<string> => {
    const url = `${API_BASE_URL}/uploads/products`;
    const form = new FormData();

    if (Platform.OS === 'web') {
      const blob = await fetch(image.uri).then((r) => r.blob());
      form.append('image', blob, image.name);
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      return (await res.json()).url as string;
    }

    form.append('image', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as unknown as Blob);
    const { data } = await apiClient.post<{ url: string }>(
      '/uploads/products',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.url;
  },
};
