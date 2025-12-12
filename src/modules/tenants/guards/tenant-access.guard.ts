import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantUsersService } from '../services/tenant-users.service';

export const SKIP_TENANT_CHECK_KEY = 'skipTenantCheck';

/**
 * Guard to check if user has access to tenant resources
 * Validates that user belongs to the tenant
 */
@Injectable()
export class TenantAccessGuard implements CanActivate {
  private readonly logger = new Logger(TenantAccessGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly tenantUsersService: TenantUsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if tenant check should be skipped
    const skipTenantCheck = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_CHECK_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipTenantCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get tenant ID from request (can be from params, query, or body)
    const tenantId = request.params.tenantId || request.query.tenantId || request.body?.tenantId;

    if (!tenantId) {
      // If no tenant ID specified, allow (will be filtered in service layer)
      return true;
    }

    // Check if user has access to this tenant
    const hasAccess = await this.tenantUsersService.hasAccess(user.id, tenantId);

    if (!hasAccess) {
      this.logger.warn(`User ${user.id} attempted to access tenant ${tenantId} without permission`);
      throw new ForbiddenException('You do not have access to this tenant');
    }

    // Attach tenant ID to request for use in controllers/services
    request.tenantId = tenantId;

    return true;
  }
}

