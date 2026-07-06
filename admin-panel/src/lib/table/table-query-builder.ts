import { ReadonlyURLSearchParams } from 'next/navigation';
import { QueryParams } from '@/types/api/common.types';

/**
 * Builds a new URL query string by merging current URL parameters with updates.
 * Preserves existing parameters not explicitly overwritten.
 * Removes parameters that are set to undefined, null, or empty string.
 */
export function buildTableQueryString(
  currentParams: ReadonlyURLSearchParams | URLSearchParams,
  updates: Partial<QueryParams>
): string {
  const params = new URLSearchParams(currentParams.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });

  return params.toString();
}
