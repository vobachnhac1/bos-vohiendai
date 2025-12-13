import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateSubjectLevelDto {
  @ApiProperty({
    example: 1,
    description: 'ID của môn học',
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  subjectId: number;

  @ApiProperty({
    example: 'GREEN',
    description: 'Mã cấp độ (unique trong môn học)',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'Đai Xanh Lá',
    description: 'Tên cấp độ',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: '#00FF00',
    description: 'Màu đai (hex color)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiProperty({
    example: 1,
    description: 'Thứ tự cấp độ (1: thấp nhất, tăng dần)',
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  orderIndex: number;

  @ApiPropertyOptional({
    example: 6,
    description: 'Số tháng tập luyện tối thiểu',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minTrainingMonths?: number;

  @ApiPropertyOptional({
    example: 'Cấp độ cơ bản cho người mới bắt đầu',
    description: 'Mô tả cấp độ',
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

