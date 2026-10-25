import { useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogueService } from '@/services/catalogue.service';
import { cataloguesKeys } from './useCataloguesQuery';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface UploadCatalogueArgs {
  file: File;
  manufacturerId?: string;
  isReplace?: boolean;
}

export function useUploadCatalogueMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, manufacturerId, isReplace }: UploadCatalogueArgs) => {
      if (isReplace) {
        return catalogueService.replaceCatalogue(file, manufacturerId);
      }
      return catalogueService.uploadCatalogue(file, manufacturerId);
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isReplace
          ? 'Catalogue replaced successfully'
          : 'Catalogue uploaded successfully',
      );
      queryClient.invalidateQueries({ queryKey: cataloguesKeys.lists() });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message || 'Failed to upload catalogue';
      toast.error(message);
    },
  });
}
