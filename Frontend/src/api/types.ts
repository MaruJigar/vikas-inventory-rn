/** Shared API response/error shapes. */

/** NestJS GlobalExceptionFilter error envelope. */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  /** Friendly message normalised by the axios interceptor. */
  displayMessage?: string;
}

/** Mirrors the backend PaginatedResponse envelope (data + meta). */
export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/** Common list query params accepted by paginated GET endpoints. */
export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
