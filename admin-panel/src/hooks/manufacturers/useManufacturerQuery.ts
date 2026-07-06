import { useQuery } from '@tanstack/react-query';
import { manufacturerService } from '@/services/manufacturer.service';
import { manufacturersKeys } from '@/lib/query-keys/manufacturers';

export function useManufacturerQuery(id?: string) {
  return useQuery({
    queryKey: manufacturersKeys.detail(id!),
    queryFn: () => manufacturerService.getManufacturerById(id!),
    enabled: !!id,
  });
}
