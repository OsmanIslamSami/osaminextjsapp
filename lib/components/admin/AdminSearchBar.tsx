'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AdminSearchBarProps {
  initialValue: string;
  onSearch: (keyword: string) => void;
}

export default function AdminSearchBar({ initialValue, onSearch }: AdminSearchBarProps) {
  const [keyword, setKeyword] = useState(initialValue);
  const { language } = useLanguage();

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
        className={`flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 min-w-0 min-h-[44px] ${
          language === 'ar' ? 'text-right' : 'text-left'
        }`}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      />
    </form>
  );
}
