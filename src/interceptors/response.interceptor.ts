import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  statusCode?: number;
}

// Decorator để skip response transformation
export const SKIP_RESPONSE_TRANSFORM = 'skipResponseTransform';
export const SkipResponseTransform = () => SetMetadata(SKIP_RESPONSE_TRANSFORM, true);

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    
    // Check if response transformation should be skipped
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_TRANSFORM,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode || HttpStatus.OK;
        
        // If data is already in the expected format, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
            statusCode,
          };
        }

        // Transform data to standard format
        return {
          success: true,
          data,
          message: this.getSuccessMessage(request.method, request.url, statusCode),
          timestamp: new Date().toISOString(),
          statusCode,
        };
      }),
    );
  }

  private getSuccessMessage(method: string, url: string, statusCode: number): string {
    // Default success messages based on HTTP method and status
    switch (method) {
      case 'POST':
        return statusCode === HttpStatus.CREATED ? 'Resource created successfully' : 'Operation completed successfully';
      case 'PUT':
      case 'PATCH':
        return 'Resource updated successfully';
      case 'DELETE':
        return 'Resource deleted successfully';
      case 'GET':
      default:
        return 'Data retrieved successfully';
    }
  }
}
