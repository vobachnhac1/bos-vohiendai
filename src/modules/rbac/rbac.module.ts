import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';

// Services
import { RolesService } from './services/roles.service';
import { PermissionsService } from './services/permissions.service';
import { RolePermissionsService } from './services/role-permissions.service';
import { UserRolesService } from './services/user-roles.service';

// Controllers
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { RolePermissionsController } from './controllers/role-permissions.controller';
import { UserRolesController } from './controllers/user-roles.controller';

// Import UsersModule to validate user existence
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RolePermission,
      UserRole,
    ]),
    forwardRef(() => UsersModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [
    RolesController,
    PermissionsController,
    RolePermissionsController,
    UserRolesController,
  ],
  providers: [
    RolesService,
    PermissionsService,
    RolePermissionsService,
    UserRolesService,
  ],
  exports: [
    RolesService,
    PermissionsService,
    RolePermissionsService,
    UserRolesService,
  ],
})
export class RbacModule {}

