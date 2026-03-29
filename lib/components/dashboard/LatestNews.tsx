'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  published_date: string;
  is_visible: boolean;
  storage_type: string;
}

interface LatestNewsProps {
  news: NewsItem[];
}

export default function LatestNews({ news }: LatestNewsProps) {
  const { language } = useLanguage();

  if (!news || news.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-zinc-100">
          {language === 'ar' ? 'آخر الأخبار' : 'Latest News'}
        </h2>
        <p className="text-gray-600 dark:text-zinc-400 text-center py-8">
          {language === 'ar' ? 'لا توجد أخبار' : 'No news items'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
          {language === 'ar' ? 'آخر الأخبار' : 'Latest News'}
        </h2>
        <Link
          href="/admin/news"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          {language === 'ar' ? 'عرض الكل' : 'View All'}
        </Link>
      </div>

      <div className="space-y-3">
        {news.map((item) => {
          const title =
            language === 'ar'
              ? item.title_ar || item.title_en || 'Untitled'
              : item.title_en || item.title_ar || 'Untitled';

          const date = new Date(item.published_date).toLocaleDateString(
            language === 'ar' ? 'ar-SA' : 'en-US',
            { year: 'numeric', month: 'short', day: 'numeric' }
          );

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium text-gray-900 dark:text-zinc-100 truncate ${
                    language === 'ar' ? 'text-right' : 'text-left'
                  }`}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  {title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600 dark:text-zinc-400">{date}</p>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      item.is_visible
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {item.is_visible
                      ? language === 'ar'
                        ? 'مرئي'
                        : 'Visible'
                      : language === 'ar'
                      ? 'مخفي'
                      : 'Hidden'}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      item.storage_type === 'blob'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    {item.storage_type === 'blob' ? 'Blob' : 'Local'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
