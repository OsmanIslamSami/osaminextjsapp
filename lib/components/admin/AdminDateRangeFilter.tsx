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
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(dateFrom, dateTo);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => {
          setDateFrom(e.target.value);
          if (e.target.value && dateTo) {
            onFilter(e.target.value, dateTo);
          }
        }}
        className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
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
        className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
      />
    </form>
  );
}
