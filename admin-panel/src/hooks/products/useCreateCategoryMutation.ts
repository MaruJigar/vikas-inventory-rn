import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { productsKeys } from '@/lib/query-keys/products';
import { CreateCategoryDto } from '@/types/api/product.types';

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => productService.createCategory(data),
    onSuccess: () => {
      // Invalidate categories list to refetch
      queryClient.invalidateQueries({ queryKey: productsKeys.categories() });
    },
  });
}
