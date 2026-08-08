import { useQuery } from '@tanstack/react-query';
import { orderStatusService } from '@/services/order-status.service';

export function useGetActiveOrderStatusesQuery() {
  return useQuery({
    queryKey: ['order-statuses', 'active'],
    queryFn: async () => {
      return await orderStatusService.getActiveStatuses();
    },
  });
}
