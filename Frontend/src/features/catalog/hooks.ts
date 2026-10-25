import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { catalogueApi } from '@/features/catalog/api';
import { useAuthStore } from '@/store/useAuthStore';

const PAGE_SIZE = 20;

export const catalogueKeys = {
  all: ['catalogues'] as const,
  publicList: (search: string) => ['catalogues', 'public', search] as const,
  accessibleList: (userId: string, search: string) =>
    ['catalogues', 'accessible', userId, search] as const,
};

/**
 * Public Catalogue Query (supports search and pagination).
 * Available for both unauthenticated and authenticated users.
 */
export function usePublicCatalogues(search: string = '') {
  return useInfiniteQuery({
    queryKey: catalogueKeys.publicList(search),
    queryFn: ({ pageParam }) =>
      catalogueApi.getPublicCatalogues({
        page: pageParam,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

/**
 * Relationship-Scoped Catalogue Query (supports search and pagination).
 * Only executes when the user is authenticated as DISTRIBUTOR or SALESMAN.
 */
export function useAccessibleCatalogues(search: string = '') {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = status === 'authenticated' && !!user;

  const isEligibleRole =
    user?.role === 'DISTRIBUTOR_ADMIN' ||
    user?.role === 'DISTRIBUTOR' ||
    user?.role === 'SALESMAN' ||
    user?.role === 'SUPER_ADMIN';

  return useInfiniteQuery({
    queryKey: catalogueKeys.accessibleList(user?.id ?? 'anon', search),
    queryFn: ({ pageParam }) =>
      catalogueApi.getAccessibleCatalogues({
        page: pageParam,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: isAuthenticated && isEligibleRole,
  });
}
