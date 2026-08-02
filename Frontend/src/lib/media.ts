import { API_BASE_URL } from '@/api/client';

/**
 * Backend stores image paths relative to the server root (e.g.
 * `/uploads/products/x.jpg`), served at the origin — NOT under the `/v1` API
 * prefix. Turn a stored path into an absolute URL the <Image> can load.
 */
const ORIGIN = API_BASE_URL.replace(/\/v\d+\/?$/, '').replace(/\/+$/, '');

export function resolveMediaUrl(
  url: string | null | undefined,
): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url; // already absolute
  return `${ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * `products.product_image_url` is a single column holding a COMMA-SEPARATED
 * list of paths when a product has several photos, e.g.
 * `/uploads/products/a.png,/uploads/products/b.png`. Passing the raw column to
 * `resolveMediaUrl` yields one nonsense URL that never loads, so always split
 * it first.
 */
export function resolveMediaUrls(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => resolveMediaUrl(part))
    .filter((u): u is string => !!u);
}

/**
 * The RAW stored paths of a multi-image field, unresolved — use when the value
 * is going back to the backend rather than into an `<Image>`.
 */
export function splitMediaPaths(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/** First image of a possibly multi-image field — for thumbnails. */
export function resolveFirstMediaUrl(
  value: string | null | undefined,
): string | undefined {
  return resolveMediaUrls(value)[0];
}

/** Join picked/kept image paths back into the column's comma-separated form. */
export function joinMediaUrls(urls: string[]): string {
  return urls.filter(Boolean).join(',');
}
