import { useQuery } from '@tanstack/react-query';
import { manufacturerService } from '@/services/manufacturer.service';
import { manufacturersKeys } from '@/lib/query-keys/manufacturers';

export function useManufacturersQuery(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: manufacturersKeys.list(filters),
    queryFn: () => manufacturerService.getManufacturers(filters),
    placeholderData: (previousData) => previousData,
  });
}
