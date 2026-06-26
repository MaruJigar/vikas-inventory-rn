import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MetricsAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const token = this.configService.get<string>('metrics.token');

    // If no token is configured in environment, allow public access
    if (!token) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || authHeader !== `Bearer ${token}`) {
      throw new UnauthorizedException('Invalid or missing metrics token');
    }

    return true;
  }
}
