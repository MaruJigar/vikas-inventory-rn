import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class ApprovalStatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if the route is strictly for approved users
    if (user && user.approvalStatus === 'PENDING_APPROVAL') {
      throw new ForbiddenException('Account pending approval');
    }
    return true;
  }
}
