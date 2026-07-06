import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { productsKeys } from '@/lib/query-keys/products';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: productsKeys.categories(),
    queryFn: () => productService.getCategories(),
  });
}
