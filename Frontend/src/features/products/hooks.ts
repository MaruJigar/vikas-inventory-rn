import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { productsApi } from '@/features/products/api';
import type {
  CreateProductPayload,
  UpdateProductPayload,
} from '@/types/product';
import type { PickedImage } from '@/types/shop';

const PAGE_SIZE = 20;

export const productKeys = {
  all: ['products'] as const,
  list: (search: string) => ['products', 'list', search] as const,
  categories: ['products', 'categories'] as const,
};

/** Paginated, searchable product list (infinite scroll). */
export function useProducts(search: string) {
  return useInfiniteQuery({
    queryKey: productKeys.list(search),
    queryFn: ({ pageParam }) =>
      productsApi.list({
        page: pageParam,
        limit: PAGE_SIZE,
        search: search || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

/**
 * Create a distributor product. If an image was picked, it's uploaded first and
 * its URL is attached to the create payload.
 */
export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      payload: CreateProductPayload;
      image?: PickedImage;
    }) => {
      let product_image_url = input.payload.product_image_url;
      if (input.image) {
        product_image_url = await productsApi.uploadImage(input.image);
      }
      return productsApi.create({ ...input.payload, product_image_url });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      payload: UpdateProductPayload;
      image?: PickedImage;
    }) => {
      let product_image_url = input.payload.product_image_url;
      if (input.image) {
        product_image_url = await productsApi.uploadImage(input.image);
      }
      return productsApi.update(id, { ...input.payload, product_image_url });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => productsApi.createCategory(name),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.categories });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: () => productsApi.categories({ limit: 100 }),
    select: (res) => res.data,
  });
}
