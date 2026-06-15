import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { productsKeys } from '@/lib/query-keys/products';
import { QueryParams } from '@/types/api/common.types';

export function useProductsQuery(params?: QueryParams) {
  return useQuery({
    queryKey: productsKeys.list(params || {}),
    queryFn: () => productService.getProducts(params),
  });
}
