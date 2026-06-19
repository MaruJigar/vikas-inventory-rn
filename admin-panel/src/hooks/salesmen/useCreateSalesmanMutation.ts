import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesmanService } from '@/services/salesman.service';
import { salesmenKeys } from '@/lib/query-keys/salesmen';
import { RegisterSalesmanDto } from '@/types/api/salesman.types';

export function useCreateSalesmanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterSalesmanDto) => salesmanService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesmenKeys.all });
    },
  });
}
