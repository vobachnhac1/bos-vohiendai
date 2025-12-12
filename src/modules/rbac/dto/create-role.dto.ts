import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ 
    description: 'Tên role (unique)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Mô tả chi tiết vai trò',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Role mặc định khi tạo user mới',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

