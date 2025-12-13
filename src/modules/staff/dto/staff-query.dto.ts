import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Gender, StaffStatus } from '../entities/staff.entity';

export class StaffQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo tenant ID',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  tenantId?: number;

  @ApiPropertyOptional({
    example: 'Nguyễn',
    description: 'Tìm kiếm theo tên (partial match)',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    example: '0912345678',
    description: 'Tìm kiếm theo số điện thoại (partial match)',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'nguyenvana@example.com',
    description: 'Tìm kiếm theo email (partial match)',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: '001234567890',
    description: 'Tìm kiếm theo số CMND/CCCD',
  })
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiPropertyOptional({
    example: 'Thuyền trưởng',
    description: 'Lọc theo chức vụ',
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({
    example: 'Thuyền viên',
    description: 'Lọc theo loại nhân viên',
  })
  @IsOptional()
  @IsString()
  staffType?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo giới tính (0: Nữ, 1: Nam, 2: Khác)',
    enum: Gender,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo trạng thái (0: Không hoạt động, 1: Đang hoạt động, 2: Tạm nghỉ)',
    enum: StaffStatus,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(StaffStatus)
  status?: StaffStatus;
}

