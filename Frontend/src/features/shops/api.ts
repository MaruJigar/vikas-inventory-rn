import { Platform } from 'react-native';

import { apiClient, API_BASE_URL } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';
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
  uploadImage: async (shopId: string, image: PickedImage) => {
    const form = new FormData();

    if (Platform.OS === 'web') {
      // The picker uri is a blob:/data: URL — fetch it into a real Blob, then
      // post via the browser's fetch so IT sets multipart + boundary. (axios
      // can't reliably drop the instance's default JSON Content-Type here, and
      // a boundary-less multipart header makes the server's parser fail.)
      const blob = await fetch(image.uri).then((r) => r.blob());
      form.append('file', blob, image.name);
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${API_BASE_URL}/shop-images/${shopId}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      return res.json();
    }

    // React Native: the {uri,name,type} shape + multipart header lets RN's
    // networking generate the boundary automatically.
    form.append('file', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as unknown as Blob);
    const { data } = await apiClient.post(
      `/shop-images/${shopId}/upload`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};
