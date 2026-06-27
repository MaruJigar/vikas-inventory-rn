import { apiClient } from '@/api/client';
import type { ListQuery, Paginated } from '@/api/types';
import type {
  CheckDuplicatePayload,
  CreateShopPayload,
  DuplicateMatch,
  PickedImage,
  Shop,
} from '@/types/shop';

export const shopsApi = {
  list: (query: ListQuery) =>
    apiClient
      .get<Paginated<Shop>>('/shops', { params: query })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Shop>(`/shops/${id}`).then((r) => r.data),

  create: (payload: CreateShopPayload) =>
    apiClient.post<Shop>('/shops', payload).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/shops/${id}`).then((r) => r.data),

  checkDuplicate: (payload: CheckDuplicatePayload) =>
    apiClient
      .post<DuplicateMatch[]>('/shops/check-duplicate', payload)
      .then((r) => r.data),

  /** Upload the visiting-card photo for a freshly-created shop (multipart). */
  uploadImage: (shopId: string, image: PickedImage) => {
    const form = new FormData();
    // RN FormData accepts the {uri,name,type} file shape.
    form.append('file', image as unknown as Blob);
    return apiClient
      .post(`/shop-images/${shopId}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
