import { useQuery } from '@tanstack/react-query';
import { manufacturersKeys } from '@/lib/query-keys/manufacturers';
import { manufacturerService } from '@/services/manufacturer.service';

export const useManufacturerProfile = () => {
  return useQuery({
    queryKey: manufacturersKeys.profile(),
    queryFn: () => manufacturerService.getProfile(),
    retry: false, // Don't retry on 404
  });
};
