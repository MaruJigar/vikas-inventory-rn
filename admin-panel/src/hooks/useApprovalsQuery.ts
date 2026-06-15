import { useQuery } from '@tanstack/react-query';
import { approvalsKeys } from '@/lib/query-keys/approvals';
import { approvalService } from '@/services/approval.service';
import { useAuthStore } from '@/store/useAuthStore';
import { isAdminRole } from '@/lib/auth/rbac';

export const useApprovalsQuery = (filters: Record<string, unknown>) => {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: approvalsKeys.list(filters),
    queryFn: () => approvalService.getPendingRequests(),
    enabled: !!user && isAdminRole(user.role),
  });
};
