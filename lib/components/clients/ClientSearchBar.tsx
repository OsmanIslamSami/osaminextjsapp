'use client';

import { useTranslation } from '@/lib/i18n/useTranslation';

// Component for search input in client list
export default function ClientSearchBar({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder={t('clients.searchPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all"
      />
    </div>
  );
}
