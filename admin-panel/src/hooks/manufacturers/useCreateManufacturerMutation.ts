import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { manufacturerService } from '@/services/manufacturer.service';
import { manufacturersKeys } from '@/lib/query-keys/manufacturers';
import { CreateManufacturerAdminDto } from '@/types/api/manufacturer.types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export function useCreateManufacturerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateManufacturerAdminDto) => manufacturerService.createManufacturerAdmin(data),
    onSuccess: () => {
      handleSuccessToast('Create Manufacturer successful');
      toast.success('Manufacturer created successfully');
      queryClient.invalidateQueries({ queryKey: manufacturersKeys.lists() });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || 'Failed to create manufacturer';
      toast.error(message);
    },
  });
}
