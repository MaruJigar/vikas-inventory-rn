import { useQuery } from '@tanstack/react-query';
import { orderStatusService } from '@/services/order-status.service';
import { ordersKeys } from '@/lib/query-keys/orders';

export function useGetNextOrderStatusQuery(statusId: string | null) {
  return useQuery({
    queryKey: ['order-status', 'next', statusId],
    queryFn: async () => {
      if (!statusId) return null;
      const response = await orderStatusService.getNextStatus(statusId);
      return response.data || response; // handle API wrapping if any
    },
    enabled: !!statusId,
  });
}
