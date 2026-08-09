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
import { joinMediaUrls } from '@/lib/media';

const PAGE_SIZE = 20;

export const productKeys = {
  all: ['products'] as const,
  list: (search: string, ownOnly = false) =>
    ['products', 'list', search, ownOnly ? 'own' : 'all'] as const,
  categories: ['products', 'categories'] as const,
  categoryList: (search: string) =>
    ['products', 'categories', 'list', search] as const,
};

/**
 * Paginated, searchable product list (infinite scroll), **active products
 * only**. `ownOnly` restricts to the caller's own products via the backend
 * `own_products_only` filter.
 *
 * The active filter is applied CLIENT-side because the API has no parameter for
 * it: `ProductListQueryDto` accepts only `own_products_only`, and while the
 * shared `ListQueryDto` carries a `status` field, `getProducts` never reads it.
 * The global ValidationPipe uses `whitelist: true`, so an `is_active`/`status`
 * query key would be stripped silently — it would look accepted and do nothing.
 *
 * The backend already hides everyone else's inactive products; what it lets
 * through is `product.is_active = true OR created_by_user_id = <caller>`, i.e.
 * the caller's OWN deactivated products. Those are what this drops.
 *
 * `includeInactive` keeps them, for screens that manage a product rather than
 * sell it — stock adjustment still applies to a deactivated product, and the
 * app can't reactivate one (deactivation is admin-panel only), so hiding it
 * there would strand its stock.
 *
 * Note `includeInactive` is deliberately NOT part of the query key: it only
 * changes this observer's `select`, not what gets fetched or cached, so two
 * screens with different values still share one cache entry.
 */
export function useProducts(
  search: string,
  ownOnly = false,
  includeInactive = false,
) {
  return useInfiniteQuery({
    queryKey: productKeys.list(search, ownOnly),
    queryFn: ({ pageParam }) =>
      productsApi.list({
        page: pageParam,
        limit: PAGE_SIZE,
        search: search || undefined,
        ...(ownOnly ? { own_products_only: true } : {}),
      }),
    initialPageParam: 1,
    // Runs on the RAW page, so paging still follows the server's meta.
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    select: includeInactive
      ? undefined
      : (res) => ({
          ...res,
          pages: res.pages.map((page) => ({
            ...page,
            data: page.data.filter((product) => product.is_active),
          })),
        }),
  });
}

/**
 * Create a distributor product. If an image was picked, it's uploaded first and
 * its URL is attached to the create payload.
 */
/** Upload picked images one at a time (the endpoint accepts a single file). */
async function uploadAll(images: PickedImage[] | undefined): Promise<string[]> {
  if (!images?.length) return [];
  const urls: string[] = [];
  for (const image of images) {
    urls.push(await productsApi.uploadImage(image));
  }
  return urls;
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      payload: CreateProductPayload;
      images?: PickedImage[];
    }) => {
      // The upload endpoint takes ONE file per call, and the column stores a
      // comma-separated list — so upload sequentially and join.
      const uploaded = await uploadAll(input.images);
      const product_image_url = uploaded.length
        ? joinMediaUrls(uploaded)
        : input.payload.product_image_url;
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
      images?: PickedImage[];
      /** Existing image paths the user kept, in display order. */
      keptUrls?: string[];
    }) => {
      const uploaded = await uploadAll(input.images);
      const combined = [...(input.keptUrls ?? []), ...uploaded];
      // `undefined` leaves the column untouched; '' clears it. Only send a
      // value when the user actually changed the photo set.
      const product_image_url =
        input.images?.length || input.keptUrls
          ? joinMediaUrls(combined)
          : input.payload.product_image_url;
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

/** Flat top-of-list categories (single page) — for the dashboard rail and forms. */
export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: () => productsApi.categories({ limit: 100 }),
    select: (res) => res.data,
  });
}

/** Paginated, searchable category list (infinite scroll) — for the All Categories screen. */
export function useCategoryList(search: string) {
  return useInfiniteQuery({
    queryKey: productKeys.categoryList(search),
    queryFn: ({ pageParam }) =>
      productsApi.categories({
        page: pageParam,
        limit: PAGE_SIZE,
        search: search || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}
