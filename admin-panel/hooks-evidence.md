
--- useApprovalsQuery.ts ---
import { useQuery } from '@tanstack/react-query';
import { approvalsKeys } from '@/lib/query-keys/approvals';
import { approvalService } from '@/services/approval.service';

export const useApprovalsQuery = (filters: Record<string, unknown>) => {
  return useQuery({
    queryKey: approvalsKeys.list(filters),
    queryFn: () => approvalService.getPendingRequests(),
  });
};

--- useDashboardQuery.ts ---
import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from '@/lib/query-keys/analytics';
import { analyticsService } from '@/services/analytics.service';

export const useDashboardQuery = () => {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsService.getDashboard(),
  });
};

--- useManufacturerProfile.ts ---
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

--- useReviewApprovalMutation.ts ---
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalService } from '@/services/approval.service';
import { approvalsKeys } from '@/lib/query-keys/approvals';
import { ReviewApprovalDto } from '@/types/api/approval.types';

export const useReviewApprovalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ReviewApprovalDto }) =>
      approvalService.reviewRequest(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalsKeys.all });
    },
  });
};

--- useUpdateManufacturerProfile.ts ---
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { manufacturerService } from '@/services/manufacturer.service';
import { manufacturersKeys } from '@/lib/query-keys/manufacturers';
import { CreateManufacturerDto, UpdateManufacturerDto } from '@/types/api/manufacturer.types';

export const useUpdateManufacturerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateManufacturerDto) => manufacturerService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturersKeys.profile() });
    },
  });
};

export const useCreateManufacturerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateManufacturerDto) => manufacturerService.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturersKeys.profile() });
    },
  });
};
