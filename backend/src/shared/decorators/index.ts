import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload, AuthenticatedRequest } from '@shared/types';

/**
 * Decorator to set required roles for an endpoint
 * @example @Roles('ADMIN', 'VETERINARY')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * Decorator to inject the current authenticated user
 * @example @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
