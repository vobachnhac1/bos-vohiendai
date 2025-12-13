import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateStaffContactDto } from './create-staff-contact.dto';

// Khi update, không cho phép thay đổi staffId
export class UpdateStaffContactDto extends PartialType(
  OmitType(CreateStaffContactDto, ['staffId'] as const),
) {}

