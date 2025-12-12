import { IsOptional, IsString, IsBoolean, IsIn, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class UserQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'john', description: 'Filter by username (partial match)' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'Filter by email (partial match)' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Filter by full name (partial match)' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ 
    example: 'admin', 
    description: 'Filter by user role',
    enum: ['admin', 'ops', 'viewer', 'analyst']
  })
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'ops', 'viewer', 'analyst'])
  role?: string;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Filter by active status' 
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ 
    example: '2023-12-01T00:00:00Z',
    description: 'Filter users created after this date'
  })
  @IsOptional()
  @IsString()
  createdAfter?: string;

  @ApiPropertyOptional({ 
    example: '2023-12-31T23:59:59Z',
    description: 'Filter users created before this date'
  })
  @IsOptional()
  @IsString()
  createdBefore?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter users who have logged in recently (last 30 days)'
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasRecentLogin?: boolean;

  @ApiPropertyOptional({
    description: 'Lọc theo tenant IDs (có thể truyền nhiều giá trị, ví dụ: tenantIds=1&tenantIds=2 hoặc tenantIds=1,2)',
    type: [String],
    isArray: true,
    example: ['1', '2']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // Xử lý cả trường hợp array và string phân tách bằng dấu phẩy
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return value.split(',').map(id => id.trim());
    }
    return value;
  })
  tenantIds?: string[];
}
