/**
 * LoadingSpinner Component
 * 
 * Reusable SVG loading spinner used across the application.
 * Provides consistent loading UI with theme support.
 * 
 * @example
 * ```tsx
 * // Full page loading
 * <LoadingSpinner size="lg" className="min-h-screen" />
 * 
 * // Inline loading
 * <LoadingSpinner size="sm" />
 * 
 * // With custom message
 * <LoadingSpinner message="Loading data..." />
 * ```
 */

interface LoadingSpinnerProps {
  /** Size of the spinner (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Optional message to display below spinner */
  message?: string;
  /** Additional CSS classes for the container */
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  message, 
  className = '' 
}: LoadingSpinnerProps) {
  // Size mapping for spinner dimensions
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  // Text size mapping
  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {/* SVG Spinner */}
      <svg
        className={`${sizeMap[size]} animate-spin text-gray-600 dark:text-zinc-400`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
        role="status"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>

      {/* Optional message */}
      {message && (
        <p className={`${textSizeMap[size]} text-gray-600 dark:text-zinc-400 font-medium`}>
          {message}
        </p>
      )}
    </div>
  );
}
