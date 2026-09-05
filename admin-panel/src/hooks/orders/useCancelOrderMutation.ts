import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { ordersKeys } from '@/lib/query-keys/orders';
import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { CancelOrderDto } from '@/types/api/order.types';

export function useCancelOrderMutation(orderId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelOrderDto) => {
      if (!orderId) throw new Error('Order ID is required');
      return orderService.cancelOrder(orderId, data);
    },
    onSuccess: () => {
      handleSuccessToast('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ordersKeys.detail(orderId) });
        queryClient.invalidateQueries({ queryKey: ordersKeys.revisions(orderId) });
        queryClient.invalidateQueries({ queryKey: ordersKeys.statusHistory(orderId) });
      }
    },
    onError: (error) => {
      handleUnexpectedToast(error);
    },
  });
}
