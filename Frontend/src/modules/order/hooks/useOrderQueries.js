import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';

export const useOrdersList = () => {
  return useQuery({
    queryKey: ['ordersList'],
    queryFn: orderService.getOrders,
  });
};

export const useOrderDetails = (orderId) => {
  return useQuery({
    queryKey: ['orderDetails', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });
};

export const useOrderRevisions = (orderId) => {
  return useQuery({
    queryKey: ['orderRevisions', orderId],
    queryFn: () => orderService.getOrderRevisions(orderId),
    enabled: !!orderId,
  });
};
