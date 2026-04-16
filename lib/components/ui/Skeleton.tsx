/**
 * Skeleton Loading Component
 * Reusable skeleton loader with shimmer effect
 * Supports dark mode and various variants
 */

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export default function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  count = 1,
}: SkeletonProps) {
  const baseStyles = 'skeleton animate-shimmer';
  
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-lg h-48',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  const skeletonElements = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  ));

  return count > 1 ? <div className="space-y-3">{skeletonElements}</div> : skeletonElements[0];
}

// Pre-built skeleton patterns
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4 space-y-3 ${className}`}>
      <Skeleton variant="rectangular" height={200} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-zinc-800 p-4 border-b border-gray-200 dark:border-zinc-700">
        <div className="flex gap-4">
          <Skeleton width="20%" height={20} />
          <Skeleton width="30%" height={20} />
          <Skeleton width="25%" height={20} />
          <Skeleton width="15%" height={20} />
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-zinc-800">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="p-4">
            <div className="flex gap-4 items-center">
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton width="20%" height={16} />
              <Skeleton width="30%" height={16} />
              <Skeleton width="25%" height={16} />
              <Skeleton width="15%" height={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ columns = 3, rows = 2 }: { columns?: number; rows?: number }) {
  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {Array.from({ length: columns * rows }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
