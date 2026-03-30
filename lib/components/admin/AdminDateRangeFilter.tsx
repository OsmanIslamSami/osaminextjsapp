'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AdminDateRangeFilterProps {
  initialDateFrom: string;
  initialDateTo: string;
  onFilter: (dateFrom: string, dateTo: string) => void;
}

export default function AdminDateRangeFilter({
  initialDateFrom,
  initialDateTo,
  onFilter,
}: AdminDateRangeFilterProps) {
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const { language, direction } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(dateFrom, dateTo);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full" dir={direction}>
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => {
          setDateFrom(e.target.value);
          if (e.target.value && dateTo) {
            onFilter(e.target.value, dateTo);
          }
        }}
        placeholder={language === 'ar' ? 'من تاريخ' : 'From date'}
        className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 min-w-0 min-h-[44px]"
      />
      <input
        type="date"
        value={dateTo}
        onChange={(e) => {
          setDateTo(e.target.value);
          if (e.target.value && dateFrom) {
            onFilter(dateFrom, e.target.value);
          }
        }}
        placeholder={language === 'ar' ? 'إلى تاريخ' : 'To date'}
        className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 min-w-0 min-h-[44px]"
      />
    </form>
  );
}
