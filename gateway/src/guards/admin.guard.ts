import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        if (request.payload?.payload?.role !== 'admin') {
            throw new ForbiddenException('Admin access required');
        }
        return true;
    }
}
