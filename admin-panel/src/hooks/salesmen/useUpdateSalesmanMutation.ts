import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesmanService } from '@/services/salesman.service';
import { salesmenKeys } from '@/lib/query-keys/salesmen';
import { UpdateSalesmanDto } from '@/types/api/salesman.types';

interface UpdateSalesmanPayload {
  id: string;
  data: UpdateSalesmanDto;
}

export function useUpdateSalesmanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateSalesmanPayload) => salesmanService.updateSalesman(id, data),
    onError: (error) => {
      handleUnexpectedToast(error);
    },
    onSuccess: (_, { id }) => {
      handleSuccessToast('Update Salesman successful');
      // Invalidate both the list and the specific detail query
      queryClient.invalidateQueries({ queryKey: salesmenKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salesmenKeys.detail(id) });
    },
  });
}
