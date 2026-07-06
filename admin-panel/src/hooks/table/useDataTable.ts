'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useTransition } from 'react';
import { parseTableQueryParams } from '@/lib/table/table-query-parser';
import { buildTableQueryString } from '@/lib/table/table-query-builder';
import { QueryParams } from '@/types/api/common.types';

export function useDataTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // The current query state is derived directly from the URL.
  const queryState = useMemo(() => parseTableQueryParams(searchParams), [searchParams]);

  const updateUrl = useCallback(
    (updates: Partial<QueryParams>) => {
      const queryString = buildTableQueryString(searchParams, updates);
      startTransition(() => {
        router.push(`${pathname}?${queryString}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const setPage = useCallback(
    (page: number) => {
      updateUrl({ page });
    },
    [updateUrl]
  );

  const setLimit = useCallback(
    (limit: number) => {
      updateUrl({ limit, page: 1 }); // Reset to page 1 on limit change
    },
    [updateUrl]
  );

  const setSearch = useCallback(
    (search: string) => {
      updateUrl({ search: search || undefined, page: 1 }); // Reset to page 1 on search
    },
    [updateUrl]
  );

  const setSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      updateUrl({ sortBy, sortOrder });
    },
    [updateUrl]
  );

  const clearSort = useCallback(() => {
    updateUrl({ sortBy: undefined, sortOrder: undefined });
  }, [updateUrl]);
  
  const setFilter = useCallback(
    (key: string, value: string | undefined) => {
      updateUrl({ [key]: value, page: 1 }); // Reset to page 1 on filter change
    },
    [updateUrl]
  );

  return {
    queryState,
    isPending,
    setPage,
    setLimit,
    setSearch,
    setSort,
    clearSort,
    setFilter,
    updateUrl,
  };
}
