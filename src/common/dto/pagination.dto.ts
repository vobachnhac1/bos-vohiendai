import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({ 
    example: 1, 
    description: 'Page number',
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Items per page',
    minimum: 1,
    maximum: 1000,
    default: 20
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class PaginatedResponseDto<T> {
  @ApiPropertyOptional({ description: 'Data items' })
  data: T[];

  @ApiPropertyOptional({ example: 1000, description: 'Total number of items' })
  total: number;

  @ApiPropertyOptional({ example: 1, description: 'Current page' })
  page: number;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit: number;

  @ApiPropertyOptional({ example: 5, description: 'Total pages' })
  totalPages: number;

  @ApiPropertyOptional({ example: true, description: 'Has next page' })
  hasNext: boolean;

  @ApiPropertyOptional({ example: false, description: 'Has previous page' })
  hasPrev: boolean;

  @ApiPropertyOptional({ example: 20, description: 'Number of items in current page' })
  itemCount: number;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
    this.itemCount = data.length;
  }

  static create<T>(data: T[], total: number, page: number, limit: number): PaginatedResponseDto<T> {
    return new PaginatedResponseDto(data, total, page, limit);
  }
}
