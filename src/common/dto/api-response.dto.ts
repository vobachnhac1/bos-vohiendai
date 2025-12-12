import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ 
    example: true, 
    description: 'Indicates if the request was successfull' 
  })
  success: boolean;

  @ApiPropertyOptional({ 
    description: 'Response data payload' 
  })
  data?: T;

  @ApiPropertyOptional({ 
    example: 'Operation completed successfully', 
    description: 'Success or informational message' 
  })
  message?: string;

  @ApiPropertyOptional({ 
    example: 'Validation failed', 
    description: 'Error message when success is false' 
  })
  error?: string;

  @ApiProperty({ 
    example: '2025-09-17T03:00:00.000Z', 
    description: 'Response timestamp' 
  })
  timestamp: string;

  @ApiProperty({ 
    example: 200, 
    description: 'HTTP status code' 
  })
  statusCode: number;
}

export class ApiSuccessResponseDto<T = any> extends ApiResponseDto<T> {
  @ApiProperty({ example: true })
  declare success: true;

  @ApiProperty()
  declare data: T;

  @ApiProperty({ example: 'Operation completed successfully' })
  declare message: string;
}

export class ApiErrorResponseDto extends ApiResponseDto {
  @ApiProperty({ example: false })
  declare success: false;

  @ApiProperty({ example: null })
  declare data: null;

  @ApiProperty({ example: 'An error occurred' })
  declare error: string;

  @ApiPropertyOptional({ example: 'Bad Request' })
  declare message?: string;

  @ApiProperty({ example: '/api/v1/example' })
  path: string;
}

// Pagination response wrapper
export class PaginatedResponseDto<T = any> {
  @ApiProperty({ description: 'Array of items' })
  items: T[];

  @ApiProperty({ example: 1000, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Whether there is a next page' })
  hasNext: boolean;

  @ApiProperty({ example: false, description: 'Whether there is a previous page' })
  hasPrev: boolean;
}

export class ApiPaginatedResponseDto<T = any> extends ApiSuccessResponseDto<PaginatedResponseDto<T>> {
  @ApiProperty()
  declare data: PaginatedResponseDto<T>;
}
