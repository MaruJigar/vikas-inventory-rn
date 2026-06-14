import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, user, ip } = request;

    return next.handle().pipe(
      tap(() => {
        if (method !== 'GET') {
          // Log only mutations
          this.auditLogService.logAction(
            `${method} ${originalUrl}`,
            'API_CALL',
            null,
            user?.userId || null,
            { ip, role: user?.role }
          );
        }
      }),
    );
  }
}
