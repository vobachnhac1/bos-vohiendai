import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class StaffContactQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo staff ID',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  staffId?: number;

  @ApiPropertyOptional({
    example: 'Nguyễn',
    description: 'Tìm kiếm theo tên (partial match)',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    example: '0987654321',
    description: 'Tìm kiếm theo số điện thoại (partial match)',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Vợ/Chồng',
    description: 'Lọc theo mối quan hệ',
  })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo liên hệ chính (1: có, 0: không)',
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @Max(1)
  isPrimary?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo trạng thái (1: đang dùng, 0: không dùng)',
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number;
}

