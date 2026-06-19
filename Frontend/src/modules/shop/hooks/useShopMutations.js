import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService } from '../services/shopService';

export const useCheckDuplicateMutation = () => {
  return useMutation({
    mutationFn: (data) => shopService.checkDuplicate(data),
  });
};

export const useCreateShopMutation = () => {
  return useMutation({
    mutationFn: (data) => shopService.createShop(data),
  });
};

export const useUploadShopImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shopId, formData }) => shopService.uploadShopImage(shopId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
};
