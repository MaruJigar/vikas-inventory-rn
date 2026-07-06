import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { distributorService } from '@/services/distributor.service';
import { distributorsKeys } from '@/lib/query-keys/distributors';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export function useDeleteDistributorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => distributorService.deleteDistributorAdmin(id),
    onSuccess: () => {
      handleSuccessToast('Delete Distributor successful');
      toast.success('Distributor deleted successfully');
      queryClient.invalidateQueries({ queryKey: distributorsKeys.lists() });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || 'Failed to delete distributor';
      toast.error(message);
    },
  });
}
