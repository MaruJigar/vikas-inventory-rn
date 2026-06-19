import { useInfiniteQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';

export const useProductList = (search = '') => {
  return useInfiniteQuery({
    queryKey: ['products', search],
    queryFn: ({ pageParam = 1 }) => 
      productService.getProducts({ page: pageParam, limit: 50, search }),
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta?.hasNextPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    // Using a large stale time as products are a heavy full-table scan 
    // and rarely change during a single field operation session.
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
