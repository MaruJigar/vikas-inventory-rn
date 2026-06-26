import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService } from '@/services/shop.service';
import { shopsKeys } from '@/lib/query-keys/shops';

interface UploadImagePayload {
  shopId: string;
  formData: FormData;
}

export function useUploadShopImageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shopId, formData }: UploadImagePayload) => 
      shopService.uploadShopImage(shopId, formData),
    onError: (error) => {
      handleUnexpectedToast(error);
    },
    onSuccess: () => {
      handleSuccessToast('Upload Shop Image successful');
      queryClient.invalidateQueries({ queryKey: shopsKeys.all });
    },
  });
}
