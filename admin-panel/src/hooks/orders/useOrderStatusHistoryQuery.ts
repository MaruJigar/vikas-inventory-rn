import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { ordersKeys } from '@/lib/query-keys/orders';
import { QueryParams } from '@/types/api/common.types';

export function useOrderStatusHistoryQuery(orderId: string | null, params: QueryParams) {
  return useQuery({
    queryKey: [...ordersKeys.statusHistory(orderId || ''), params],
    queryFn: () => {
      if (!orderId) throw new Error('Order ID is required');
      return orderService.getOrderStatusHistory(orderId, params);
    },
    enabled: !!orderId,
  });
}
