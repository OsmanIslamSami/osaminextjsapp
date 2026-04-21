'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

export default function HomeFAQError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (in production, send to monitoring service)
    logger.error('FAQ Section Error:', error);
  }, [error]);

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Failed to Load FAQ Section
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 mb-6">
            We encountered an error while loading the FAQ section. Please try again.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:scale-105 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </section>
  );
}
