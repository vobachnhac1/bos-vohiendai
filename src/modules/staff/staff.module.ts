import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { StaffContact } from './entities/staff-contact.entity';
import { StaffCertificate } from './entities/staff-certificate.entity';
import { Certificate } from '../certificate/entities/certificate.entity';
import { StaffService } from './services/staff.service';
import { StaffCertificateService } from './services/staff-certificate.service';
import { StaffContactService } from './services/staff-contact.service';
import { StaffController } from './controllers/staff.controller';
import { StaffCertificateController } from './controllers/staff-certificate.controller';
import { StaffContactController } from './controllers/staff-contact.controller';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, StaffContact, StaffCertificate, Certificate]),
    forwardRef(() => RbacModule),
  ],
  controllers: [
    StaffController,
    StaffCertificateController,
    StaffContactController,
  ],
  providers: [
    StaffService,
    StaffCertificateService,
    StaffContactService,
  ],
  exports: [
    StaffService,
    StaffCertificateService,
    StaffContactService,
    TypeOrmModule,
  ],
})
export class StaffModule {}

