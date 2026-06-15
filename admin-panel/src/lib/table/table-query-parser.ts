import { ReadonlyURLSearchParams } from 'next/navigation';
import { QueryParams } from '@/types/api/common.types';

/**
 * Parses URL search parameters into a strongly-typed QueryParams object
 * suitable for backend service consumption.
 */
export function parseTableQueryParams(searchParams: ReadonlyURLSearchParams | URLSearchParams): QueryParams {
  const params: QueryParams = {};

  const page = searchParams.get('page');
  if (page) {
    const parsedPage = parseInt(page, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      params.page = parsedPage;
    }
  }

  const limit = searchParams.get('limit');
  if (limit) {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      params.limit = parsedLimit;
    }
  }

  const search = searchParams.get('search');
  if (search) {
    params.search = search;
  }

  const sortBy = searchParams.get('sortBy');
  if (sortBy) {
    params.sortBy = sortBy;
  }

  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder === 'asc' || sortOrder === 'desc') {
    params.sortOrder = sortOrder;
  }

  // Handle any additional filter parameters
  // For now, we extract all other parameters as generic string parameters.
  // Module-specific implementations might need to refine these (e.g., parsing booleans or arrays).
  searchParams.forEach((value, key) => {
    if (!['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key)) {
      params[key] = value;
    }
  });

  return params;
}
