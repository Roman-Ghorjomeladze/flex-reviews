import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = request.headers['x-trace-id'] as string;

    let status: number;
    let message: string;
    let code: string | undefined;
    let details: any;

    if (exception instanceof BusinessException) {
      // Handle custom business exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      message = exceptionResponse.message || exception.message;
      code = exceptionResponse.code;
      details = exceptionResponse.details;

      this.logger.warn(
        `BusinessException: ${message} | TraceId: ${traceId} | Path: ${request.url}`,
      );
    } else if (exception instanceof HttpException) {
      // Handle standard NestJS HTTP exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        code = responseObj.code;
        details = responseObj.details;
      } else {
        message = exception.message;
      }

      this.logger.warn(
        `HttpException: ${message} | TraceId: ${traceId} | Path: ${request.url}`,
      );
    } else {
      // Handle unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      code = 'INTERNAL_SERVER_ERROR';

      // Log full error details in development, minimal in production
      const errorMessage =
        exception instanceof Error ? exception.message : 'Unknown error';
      const errorStack =
        exception instanceof Error ? exception.stack : undefined;

      this.logger.error(
        `Unexpected error: ${errorMessage} | TraceId: ${traceId} | Path: ${request.url}`,
        errorStack,
      );

      // Include stack trace only in development
      if (process.env.NODE_ENV === 'development') {
        details = {
          error: errorMessage,
          stack: errorStack,
        };
      }
    }

    const errorResponse = {
      statusCode: status,
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      traceId,
    };

    // Remove undefined fields
    Object.keys(errorResponse).forEach(
      (key) =>
        errorResponse[key] === undefined && delete errorResponse[key],
    );

    response.status(status).json(errorResponse);
  }
}

