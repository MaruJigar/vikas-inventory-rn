import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { productsKeys } from '@/lib/query-keys/products';
import { CreateProductDto } from '@/types/api/product.types';

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productService.createProduct(data),
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}
