import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { ordersKeys } from '@/lib/query-keys/orders';

export function useBackorderQuery(id: string | null) {
  return useQuery({
    queryKey: ordersKeys.backorders.detail(id || ''),
    queryFn: () => {
      if (!id) throw new Error('ID is required');
      return orderService.getBackorderById(id);
    },
    enabled: !!id,
  });
}
