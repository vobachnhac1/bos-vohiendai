import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  statusCode?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

export class ResponseUtil {
  /**
   * Create a successful response
   */
  static success<T>(
    data: T,
    message?: string,
    statusCode: number = HttpStatus.OK,
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      message: message || this.getDefaultSuccessMessage(statusCode),
      timestamp: new Date().toISOString(),
      statusCode,
    };
  }

  /**
   * Create an error response
   */
  static error(
    error: string,
    message?: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ): ApiResponse<null> {
    return {
      success: false,
      data: null,
      message: message || error,
      error,
      timestamp: new Date().toISOString(),
      statusCode,
    };
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message?: string,
  ): ApiResponse<PaginatedData<T>> {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const paginatedData: PaginatedData<T> = {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
    };

    return this.success(
      paginatedData,
      message || `Retrieved ${items.length} of ${total} items`,
    );
  }

  /**
   * Create a created response (201)
   */
  static created<T>(data: T, message?: string): ApiResponse<T> {
    return this.success(data, message || 'Resource created successfully', HttpStatus.CREATED);
  }

  /**
   * Create an updated response (200)
   */
  static updated<T>(data: T, message?: string): ApiResponse<T> {
    return this.success(data, message || 'Resource updated successfully');
  }

  /**
   * Create a deleted response (200)
   */
  static deleted(message?: string): ApiResponse<null> {
    return this.success(null, message || 'Resource deleted successfully');
  }

  /**
   * Create a not found error response (404)
   */
  static notFound(resource?: string): ApiResponse<null> {
    const message = resource ? `${resource} not found` : 'Resource not found';
    return this.error('Not Found', message, HttpStatus.NOT_FOUND);
  }

  /**
   * Create a validation error response (400)
   */
  static validationError(errors: string | string[]): ApiResponse<null> {
    const errorMessage = Array.isArray(errors) ? errors.join(', ') : errors;
    return this.error(errorMessage, 'Validation failed', HttpStatus.BAD_REQUEST);
  }

  /**
   * Create an unauthorized error response (401)
   */
  static unauthorized(message?: string): ApiResponse<null> {
    return this.error(
      'Unauthorized',
      message || 'Authentication required',
      HttpStatus.UNAUTHORIZED,
    );
  }

  /**
   * Create a forbidden error response (403)
   */
  static forbidden(message?: string): ApiResponse<null> {
    return this.error(
      'Forbidden',
      message || 'Access denied',
      HttpStatus.FORBIDDEN,
    );
  }

  /**
   * Create a conflict error response (409)
   */
  static conflict(message?: string): ApiResponse<null> {
    return this.error(
      'Conflict',
      message || 'Resource already exists',
      HttpStatus.CONFLICT,
    );
  }

  /**
   * Create an internal server error response (500)
   */
  static internalError(message?: string): ApiResponse<null> {
    return this.error(
      'Internal Server Error',
      message || 'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Get default success message based on status code
   */
  private static getDefaultSuccessMessage(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.CREATED:
        return 'Resource created successfully';
      case HttpStatus.NO_CONTENT:
        return 'Operation completed successfully';
      case HttpStatus.OK:
      default:
        return 'Operation completed successfully';
    }
  }
}
