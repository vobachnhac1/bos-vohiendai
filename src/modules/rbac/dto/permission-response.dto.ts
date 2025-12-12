import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({ description: 'Permission ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Mã quyền' })
  @Expose()
  code: string;

  @ApiPropertyOptional({ description: 'Mô tả quyền' })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Ngày tạo' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  @Expose()
  updatedAt: Date;
}

