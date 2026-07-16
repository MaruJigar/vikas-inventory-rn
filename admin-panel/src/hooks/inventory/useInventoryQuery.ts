import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';

export function useInventoryQuery(params: Record<string, any>) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryService.getInventory(params),
    placeholderData: (previousData) => previousData,
  });
}
