import { useMutation } from '@tanstack/react-query';
import { shopService } from '@/services/shop.service';

interface UploadImagePayload {
  shopId: string;
  formData: FormData;
}

export function useUploadShopImageMutation() {
  return useMutation({
    mutationFn: ({ shopId, formData }: UploadImagePayload) => 
      shopService.uploadShopImage(shopId, formData),
  });
}
