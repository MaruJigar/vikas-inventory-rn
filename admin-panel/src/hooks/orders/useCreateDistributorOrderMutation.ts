import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { ApiError } from '@/types/api/common.types';
import { ordersKeys } from '@/lib/query-keys/orders';
import { OrderDto } from '@/types/api/order.types';

export interface CreateDistributorOrderPayload {
  products: {
    productId: string;
    quantity: number;
  }[];
  transportMode?: string;
}

export const useCreateDistributorOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDistributorOrderPayload) => {
      const response = await api.post<{ data: OrderDto | OrderDto[]; message: string }>(
        '/orders/distributor-to-manufacturer',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      handleSuccessToast('Purchase order successfully created.');
    },
    onError: (error: ApiError) => {
      handleUnexpectedToast(error);
    },
  });
};
