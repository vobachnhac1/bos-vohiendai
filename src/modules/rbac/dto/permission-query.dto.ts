import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionQueryDto {
  @ApiPropertyOptional({ 
    description: 'Số trang',
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Số bản ghi mỗi trang',
    default: 1000,
    minimum: 1,
    maximum: 1000
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 1000;

  @ApiPropertyOptional({ 
    description: 'Tìm kiếm theo mã quyền',
  })
  @IsOptional()
  @IsString()
  code?: string;
}

