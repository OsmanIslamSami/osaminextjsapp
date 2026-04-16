/**
 * Error Logging Utility
 * 
 * Centralized error logging for the application.
 * In production, send errors to external service (Sentry, LogRocket, etc.)
 */

interface ErrorContext {
  user?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  [key: string]: unknown;
}

export class ErrorLogger {
  /**
   * Log error to console and external service
   */
  static logError(error: Error, context?: ErrorContext): void {
    const timestamp = new Date().toISOString();
    const errorData = {
      timestamp,
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    };

    // Console logging (development)
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error logged:', errorData);
    }

    // TODO: Send to external error tracking service
    // Example integrations:
    // - Sentry: Sentry.captureException(error, { contexts: { custom: context } });
    // - LogRocket: LogRocket.captureException(error, { extra: context });
    // - Datadog: datadogLogs.logger.error(error.message, context);
    
    // For now, log to console in all environments
    console.error(`[${timestamp}]`, error.message, context);
  }

  /**
   * Log warning
   */
  static logWarning(message: string, context?: ErrorContext): void {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ⚠️ Warning:`, message, context);
  }

  /**
   * Log info
   */
  static logInfo(message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    console.info(`[${timestamp}] ℹ️ Info:`, message, context);
  }

  /**
   * Create error context from Next.js request
   */
  static createRequestContext(req: Request): ErrorContext {
    return {
      path: new URL(req.url).pathname,
      method: req.method,
    };
  }
}

export default ErrorLogger;
