import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Scope } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request } from "express";

/**
 * Interceptor that logs request/response with timing
 * Note: LoggingMiddleware runs first and sets up traceId
 * This interceptor handles response logging and timing
 */
@Injectable({ scope: Scope.REQUEST })
export class LoggingInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest<Request>();
		const { method, url } = request;

		// Get traceId from request (set by LoggingMiddleware)
		const traceId =
			((request.headers["x-trace-id"] || (request as Request & { traceId: string }).traceId) as string) ||
			"unknown";

		const now = Date.now();

		return next.handle().pipe(
			tap({
				next: (data) => {
					const response = context.switchToHttp().getResponse();
					const { statusCode } = response;
					const responseTime = Date.now() - now;

					// Log successful response with timing
					console.log(`[${traceId}] ${method} ${url} ${statusCode} - ${responseTime}ms`);
				},
				error: (error) => {
					const responseTime = Date.now() - now;
					console.error(`[${traceId}] ${method} ${url} - Error after ${responseTime}ms: ${error.message}`);
				},
			})
		);
	}
}
