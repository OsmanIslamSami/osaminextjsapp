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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={
            language === 'ar' ? 'ابحث عن الأخبار...' : 'Search news...'
          }
          className={`w-full py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent focus:outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 transition-all min-h-[48px] ${
            language === 'ar' ? 'pr-12 pl-5' : 'pl-5 pr-12'
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
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium transition-all text-sm focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-h-[48px] whitespace-nowrap"
      >
        {language === 'ar' ? 'بحث' : 'Search'}
      </button>
    </form>
  );
}
