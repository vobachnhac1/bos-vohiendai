import { SetMetadata } from '@nestjs/common';
import { SKIP_TENANT_CHECK_KEY } from '../guards/tenant-access.guard';

/**
 * Decorator to skip tenant access check for an endpoint
 */
export const SkipTenantCheck = () => SetMetadata(SKIP_TENANT_CHECK_KEY, true);

