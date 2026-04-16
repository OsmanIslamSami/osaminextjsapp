/**
 * API Cache Utilities
 * 
 * Helper functions for setting cache headers on API responses
 * to improve performance and reduce server load.
 */

import { NextResponse } from 'next/server';

interface CacheOptions {
  /**
   * Cache duration in seconds
   * @default 60
   */
  maxAge?: number;
  
  /**
   * Enables stale-while-revalidate caching
   * @default true
   */
  staleWhileRevalidate?: boolean;
  
  /**
   * Stale-while-revalidate duration in seconds
   * @default maxAge
   */
  staleTime?: number;
  
  /**
   * Cache visibility (public or private)
   * @default 'public'
   */
  cacheControl?: 'public' | 'private';
}

/**
 * Add cache headers to NextResponse
 */
export function withCache<T>(
  response: NextResponse<T>,
  options: CacheOptions = {}
): NextResponse<T> {
  const {
    maxAge = 60,
    staleWhileRevalidate = true,
    staleTime = maxAge,
    cacheControl = 'public',
  } = options;

  const cacheDirectives = [
    `${cacheControl}`,
    `max-age=${maxAge}`,
  ];

  if (staleWhileRevalidate) {
    cacheDirectives.push(`stale-while-revalidate=${staleTime}`);
  }

  response.headers.set('Cache-Control', cacheDirectives.join(', '));
  
  return response;
}

/**
 * Preset cache configurations
 */
export const CachePresets = {
  /**
   * No caching - always fetch fresh data
   */
  noCache: (): string => 'no-store, no-cache, must-revalidate',
  
  /**
   * Short cache - 1 minute (frequently changing data)
   */
  short: (): string => 'public, max-age=60, stale-while-revalidate=120',
  
  /**
   * Medium cache - 5 minutes (moderately changing data)
   */
  medium: (): string => 'public, max-age=300, stale-while-revalidate=600',
  
  /**
   * Long cache - 1 hour (rarely changing data)
   */
  long: (): string => 'public, max-age=3600, stale-while-revalidate=7200',
  
  /**
   * Static cache - 1 day (static content, images)
   */
  static: (): string => 'public, max-age=86400, stale-while-revalidate=172800',
  
  /**
   * Immutable cache - 1 year (versioned assets)
   */
  immutable: (): string => 'public, max-age=31536000, immutable',
};

/**
 * Apply cache preset to response
 */
export function applyCachePreset<T>(
  response: NextResponse<T>,
  preset: keyof typeof CachePresets
): NextResponse<T> {
  response.headers.set('Cache-Control', CachePresets[preset]());
  return response;
}

/**
 * Example usage in API routes:
 * 
 * ```typescript
 * import { NextResponse } from 'next/server';
 * import { applyCachePreset } from '@/lib/utils/apiCache';
 * 
 * export async function GET() {
 *   const data = await fetchData();
 *   const response = NextResponse.json({ data });
 *   return applyCachePreset(response, 'medium');
 * }
 * ```
 */
