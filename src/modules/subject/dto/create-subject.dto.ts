import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({
    example: 'KARATE',
    description: 'Mã môn học (unique)',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'Karate',
    description: 'Tên môn học',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'Môn võ thuật Karate truyền thống',
    description: 'Mô tả môn học',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái (true: active, false: inactive)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean = true;
}

