'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';

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
  const { t, direction } = useTranslation();

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {/* Date inputs and buttons - responsive layout */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Date inputs */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:flex-1">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full flex-1 px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent focus:outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 transition-all min-h-[48px]"
            placeholder={t('news.fromDate')}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full flex-1 px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent focus:outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 transition-all min-h-[48px]"
            placeholder={t('news.toDate')}
          />
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 sm:w-auto">
          <button
            type="submit"
            className="flex-1 sm:flex-initial px-6 py-3 text-white rounded-full font-medium transition-all focus:ring-2 focus:ring-offset-2 min-h-[48px] text-sm whitespace-nowrap"
            style={{ backgroundColor: 'var(--color-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }}
          >
            {t('news.filter')}
          </button>
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 sm:flex-initial px-6 py-3 border-2 border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 rounded-full font-medium transition-all min-h-[48px] bg-transparent text-sm whitespace-nowrap"
            >
              {t('news.clear')}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
