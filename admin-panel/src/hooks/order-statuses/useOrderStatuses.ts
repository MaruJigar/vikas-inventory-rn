import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderStatusService } from '@/services/order-status.service';
import {
  CreateOrderStatusDto,
  UpdateOrderStatusDto,
} from '@/types/api/order-status.types';
import toast from 'react-hot-toast';

export const ORDER_STATUSES_KEY = 'order-statuses';

export function useGetOrderStatuses() {
  return useQuery({
    queryKey: [ORDER_STATUSES_KEY],
    queryFn: () => orderStatusService.getAll(),
  });
}

export function useGetOrderStatus(id: string) {
  return useQuery({
    queryKey: [ORDER_STATUSES_KEY, id],
    queryFn: () => orderStatusService.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderStatusDto) => orderStatusService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDER_STATUSES_KEY] });
      toast.success('Order status created successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create order status';
      toast.error(message);
    },
  });
}

export function useUpdateOrderStatusMutation(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id: targetId, data }: { id: string; data: UpdateOrderStatusDto }) =>
      orderStatusService.update(targetId || id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDER_STATUSES_KEY] });
      toast.success('Order status updated successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update order status';
      toast.error(message);
    },
  });
}
