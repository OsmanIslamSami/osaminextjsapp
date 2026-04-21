/**
 * Application Logger Utility
 * 
 * Provides conditional logging that only outputs in development mode.
 * Prevents console statements from appearing in production builds.
 * 
 * Usage:
 * import { logger } from '@/lib/utils/logger';
 * 
 * logger.log('This only appears in development');
 * logger.error('Errors are shown in all environments');
 * logger.debug('[Component] Debugging info:', data);
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Standard log - only shown in development
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Debug information - only shown in development
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Warning messages - only shown in development
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Error messages - shown in all environments
   * Use sparingly and ensure no sensitive data is logged
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Info messages - only shown in development
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};
