import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { ShopDto, CreateShopDto, UpdateShopDto, CheckDuplicateDto } from '@/types/api/shop.types';

export const shopService = {
  checkDuplicate: (data: CheckDuplicateDto) => api.post<ApiResponse<boolean>>('/shops/check-duplicate', data).then(res => res.data),
  createShop: (data: CreateShopDto) => api.post<ShopDto>('/shops', data).then(res => res.data),
  getShops: (params?: QueryParams) => api.get<PaginatedResponse<ShopDto>>('/shops', { params }).then(res => res.data),
  getShopById: (id: string) => api.get<ApiResponse<ShopDto>>(`/shops/${id}`).then(res => res.data),
  updateShop: (id: string, data: UpdateShopDto) => api.patch<ApiResponse<ShopDto>>(`/shops/${id}`, data).then(res => res.data),
  deleteShop: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/shops/${id}`).then(res => res.data),
  uploadShopImage: (shopId: string, formData: FormData) => 
    api.post<ApiResponse<{ url: string }>>(`/shop-images/${shopId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data),
};
