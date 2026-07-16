import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import { OrderDto } from '@/types/api/order.types';
import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { ApiError } from '@/types/api/common.types';
import { ordersKeys } from '@/lib/query-keys/orders';

export const useGeneratePurchaseRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<{ data: OrderDto; message: string }>('/orders/purchase-request/generate');
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      handleSuccessToast('A new draft purchase request has been created.');
    },
    onError: (error: ApiError) => {
      handleUnexpectedToast(error);
    },
  });
};
