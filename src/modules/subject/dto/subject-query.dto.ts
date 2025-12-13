import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class SubjectQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'KARATE',
    description: 'Tìm kiếm theo mã môn học (partial match)',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    example: 'Karate',
    description: 'Tìm kiếm theo tên môn học (partial match)',
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

