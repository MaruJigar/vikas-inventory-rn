import { useMutation } from '@tanstack/react-query';
import { shopService } from '@/services/shop.service';
import { CreateShopDto } from '@/types/api/shop.types';

export function useCreateShopMutation() {
  return useMutation({
    mutationFn: (data: CreateShopDto) => shopService.createShop(data),
  });
}
