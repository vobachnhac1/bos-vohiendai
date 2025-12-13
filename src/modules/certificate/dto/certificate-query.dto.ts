import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CertificateQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'CERT-2024',
    description: 'Tìm kiếm theo mã chứng chỉ (partial match)',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    example: 'An toàn',
    description: 'Tìm kiếm theo tên chứng chỉ (partial match)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Đào tạo',
    description: 'Lọc theo loại chứng chỉ',
  })
  @IsOptional()
  @IsString()
  certificateType?: string;

  @ApiPropertyOptional({
    example: 'Trung cấp',
    description: 'Lọc theo cấp độ',
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    example: 'Cục Hàng hải Việt Nam',
    description: 'Tìm kiếm theo đơn vị tổ chức (partial match)',
  })
  @IsOptional()
  @IsString()
  organizer?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo trạng thái (1: đang dùng, 0: ngưng)',
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

