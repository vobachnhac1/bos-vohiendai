import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class SubjectLevelQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo subject ID',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  subjectId?: number;

  @ApiPropertyOptional({
    example: 'GREEN',
    description: 'Tìm kiếm theo mã cấp độ (partial match)',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    example: 'Xanh',
    description: 'Tìm kiếm theo tên cấp độ (partial match)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Lọc theo trạng thái (true: active, false: inactive)',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  status?: boolean;
}

