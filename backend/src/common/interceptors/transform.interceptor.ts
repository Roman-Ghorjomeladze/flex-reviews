import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface Response<T> {
  statusCode: number;
  message?: string;
  data: T;
  timestamp: string;
  traceId?: string;
}

/**
 * Interceptor that transforms responses to a consistent format
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const traceId = request.headers['x-trace-id'] as string;

    return next.handle().pipe(
      map((data) => {
        // If data already has statusCode, it's already transformed
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return {
            ...data,
            traceId,
          };
        }

        // If data has a 'status' property, it's a structured API response
        // Don't wrap it further - just add traceId to it
        if (data && typeof data === 'object' && 'status' in data) {
          return {
            ...data,
            traceId,
          };
        }

        // Otherwise, wrap in standard response format
        return {
          statusCode: context.switchToHttp().getResponse().statusCode || 200,
          data,
          timestamp: new Date().toISOString(),
          traceId,
        };
      }),
    );
  }
}

