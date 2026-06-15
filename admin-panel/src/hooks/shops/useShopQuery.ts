import { useQuery } from '@tanstack/react-query';
import { shopService } from '@/services/shop.service';
import { shopsKeys } from '@/lib/query-keys/shops';

export function useShopQuery(id: string) {
  return useQuery({
    queryKey: shopsKeys.detail(id),
    queryFn: () => shopService.getShopById(id),
    enabled: !!id,
  });
}
