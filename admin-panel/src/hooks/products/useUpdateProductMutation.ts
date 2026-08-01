import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { productsKeys } from '@/lib/query-keys/products';
import { UpdateProductDto } from '@/types/api/product.types';

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) => productService.updateProduct(id, data),
    onError: (error) => {
      handleUnexpectedToast(error);
    },
    onSuccess: (_, variables) => {
      handleSuccessToast('Update Product successful');
      // Invalidate both the list and the specific detail view
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(variables.id) });
    },
  });
}
