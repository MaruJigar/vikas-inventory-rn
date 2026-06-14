import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { InventoryDto, AdjustInventoryDto } from '@/types/api/inventory.types';

export const inventoryService = {
  adjustInventory: (data: AdjustInventoryDto) => api.post<ApiResponse<InventoryDto>>('/inventory/adjust', data).then(res => res.data),
  getInventory: (params?: QueryParams) => api.get<PaginatedResponse<InventoryDto>>('/inventory', { params }).then(res => res.data),
};
