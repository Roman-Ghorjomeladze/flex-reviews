import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware that runs FIRST (before interceptors, guards, and route handlers) to:
 * 1. Log the incoming request path
 * 2. Generate/retrieve traceId
 * 3. Store traceId in request object for LoggerService to access
 * 
 * This ensures traceId is available when LoggerService is instantiated (request-scoped).
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, ip } = req;

    // Step 1: Log the path FIRST (before any other processing)
    console.log(`Incoming request: ${method} ${url} from ${ip}`);

    // Step 2: Generate or retrieve traceId
    let traceId = req.headers['x-trace-id'] as string;
    if (!traceId) {
      traceId = uuidv4();
      req.headers['x-trace-id'] = traceId;
    }

    // Step 3: Store traceId in request object
    // LoggerService will read this when it's instantiated (it's request-scoped)
    (req as any).traceId = traceId;

    // Log with traceId to confirm it's been set
    console.log(`[${traceId}] Request initiated: ${method} ${url}`);

    next();
  }
}

