import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';
import { PaginationService } from '../../common/services/pagination.service';
import { RbacModule } from '../rbac/rbac.module';
import { UserRole } from '../rbac';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole]),
    forwardRef(() => RbacModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, PaginationService],
  exports: [UsersService],
})
export class UsersModule {}
