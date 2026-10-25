import { useQuery } from '@tanstack/react-query';
import { catalogueService } from '@/services/catalogue.service';

export const cataloguesKeys = {
  all: ['catalogues'] as const,
  lists: () => [...cataloguesKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...cataloguesKeys.lists(), filters] as const,
  details: () => [...cataloguesKeys.all, 'detail'] as const,
  detail: (id: string) => [...cataloguesKeys.details(), id] as const,
};

export function useCataloguesQuery(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: cataloguesKeys.list(filters),
    queryFn: () => catalogueService.getCatalogues(filters),
    placeholderData: (previousData) => previousData,
  });
}
