import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { distributorService } from '@/services/distributor.service';
import { distributorsKeys } from '@/lib/query-keys/distributors';
import { UpdateDistributorAdminDto } from '@/types/api/distributor.types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export function useUpdateDistributorMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDistributorAdminDto) => distributorService.updateDistributorAdmin(id, data),
    onSuccess: () => {
      handleSuccessToast('Update Distributor successful');
      toast.success('Distributor updated successfully');
      queryClient.invalidateQueries({ queryKey: distributorsKeys.all });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || 'Failed to update distributor';
      toast.error(message);
    },
  });
}
