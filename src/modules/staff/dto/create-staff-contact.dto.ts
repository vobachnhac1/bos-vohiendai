import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class CreateStaffContactDto {
  @ApiProperty({
    example: 1,
    description: 'ID của nhân viên',
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  staffId: number;

  @ApiProperty({
    example: 'Nguyễn Thị B',
    description: 'Họ và tên người liên hệ',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({
    example: '0987654321',
    description: 'Số điện thoại',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    example: 'contact@example.com',
    description: 'Email',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    example: 'Vợ/Chồng',
    description: 'Mối quan hệ',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  relationship?: string;

  @ApiPropertyOptional({
    example: '456 Đường XYZ, Quận 2, TP.HCM',
    description: 'Địa chỉ liên hệ',
  })
  @IsOptional()
  @IsString()
  contactAddress?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Liên hệ chính (1: có, 0: không)',
    minimum: 0,
    maximum: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  isPrimary?: boolean = false;

  @ApiPropertyOptional({
    example: 1,
    description: 'Trạng thái (1: đang dùng, 0: không dùng)',
    minimum: 0,
    maximum: 1,
    default: 1,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean = true;

  @ApiPropertyOptional({
    example: 'Ghi chú về người liên hệ',
    description: 'Ghi chú',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

