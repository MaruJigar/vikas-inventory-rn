import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { ordersKeys } from '@/lib/query-keys/orders';
import { BackorderResolutionDto } from '@/types/api/order.types';
import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';

export function useResolveBackorderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BackorderResolutionDto }) => 
      orderService.resolveBackorder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.backorders.all() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.backorders.detail(id) });
      handleSuccessToast('Backorder successfully allocated/resolved.');
    },
    onError: (error: Error) => {
      handleUnexpectedToast(error);
    },
  });
}
