import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor to ensure all dates in responses are in UTC format
 * Converts Date objects to ISO strings (UTC)
 */
@Injectable()
export class UTCDateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.convertDatesToUTC(data))
    );
  }

  private convertDatesToUTC(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle Date objects
    if (data instanceof Date) {
      return data.toISOString();
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.convertDatesToUTC(item));
    }

    // Handle objects
    if (typeof data === 'object') {
      const converted: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          converted[key] = this.convertDatesToUTC(data[key]);
        }
      }
      return converted;
    }

    // Return primitive values as-is
    return data;
  }
}

