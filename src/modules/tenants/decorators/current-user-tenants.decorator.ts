import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to get current user's tenant IDs from request
 * Used in controllers to filter data by user's tenants
 */
export const CurrentUserTenants = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest();
    return request.userTenantIds || [];
  },
);

/**
 * Decorator to get current tenant ID from request
 */
export const CurrentTenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
  },
);

