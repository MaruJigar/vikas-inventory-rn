import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService } from '@/services/shop.service';
import { shopsKeys } from '@/lib/query-keys/shops';

export function useDeleteShopMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shopService.deleteShop(id),
    onError: (error) => {
      handleUnexpectedToast(error);
    },
    onSuccess: () => {
      handleSuccessToast('Delete Shop successful');
      queryClient.invalidateQueries({ queryKey: shopsKeys.all });
    },
  });
}
