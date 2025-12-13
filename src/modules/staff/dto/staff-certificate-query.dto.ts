import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class StaffCertificateQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo staff ID',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  staffId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo certificate ID',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  certificateId?: number;

  @ApiPropertyOptional({
    example: 'Đạt',
    description: 'Lọc theo trạng thái đạt được',
  })
  @IsOptional()
  @IsString()
  achievementStatus?: string;

  @ApiPropertyOptional({
    example: 'Giỏi',
    description: 'Lọc theo xếp loại',
  })
  @IsOptional()
  @IsString()
  rank?: string;

  @ApiPropertyOptional({
    example: 'Cục Hàng hải Việt Nam',
    description: 'Tìm kiếm theo đơn vị cấp (partial match)',
  })
  @IsOptional()
  @IsString()
  issuedBy?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo trạng thái (1: còn hiệu lực, 0: hết hiệu lực)',
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number;
}

