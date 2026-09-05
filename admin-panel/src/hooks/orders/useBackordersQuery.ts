import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { ordersKeys } from '@/lib/query-keys/orders';
import { QueryParams } from '@/types/api/common.types';

export function useBackordersQuery(params: QueryParams) {
  return useQuery({
    queryKey: ordersKeys.backorders.list(params),
    queryFn: () => orderService.getBackorders(params),
  });
}
