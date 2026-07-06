import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

export const useUploadProductImageMutation = () => {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return productService.uploadProductImage(formData);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    },
  });
};
