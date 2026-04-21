/**
 * Standardized Error Handling Utility
 * 
 * Provides consistent error handling patterns across the application.
 * Extracts error messages safely and provides structured error responses.
 * 
 * Usage:
 * import { handleApiError, extractErrorMessage } from '@/lib/utils/error-handler';
 * 
 * // In API routes:
 * try {
 *   // ... your code
 * } catch (error) {
 *   return handleApiError(error, 'Failed to process request');
 * }
 * 
 * // In components:
 * const message = extractErrorMessage(error);
 * showError(message);
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Extracts a user-friendly error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Standardized API error handler that returns consistent NextResponse format
 * @param error - The caught error
 * @param defaultMessage - Fallback message if error message is not extractable
 * @param statusCode - HTTP status code (default: 500)
 * @returns NextResponse with error message
 */
export function handleApiError(
  error: unknown,
  defaultMessage: string = 'Internal server error',
  statusCode: number = 500
): NextResponse {
  const message = extractErrorMessage(error);
  
  // Log the full error for debugging
  logger.error(`[API Error] ${defaultMessage}:`, error);
  
  return NextResponse.json(
    { error: message || defaultMessage },
    { status: statusCode }
  );
}

/**
 * Handles Prisma-specific errors with better user messages
 */
export function handlePrismaError(error: unknown): NextResponse {
  const message = extractErrorMessage(error);
  
  // Check for common Prisma errors
  if (message.includes('Unique constraint failed')) {
    return NextResponse.json(
      { error: 'A record with this information already exists' },
      { status: 409 } // Conflict
    );
  }
  
  if (message.includes('Foreign key constraint failed')) {
    return NextResponse.json(
      { error: 'Cannot complete operation due to related records' },
      { status: 400 }
    );
  }
  
  if (message.includes('Record to update not found')) {
    return NextResponse.json(
      { error: 'Record not found' },
      { status: 404 }
    );
  }
  
  // Generic database error
  logger.error('[Prisma Error]:', error);
  return NextResponse.json(
    { error: 'Database operation failed' },
    { status: 500 }
  );
}

/**
 * Validation error handler
 */
export function handleValidationError(message: string): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 400 } // Bad Request
  );
}

/**
 * Authentication error handler
 */
export function handleAuthError(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Permission/Authorization error handler
 */
export function handlePermissionError(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Not found error handler
 */
export function handleNotFoundError(message: string = 'Resource not found'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 404 }
  );
}

/**
 * Type guard for Error objects
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely execute async operations with error handling
 * @param operation - Async operation to execute
 * @param errorMessage - Error message context
 * @returns Result or throws standardized error
 */
export async function tryCatch<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error(`${errorMessage}:`, error);
    throw error;
  }
}
