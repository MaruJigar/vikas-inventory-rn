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
