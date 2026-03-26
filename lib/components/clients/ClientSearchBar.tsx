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
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
