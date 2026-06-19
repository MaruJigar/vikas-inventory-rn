import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ApiThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(requestProps: any): Promise<boolean> {
    const { context, throttler } = requestProps;
    const req = context.switchToHttp().getRequest();
    const path = req.path || req.url || '';

    // The 'auth' named throttler is aggressively restricted. We only want it applying
    // to login and refresh endpoints. If this is the auth throttler running on a normal route,
    // we bypass it completely.
    if (throttler.name === 'auth') {
      const isAuthRoute =
        path.includes('/auth/login') || path.includes('/auth/refresh');
      if (!isAuthRoute) {
        return true; // Skip auth limits for non-auth routes
      }
    }

    return super.handleRequest(requestProps);
  }
}
