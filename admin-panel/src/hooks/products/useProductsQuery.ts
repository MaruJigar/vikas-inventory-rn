import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { productsKeys } from '@/lib/query-keys/products';
import { QueryParams, PaginatedResponse } from '@/types/api/common.types';
import { ProductDto } from '@/types/api/product.types';

export function useProductsQuery(
  params?: QueryParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<ProductDto>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productsKeys.list(params || {}),
    queryFn: () => productService.getProducts(params),
    ...options,
  });
}
