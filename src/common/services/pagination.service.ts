import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';

@Injectable()
export class PaginationService {
  /**
   * Apply pagination to a TypeORM query builder
   * @param queryBuilder - TypeORM query builder
   * @param paginationDto - Pagination parameters
   * @returns Modified query builder with pagination applied
   */
  applyPagination<T>(
    queryBuilder: SelectQueryBuilder<T>,
    paginationDto: PaginationDto,
  ): SelectQueryBuilder<T> {
    const { page = 1, limit = 1000 } = paginationDto;
    const skip = (page - 1) * limit;

    return queryBuilder.skip(skip).take(limit);
  }

  /**
   * Apply sorting to a TypeORM query builder
   * @param queryBuilder - TypeORM query builder
   * @param paginationDto - Pagination parameters with sorting
   * @param defaultSortBy - Default sort field
   * @param allowedSortFields - Array of allowed sort fields
   * @returns Modified query builder with sorting applied
   */
  applySorting<T>(
    queryBuilder: SelectQueryBuilder<T>,
    paginationDto: PaginationDto,
    defaultSortBy: string = 'id',
    allowedSortFields: string[] = [],
  ): SelectQueryBuilder<T> {
    const { sortBy, sortOrder = 'DESC' } = paginationDto;
    
    // Use provided sortBy if it's in allowed fields, otherwise use default
    const sortField = sortBy && allowedSortFields.includes(sortBy) ? sortBy : defaultSortBy;
    
    // Add table alias if not present
    const sortFieldWithAlias = sortField.includes('.') ? sortField : `${queryBuilder.alias}.${sortField}`;
    
    return queryBuilder.orderBy(sortFieldWithAlias, sortOrder);
  }

  /**
   * Execute paginated query and return formatted response
   * @param queryBuilder - TypeORM query builder
   * @param paginationDto - Pagination parameters
   * @returns Paginated response
   */
  async paginate<T>(
    queryBuilder: SelectQueryBuilder<T>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<T>> {
    const { page = 1, limit = 1000 } = paginationDto;

    // Get total count before applying pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const paginatedQuery = this.applyPagination(queryBuilder, paginationDto);
    
    // Execute query
    const data = await paginatedQuery.getMany();

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  /**
   * Execute paginated query with sorting and return formatted response
   * @param queryBuilder - TypeORM query builder
   * @param paginationDto - Pagination parameters
   * @param defaultSortBy - Default sort field
   * @param allowedSortFields - Array of allowed sort fields
   * @returns Paginated response
   */
  async paginateWithSorting<T>(
    queryBuilder: SelectQueryBuilder<T>,
    paginationDto: PaginationDto,
    defaultSortBy: string = 'id',
    allowedSortFields: string[] = [],
  ): Promise<PaginatedResponseDto<T>> {
    const { page = 1, limit = 1000 } = paginationDto;

    // Apply sorting first
    const sortedQuery = this.applySorting(queryBuilder, paginationDto, defaultSortBy, allowedSortFields);

    // Get total count before applying pagination
    const total = await sortedQuery.getCount();

    // Apply pagination
    const paginatedQuery = this.applyPagination(sortedQuery, paginationDto);
    
    // Execute query
    const data = await paginatedQuery.getMany();

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  /**
   * Calculate pagination metadata
   * @param total - Total number of items
   * @param page - Current page
   * @param limit - Items per page
   * @returns Pagination metadata
   */
  calculateMeta(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  /**
   * Validate pagination parameters
   * @param page - Page number
   * @param limit - Items per page
   * @returns Validated pagination parameters
   */
  validatePagination(page?: number, limit?: number) {
    const validatedPage = Math.max(1, page || 1);
    const validatedLimit = Math.min(1000, Math.max(1, limit || 20));

    return {
      page: validatedPage,
      limit: validatedLimit,
    };
  }
}
