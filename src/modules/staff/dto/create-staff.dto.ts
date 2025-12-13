import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEmail,
  IsInt,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { Gender, StaffStatus } from '../entities/staff.entity';

export class CreateStaffDto {
  @ApiProperty({
    example: 1,
    description: 'ID của tenant',
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  tenantId: number;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên nhân viên',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Giới tính (0: Nữ, 1: Nam, 2: Khác)',
    enum: Gender,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: '1990-05-15',
    description: 'Ngày sinh',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: '0912345678',
    description: 'Số điện thoại',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    example: 'nguyenvana@example.com',
    description: 'Email',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    example: '123 Đường ABC, Quận 1, TP.HCM',
    description: 'Địa chỉ',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: '001234567890',
    description: 'Số CMND/CCCD',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  idNumber?: string;

  @ApiPropertyOptional({
    example: 'Thuyền trưởng',
    description: 'Chức vụ',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  position?: string;

  @ApiPropertyOptional({
    example: 'Thuyền viên',
    description: 'Loại nhân viên',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  staffType?: string;

  @ApiPropertyOptional({
    example: '2020-01-01',
    description: 'Ngày vào làm',
  })
  @IsOptional()
  @IsDateString()
  joinDate?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Ngày nghỉ việc',
  })
  @IsOptional()
  @IsDateString()
  leaveDate?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Trạng thái (0: Không hoạt động, 1: Đang hoạt động, 2: Tạm nghỉ)',
    enum: StaffStatus,
    default: StaffStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus = StaffStatus.ACTIVE;

  @ApiPropertyOptional({
    example: 'Ghi chú về nhân viên',
    description: 'Ghi chú',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

