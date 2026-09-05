import { useQuery } from '@tanstack/react-query';
import { shopService } from '@/services/shop.service';
import { shopsKeys } from '@/lib/query-keys/shops';
import { QueryParams } from '@/types/api/common.types';

export function useShopsQuery(params?: QueryParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: shopsKeys.list(params || {}),
    queryFn: () => shopService.getShops(params),
    enabled: options?.enabled,
  });
}
