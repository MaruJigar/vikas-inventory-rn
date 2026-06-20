import { useQuery } from '@tanstack/react-query';
import { shopService } from '../services/shopService';

export const useShopList = () => {
  return useQuery({
    queryKey: ['shops'],
    queryFn: shopService.getShops,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};
