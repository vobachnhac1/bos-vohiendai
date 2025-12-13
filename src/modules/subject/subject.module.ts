import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { SubjectLevel } from './entities/subject-level.entity';
import { SubjectService } from './services/subject.service';
import { SubjectLevelService } from './services/subject-level.service';
import { SubjectController } from './controllers/subject.controller';
import { SubjectLevelController } from './controllers/subject-level.controller';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject, SubjectLevel]),
    forwardRef(() => RbacModule),
  ],
  controllers: [SubjectController, SubjectLevelController],
  providers: [SubjectService, SubjectLevelService],
  exports: [SubjectService, SubjectLevelService, TypeOrmModule],
})
export class SubjectModule {}

