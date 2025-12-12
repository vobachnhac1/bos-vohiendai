import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Tenant } from './entities/tenant.entity';
import { TenantUser } from './entities/tenant-user.entity';
import { TenantSetting } from './entities/tenant-setting.entity';

// Services
import { TenantsService } from './services/tenants.service';
import { TenantUsersService } from './services/tenant-users.service';
import { TenantSettingsService } from './services/tenant-settings.service';

// Controllers
import { TenantsController } from './controllers/tenants.controller';

// Guards
import { TenantAccessGuard } from './guards/tenant-access.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      TenantUser,
      TenantSetting,
    ]),
    forwardRef(() => require('../rbac/rbac.module').RbacModule),
  ],
  controllers: [TenantsController],
  providers: [
    TenantsService,
    TenantUsersService,
    TenantSettingsService,
    TenantAccessGuard,
  ],
  exports: [
    TenantsService,
    TenantUsersService,
    TenantSettingsService,
    TenantAccessGuard,
    TypeOrmModule,
  ],
})
export class TenantsModule {}

