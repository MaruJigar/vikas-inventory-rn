import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { QueryFailedError } from 'typeorm';
import { RequestWithId } from '../middleware/request-id.middleware';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();
    const isProduction =
      this.configService.get('app.env') === 'production';

    const requestId = request.requestId || null;
    const path = request.url;
    const timestamp = new Date().toISOString();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | string[] = 'An unexpected error occurred';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();

      error = exceptionResponse.error || exception.name;
      message = exceptionResponse.message || exception.message;

      // Handle ValidationPipe errors specifically
      if (statusCode === HttpStatus.BAD_REQUEST && Array.isArray(message)) {
        code = 'VALIDATION_ERROR';
      } else {
        // Map common HTTP status codes to standard error codes
        switch (statusCode) {
          case HttpStatus.BAD_REQUEST:
            code = 'BAD_REQUEST';
            break;
          case HttpStatus.UNAUTHORIZED:
            code = 'UNAUTHORIZED';
            break;
          case HttpStatus.FORBIDDEN:
            code = 'FORBIDDEN';
            break;
          case HttpStatus.NOT_FOUND:
            code = 'NOT_FOUND';
            break;
          case HttpStatus.CONFLICT:
            code = 'CONFLICT';
            break;
          case HttpStatus.TOO_MANY_REQUESTS:
            code = 'RATE_LIMIT';
            break;
          default:
            code = 'HTTP_ERROR';
        }
      }
    } else if (exception instanceof QueryFailedError) {
      // TypeORM QueryFailedError handling
      const driverError = (exception as any).driverError;
      const dbErrorCode = driverError?.code;

      if (dbErrorCode === '23505') {
        statusCode = HttpStatus.CONFLICT;
        error = 'Conflict';
        message = 'A resource with these unique properties already exists';
        code = 'CONFLICT';
      } else if (dbErrorCode === '23503') {
        statusCode = HttpStatus.BAD_REQUEST;
        error = 'Bad Request';
        message = 'Referenced record does not exist';
        code = 'BAD_REQUEST';
      } else if (dbErrorCode && dbErrorCode.startsWith('08')) {
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        error = 'Internal Server Error';
        message = 'Database connection failure';
        code = 'DATABASE_ERROR';
      } else {
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        error = 'Internal Server Error';
        message = 'Database operation failed';
        code = 'DATABASE_ERROR';
      }

      // Add dev info for unhandled DB errors
      if (!isProduction) {
        message = driverError?.detail || exception.message;
      }
    } else {
      // Unknown errors
      if (!isProduction) {
        message = exception.message || 'Unknown error';
      }
    }

    if (statusCode >= 500) {
      this.logger.error(`[${requestId}] ${path} - ${message}`, exception.stack);
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      error,
      message,
      code,
      requestId,
      timestamp,
      path,
    });
  }
}
