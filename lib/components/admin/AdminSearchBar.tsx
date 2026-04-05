'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AdminSearchBarProps {
  initialValue: string;
  onSearch: (keyword: string) => void;
}

export default function AdminSearchBar({ initialValue, onSearch }: AdminSearchBarProps) {
  const [keyword, setKeyword] = useState(initialValue);
  const { language, direction } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={
          language === 'ar' ? 'ابحث في الأخبار...' : 'Search news...'
        }
        className={`flex-1 px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 min-w-0 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all ${
          direction === 'rtl' ? 'text-right' : 'text-left'
        }`}
        dir={direction}
      />
    </form>
  );
}
