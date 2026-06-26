import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { ordersKeys } from '@/lib/query-keys/orders';

export function useOrderQuery(id: string | null) {
  return useQuery({
    queryKey: ordersKeys.detail(id!),
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id,
  });
}
