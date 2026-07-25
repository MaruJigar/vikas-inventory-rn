import { useInfiniteQuery } from '@tanstack/react-query';

import { attendanceApi } from '@/features/attendance/api';

const PAGE_SIZE = 20;

export const attendanceKeys = {
  all: ['attendance'] as const,
  list: (salesmanId?: string) =>
    ['attendance', 'list', salesmanId ?? 'all'] as const,
};

/** Paginated attendance history (infinite scroll), newest first. */
export function useAttendance(salesmanId?: string) {
  return useInfiniteQuery({
    queryKey: attendanceKeys.list(salesmanId),
    queryFn: ({ pageParam }) =>
      attendanceApi.list({
        page: pageParam,
        limit: PAGE_SIZE,
        ...(salesmanId ? { salesman_id: salesmanId } : {}),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}
