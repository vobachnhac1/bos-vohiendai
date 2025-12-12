import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({ description: 'Role ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Tên role' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả role' })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Role mặc định' })
  @Expose()
  isDefault: boolean;

  @ApiProperty({ description: 'Ngày tạo' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  @Expose()
  updatedAt: Date;
}

