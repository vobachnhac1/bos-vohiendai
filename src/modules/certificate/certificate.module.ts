import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { CertificatesService } from './services/certificates.service';
import { CertificatesController } from './controllers/certificates.controller';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificate]),
    forwardRef(() => RbacModule),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService, TypeOrmModule],
})
export class CertificateModule {}

