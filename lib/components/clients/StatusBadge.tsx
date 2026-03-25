import { ClientStatus } from '@/lib/generated/prisma/enums';

interface StatusBadgeProps {
  status: ClientStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === 'Active';
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
      {status}
    </span>
  );
}
