'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SearchBarProps {
  initialValue: string;
  onSearch: (keyword: string) => void;
}

export default function SearchBar({ initialValue, onSearch }: SearchBarProps) {
  const [keyword, setKeyword] = useState(initialValue);
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={
            language === 'ar' ? 'ابحث عن الأخبار...' : 'Search news...'
          }
          className={`w-full py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 ${
            language === 'ar' ? 'pr-12 pl-4' : 'pl-4 pr-12'
          }`}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />
        <svg
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${
            language === 'ar' ? 'left-3' : 'right-3'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <button
        type="submit"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
      >
        {language === 'ar' ? 'بحث' : 'Search'}
      </button>
    </form>
  );
}
