import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import { AdjustInventoryDto } from '@/types/api/inventory.types';
import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';

export function useAdjustInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdjustInventoryDto) => inventoryService.adjustStock(data),
    onSuccess: () => {
      handleSuccessToast('Inventory adjusted successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: any) => {
      handleUnexpectedToast(error);
    },
  });
}
