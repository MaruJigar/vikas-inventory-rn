import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { Alert } from 'react-native';

export const useOrderMutations = () => {
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (payload) => {
      return await orderService.createOrder(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ordersList']);
      queryClient.invalidateQueries(['dashboardAnalytics']);
      queryClient.invalidateQueries(['visitHistory']);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to place order';
      Alert.alert('Order Error', message);
    }
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }) => {
      return await orderService.cancelOrder(orderId, { cancellationReason: reason });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['ordersList']);
      queryClient.invalidateQueries(['orderDetails', variables.orderId]);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to cancel order';
      Alert.alert('Cancellation Error', message);
    }
  });

  return { createOrderMutation, cancelOrderMutation };
};
