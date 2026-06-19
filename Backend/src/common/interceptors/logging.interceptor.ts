import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { RequestWithId } from '../middleware/request-id.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<RequestWithId>();
    const res = ctx.getResponse();

    const { method, originalUrl, requestId } = req;
    const user = req.user as any;
    const startTime = Date.now();

    const getLogPayload = (statusCode: number) => {
      const payload: any = {
        requestId,
        method,
        path: originalUrl,
        statusCode,
        responseTimeMs: Date.now() - startTime,
      };

      if (user) {
        payload.userId = user.userId || user.sub;
        payload.role = user.role;
        if (user.distributorId) payload.distributorId = user.distributorId;
        if (user.manufacturerId) payload.manufacturerId = user.manufacturerId;
      }

      return payload;
    };

    return next.handle().pipe(
      tap(() => {
        const statusCode = res.statusCode;
        const payload = getLogPayload(statusCode);
        this.logger.log(JSON.stringify(payload));
      }),
      catchError((error) => {
        const statusCode =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const payload = getLogPayload(statusCode);
        payload.errorName = error.name;

        if (statusCode >= 500) {
          this.logger.error(JSON.stringify(payload), error.stack);
        } else {
          this.logger.warn(JSON.stringify(payload));
        }

        return throwError(() => error);
      }),
    );
  }
}
