import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonsService } from './services/commons.service';
import { CommonsLookupService } from './services/commons-lookup.service';
import { CommonsController } from './controllers/commons.controller';
import { Common } from './entities/common.entity';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Common]),
    forwardRef(() => RbacModule),
  ],
  controllers: [CommonsController],
  providers: [CommonsService, CommonsLookupService],
  exports: [CommonsService, CommonsLookupService],
})
export class CommonsModule {}
