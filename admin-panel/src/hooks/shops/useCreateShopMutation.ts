import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService } from '@/services/shop.service';
import { CreateShopDto } from '@/types/api/shop.types';
import { shopsKeys } from '@/lib/query-keys/shops';

export function useCreateShopMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShopDto) => shopService.createShop(data),
    onError: (error) => {
      handleUnexpectedToast(error);
    },
    onSuccess: () => {
      handleSuccessToast('Create Shop successful');
      queryClient.invalidateQueries({ queryKey: shopsKeys.all });
    },
  });
}
