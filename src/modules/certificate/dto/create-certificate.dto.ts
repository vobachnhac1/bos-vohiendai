import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({
    example: 'CERT-2024-001',
    description: 'Mã chứng chỉ (unique)',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @ApiProperty({
    example: 'Chứng chỉ An toàn Hàng hải',
    description: 'Tên chứng chỉ',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'Ngày tổ chức sự kiện',
  })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiPropertyOptional({
    example: 'Khóa đào tạo về an toàn hàng hải quốc tế',
    description: 'Nội dung chứng chỉ',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 'Đào tạo',
    description: 'Loại chứng chỉ',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  certificateType?: string;

  @ApiPropertyOptional({
    example: 'Trung cấp',
    description: 'Cấp độ chứng chỉ',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  level?: string;

  @ApiPropertyOptional({
    example: 'Cục Hàng hải Việt Nam',
    description: 'Đơn vị tổ chức',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizer?: string;

  @ApiPropertyOptional({
    example: 'Hà Nội',
    description: 'Địa điểm tổ chức',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    example: 'Email: contact@vinamarine.gov.vn, Phone: 024-3942-3639',
    description: 'Thông tin liên hệ',
  })
  @IsOptional()
  @IsString()
  contactInfo?: string;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Ngày bắt đầu hiệu lực',
  })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({
    example: '2029-12-31',
    description: 'Ngày hết hiệu lực',
  })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/certificates/cert-001.pdf',
    description: 'URL file đính kèm',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  attachmentUrl?: string;

  @ApiPropertyOptional({
    example: 'Ghi chú thêm về chứng chỉ',
    description: 'Ghi chú',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Trạng thái (1: đang dùng, 0: ngưng)',
    minimum: 0,
    maximum: 1,
    default: 1,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean = true;
}

