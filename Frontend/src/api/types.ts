/** Shared API response/error shapes. */

/** NestJS GlobalExceptionFilter error envelope. */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  /** Friendly message normalised by the axios interceptor. */
  displayMessage?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
