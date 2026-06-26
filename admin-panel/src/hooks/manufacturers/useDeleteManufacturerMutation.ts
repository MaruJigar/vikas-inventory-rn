import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { manufacturerService } from '@/services/manufacturer.service';
import { manufacturersKeys } from '@/lib/query-keys/manufacturers';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export function useDeleteManufacturerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => manufacturerService.deleteManufacturerAdmin(id),
    onSuccess: () => {
      handleSuccessToast('Delete Manufacturer successful');
      toast.success('Manufacturer deleted successfully');
      queryClient.invalidateQueries({ queryKey: manufacturersKeys.lists() });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || 'Failed to delete manufacturer';
      toast.error(message);
    },
  });
}
