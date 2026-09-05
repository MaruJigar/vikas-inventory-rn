import { AxiosError } from 'axios';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred';
    
    switch (status) {
      case 401:
        return new AppError(message, 401, 'UNAUTHORIZED');
      case 403:
        return new AppError(message, 403, 'FORBIDDEN');
      case 400:
        return new AppError(message, 400, 'BAD_REQUEST', axiosError.response?.data?.errors);
      case 404:
        return new AppError(message, 404, 'NOT_FOUND');
      default:
        return new AppError(message, status, 'SERVER_ERROR');
    }
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500, 'INTERNAL_ERROR');
  }

  return new AppError('An unknown error occurred', 500, 'UNKNOWN_ERROR');
};
