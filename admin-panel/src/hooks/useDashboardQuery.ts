import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from '@/lib/query-keys/analytics';
import { analyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/store/useAuthStore';
import { isAdminRole } from '@/lib/auth/rbac';

export const useDashboardQuery = () => {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsService.getDashboard(),
    enabled: !!user && isAdminRole(user.role),
  });
};
