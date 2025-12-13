import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSubjectLevelDto } from './create-subject-level.dto';

// Khi update, không cho phép thay đổi subjectId
export class UpdateSubjectLevelDto extends PartialType(
  OmitType(CreateSubjectLevelDto, ['subjectId'] as const),
) {}

