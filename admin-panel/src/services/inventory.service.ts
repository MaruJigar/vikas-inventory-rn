import { api } from '@/lib/api/axios';
import { PaginatedResponse } from '@/types/api/common.types';
import { InventoryDto, AdjustInventoryDto, InventoryMovementDto } from '@/types/api/inventory.types';

export const inventoryService = {
  getInventory: async (params: Record<string, any>) => {
    const { data } = await api.get<PaginatedResponse<InventoryDto>>('/inventory', { params });
    return data;
  },

  adjustStock: async (payload: AdjustInventoryDto) => {
    const { data } = await api.post<InventoryDto>('/inventory/adjust', payload);
    return data;
  },

  getMovements: async (inventoryId: string, params: Record<string, any>, type?: string) => {
    const { data } = await api.get<PaginatedResponse<InventoryMovementDto>>(`/inventory/${inventoryId}/movements`, {
      params: {
        ...params,
        type,
      },
    });
    return data;
  },
};
