import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { distributorService } from '@/services/distributor.service';
import { distributorsKeys } from '@/lib/query-keys/distributors';
import { CreateDistributorAdminDto } from '@/types/api/distributor.types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export function useCreateDistributorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDistributorAdminDto) => distributorService.createDistributorAdmin(data),
    onSuccess: () => {
      handleSuccessToast('Create Distributor successful');
      toast.success('Distributor created successfully');
      queryClient.invalidateQueries({ queryKey: distributorsKeys.lists() });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || 'Failed to create distributor';
      toast.error(message);
    },
  });
}
