import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import { CreateDistributorOrderPayload } from './useCreateDistributorOrderMutation';

export const usePreviewDistributorOrderMutation = () => {
  return useMutation({
    mutationFn: async (payload: CreateDistributorOrderPayload) => {
      const response = await api.post<any>(
        '/orders/distributor-to-manufacturer/preview',
        payload
      );
      return response.data;
    },
  });
};
