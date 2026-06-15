import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { productsKeys } from '@/lib/query-keys/products';

export function usePricingHistoryQuery(id: string) {
  return useQuery({
    queryKey: productsKeys.pricingHistory(id),
    queryFn: () => productService.getPricingHistory(id),
    enabled: !!id,
  });
}
