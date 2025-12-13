import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class CreateStaffCertificateDto {
  @ApiProperty({
    example: 1,
    description: 'ID của nhân viên',
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  staffId: number;

  @ApiProperty({
    example: 1,
    description: 'ID của chứng chỉ',
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  certificateId: number;

  @ApiPropertyOptional({
    example: 'Đạt',
    description: 'Trạng thái đạt được (Đạt, Không đạt, Giỏi, Khá,...)',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  achievementStatus?: string;

  @ApiPropertyOptional({
    example: 85.5,
    description: 'Điểm số',
  })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({
    example: 'Giỏi',
    description: 'Xếp loại',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  rank?: string;

  @ApiPropertyOptional({
    example: 'CERT-2024-001-NVA',
    description: 'Số chứng chỉ',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  certificateNo?: string;

  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'Ngày cấp',
  })
  @IsOptional()
  @IsDateString()
  issuedDate?: string;

  @ApiPropertyOptional({
    example: '2029-01-15',
    description: 'Ngày hết hạn',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({
    example: 'Cục Hàng hải Việt Nam',
    description: 'Đơn vị cấp',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  issuedBy?: string;

  @ApiPropertyOptional({
    example: 'Hoàn thành khóa đào tạo với kết quả xuất sắc',
    description: 'Chi tiết',
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/staff-certificates/cert-001.pdf',
    description: 'URL file đính kèm',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  attachmentUrl?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Trạng thái (1: còn hiệu lực, 0: hết hiệu lực)',
    minimum: 0,
    maximum: 1,
    default: 1,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean = true;
}

