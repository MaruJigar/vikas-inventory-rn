import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService } from '@/services/shop.service';
import { UpdateShopDto } from '@/types/api/shop.types';
import { shopsKeys } from '@/lib/query-keys/shops';

interface UpdateShopPayload {
  id: string;
  data: UpdateShopDto;
}

export function useUpdateShopMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: UpdateShopPayload) => shopService.updateShop(id, data),
    onError: (error) => {
      handleUnexpectedToast(error);
    },
    onSuccess: () => {
      handleSuccessToast('Update Shop successful');
      queryClient.invalidateQueries({ queryKey: shopsKeys.all });
    },
  });
}
