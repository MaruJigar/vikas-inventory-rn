import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { manufacturerService } from '@/services/manufacturer.service';
import { manufacturersKeys } from '@/lib/query-keys/manufacturers';
import { UpdateManufacturerDto } from '@/types/api/manufacturer.types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export function useUpdateManufacturerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateManufacturerDto }) => 
      manufacturerService.updateManufacturerAdmin(id, data),
    onSuccess: () => {
      handleSuccessToast('Update Manufacturer successful');
      toast.success('Manufacturer updated successfully');
      queryClient.invalidateQueries({ queryKey: manufacturersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: manufacturersKeys.details() });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || 'Failed to update manufacturer';
      toast.error(message);
    },
  });
}
