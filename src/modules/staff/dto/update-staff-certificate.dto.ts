import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateStaffCertificateDto } from './create-staff-certificate.dto';

// Khi update, không cho phép thay đổi staffId và certificateId
export class UpdateStaffCertificateDto extends PartialType(
  OmitType(CreateStaffCertificateDto, ['staffId', 'certificateId'] as const),
) {}

