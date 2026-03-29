'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface DateRangeFilterProps {
  initialDateFrom: string;
  initialDateTo: string;
  onFilter: (dateFrom: string, dateTo: string) => void;
}

export default function DateRangeFilter({
  initialDateFrom,
  initialDateTo,
  onFilter,
}: DateRangeFilterProps) {
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(dateFrom, dateTo);
  };

  const handleClear = () => {
    setDateFrom('');
    setDateTo('');
    onFilter('', '');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 flex gap-2">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
          placeholder={language === 'ar' ? 'من تاريخ' : 'From Date'}
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
          placeholder={language === 'ar' ? 'إلى تاريخ' : 'To Date'}
        />
      </div>
      <button
        type="submit"
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 min-h-[44px]"
      >
        {language === 'ar' ? 'تصفية' : 'Filter'}
      </button>
      {(dateFrom || dateTo) && (
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-3 border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg font-semibold transition-colors min-h-[44px]"
        >
          {language === 'ar' ? 'مسح' : 'Clear'}
        </button>
      )}
    </form>
  );
}
