import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesmanService } from '@/services/salesman.service';
import { salesmenKeys } from '@/lib/query-keys/salesmen';

export function useUpdateSalesmanStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      salesmanService.updateSalesmanStatus(id, { is_active }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesmenKeys.all });
      queryClient.invalidateQueries({ queryKey: salesmenKeys.detail(variables.id) });
    },
  });
}
