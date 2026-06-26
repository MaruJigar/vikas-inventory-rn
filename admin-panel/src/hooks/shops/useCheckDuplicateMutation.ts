import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation } from '@tanstack/react-query';
import { shopService } from '@/services/shop.service';
import { CheckDuplicateDto } from '@/types/api/shop.types';

export function useCheckDuplicateMutation() {
  return useMutation({
    mutationFn: (data: CheckDuplicateDto) => shopService.checkDuplicate(data),
  });
}
