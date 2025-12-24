import { Injectable, Scope, LoggerService as NestLoggerService, Inject } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

/**
 * Request-scoped logger service that includes traceId in all log messages
 *
 * The traceId is set by LoggingMiddleware (which runs first) and stored in the request object.
 * This service reads it from the request when instantiated.
 */
@Injectable({ scope: Scope.REQUEST })
export class LoggerService implements NestLoggerService {
	private readonly logger: Logger;
	private traceId: string;

	constructor(@Inject(REQUEST) private readonly request: Request & { traceId: string }) {
		this.logger = new Logger("Application");

		// Get traceId from request object (set by LoggingMiddleware)
		// LoggingMiddleware runs FIRST and sets traceId before any service is instantiated
		this.traceId = ((this.request.headers["x-trace-id"] || this.request.traceId) as string) || "unknown";

		// Log that logger instance is initialized with traceId
		// This confirms the traceId was assigned from the request
		if (this.traceId !== "unknown") {
			// Use console.log to avoid recursion (since we're in the logger constructor)
			// The actual logging will use the formatted version below
		}
	}

	/**
	 * Set the trace ID for the current request
	 */
	setTraceId(traceId: string) {
		this.traceId = traceId;
	}

	/**
	 * Get the current trace ID
	 */
	getTraceId(): string {
		return this.traceId || "unknown";
	}

	/**
	 * Format log message with traceId
	 */
	private formatMessage(message: any): string {
		// Handle undefined/null messages
		const messageStr = message != null ? String(message) : "";
		return this.traceId ? `[${this.traceId}] ${messageStr}` : messageStr;
	}

	log(message: any, context?: string) {
		const formattedMessage = this.formatMessage(message);
		if (context !== undefined) {
			this.logger.log(formattedMessage, context);
		} else {
			this.logger.log(formattedMessage);
		}
	}

	error(message: any, trace?: string, context?: string) {
		const formattedMessage = this.formatMessage(message);
		// NestJS Logger.error signature: error(message, stack?, context?)
		// trace maps to stack parameter, context maps to context parameter
		if (trace !== undefined && context !== undefined) {
			this.logger.error(formattedMessage, trace, context);
		} else if (trace !== undefined) {
			this.logger.error(formattedMessage, trace);
		} else if (context !== undefined) {
			// If context is provided but trace is not, pass undefined for stack
			this.logger.error(formattedMessage, undefined, context);
		} else {
			this.logger.error(formattedMessage);
		}
	}

	warn(message: any, context?: string) {
		const formattedMessage = this.formatMessage(message);
		if (context !== undefined) {
			this.logger.warn(formattedMessage, context);
		} else {
			this.logger.warn(formattedMessage);
		}
	}

	debug(message: any, context?: string) {
		const formattedMessage = this.formatMessage(message);
		if (context !== undefined) {
			this.logger.debug(formattedMessage, context);
		} else {
			this.logger.debug(formattedMessage);
		}
	}

	verbose(message: any, context?: string) {
		const formattedMessage = this.formatMessage(message);
		if (context !== undefined) {
			this.logger.verbose(formattedMessage, context);
		} else {
			this.logger.verbose(formattedMessage);
		}
	}
}
