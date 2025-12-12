import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ 
    description: 'Mã quyền (unique)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  code: string;

  @ApiPropertyOptional({ 
    description: 'Mô tả hành động',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

