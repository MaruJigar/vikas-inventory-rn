import { QueryParams } from '@/types/api/common.types';

export const distributorsKeys = {
  all: ['distributors'] as const,
  lists: () => [...distributorsKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...distributorsKeys.lists(), params] as const,
  details: () => [...distributorsKeys.all, 'detail'] as const,
  detail: (id: string) => [...distributorsKeys.details(), id] as const,
};
