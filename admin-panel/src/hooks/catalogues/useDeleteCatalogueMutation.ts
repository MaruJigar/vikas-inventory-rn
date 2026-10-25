import { useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogueService } from '@/services/catalogue.service';
import { cataloguesKeys } from './useCataloguesQuery';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export function useDeleteCatalogueMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (manufacturerId?: string) =>
      catalogueService.deleteCatalogue(manufacturerId),
    onSuccess: () => {
      toast.success('Catalogue deleted successfully');
      queryClient.invalidateQueries({ queryKey: cataloguesKeys.lists() });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message || 'Failed to delete catalogue';
      toast.error(message);
    },
  });
}
