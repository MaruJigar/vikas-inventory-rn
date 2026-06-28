import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { shopsApi } from '@/features/shops/api';
import type {
  CheckDuplicatePayload,
  CreateShopPayload,
  PickedImage,
} from '@/types/shop';

const PAGE_SIZE = 20;

export const shopKeys = {
  all: ['shops'] as const,
  list: (search: string) => ['shops', 'list', search] as const,
  detail: (id: string) => ['shops', 'detail', id] as const,
};

/** Paginated, searchable shop list (infinite scroll). */
export function useShops(search: string) {
  return useInfiniteQuery({
    queryKey: shopKeys.list(search),
    queryFn: ({ pageParam }) =>
      shopsApi.list({
        page: pageParam,
        limit: PAGE_SIZE,
        search: search || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

export function useShop(id: string) {
  return useQuery({
    queryKey: shopKeys.detail(id),
    queryFn: () => shopsApi.getById(id),
  });
}

export function useCheckDuplicate() {
  return useMutation({
    mutationFn: (payload: CheckDuplicatePayload) =>
      shopsApi.checkDuplicate(payload),
  });
}

/**
 * Create a shop and, if a photo was picked, upload it. The image upload is
 * best-effort: a created shop is not discarded just because its photo failed.
 */
export function useCreateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      payload: CreateShopPayload;
      image?: PickedImage;
    }) => {
      const shop = await shopsApi.create(input.payload);
      if (input.image) {
        await shopsApi.uploadImage(shop.id, input.image);
      }
      return shop;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: shopKeys.all });
    },
  });
}

export function useDeleteShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shopsApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: shopKeys.all });
    },
  });
}
