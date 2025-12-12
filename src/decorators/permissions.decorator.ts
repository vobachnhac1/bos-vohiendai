import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to require specific permissions for an endpoint
 * @param permissions - Array of permission codes required
 * @example
 * @RequirePermissions('users.view', 'users.edit')
 * async updateUser() { ... }
 */
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata('permissions', permissions);

