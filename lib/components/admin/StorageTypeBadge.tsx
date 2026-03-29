'use client';

interface StorageTypeBadgeProps {
  storageType: string;
}

export default function StorageTypeBadge({ storageType }: StorageTypeBadgeProps) {
  const isBlob = storageType === 'blob';

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        isBlob
          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      }`}
    >
      {isBlob ? 'Blob' : 'Local'}
    </span>
  );
}
