import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { productsApi } from '@/features/products/api';

const PAGE_SIZE = 20;

export const productKeys = {
  all: ['products'] as const,
  list: (search: string) => ['products', 'list', search] as const,
  categories: ['products', 'categories'] as const,
};

/** Paginated, searchable product list (infinite scroll). */
export function useProducts(search: string) {
  return useInfiniteQuery({
    queryKey: productKeys.list(search),
    queryFn: ({ pageParam }) =>
      productsApi.list({
        page: pageParam,
        limit: PAGE_SIZE,
        search: search || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: () => productsApi.categories({ limit: 100 }),
    select: (res) => res.data,
  });
}
