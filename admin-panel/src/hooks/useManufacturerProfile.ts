import { useQuery } from '@tanstack/react-query';
import { manufacturersKeys } from '@/lib/query-keys/manufacturers';
import { manufacturerService } from '@/services/manufacturer.service';
import { useAuthStore } from '@/store/useAuthStore';
import { isAdminRole } from '@/lib/auth/rbac';

export const useManufacturerProfile = () => {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: manufacturersKeys.profile(),
    queryFn: () => manufacturerService.getProfile(),
    retry: false, // Don't retry on 404
    enabled: !!user && isAdminRole(user.role),
  });
};
