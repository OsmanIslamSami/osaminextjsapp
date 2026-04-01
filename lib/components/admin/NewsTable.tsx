'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import StorageTypeBadge from './StorageTypeBadge';
import Image from 'next/image';

interface News {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  image_url: string;
  storage_type: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  published_date: string;
  is_visible: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

interface NewsTableProps {
  news: News[];
  onEdit: (news: News) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onToggleVisibility: (id: string, currentVisibility: boolean) => void;
  selectedNews?: Set<string>;
  onSelectNews?: (id: string) => void;
  onSelectAll?: () => void;
}

export default function NewsTable({
  news,
  onEdit,
  onDelete,
  onRestore,
  onToggleVisibility,
  selectedNews = new Set(),
  onSelectNews,
  onSelectAll,
}: NewsTableProps) {
  const { language, direction } = useLanguage();

  if (news.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-lg shadow">
        <div className="text-6xl mb-4">📰</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-zinc-300 mb-2">
          {language === 'ar' ? 'لا توجد أخبار' : 'No News Found'}
        </h3>
        <p className="text-gray-600 dark:text-zinc-400">
          {language === 'ar'
            ? 'ابدأ بإضافة خبر جديد'
            : 'Start by adding a new news item'}
        </p>
      </div>
    );
  }

  const getImageUrl = (newsItem: News) => {
    if (newsItem.storage_type === 'blob') {
      return newsItem.image_url;
    }
    return `/api/news/media/${newsItem.id}`;
  };

  return (
    <div dir={direction}>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
            <tr>
              {onSelectAll && (
                <th className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedNews && selectedNews.size === news.length && news.length > 0}
                    onChange={onSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
              )}
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'صورة' : 'Image'}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'العنوان' : 'Title'}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'التاريخ' : 'Date'}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'الحالة' : 'Status'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {language === 'ar' ? 'التخزين' : 'Storage'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {language === 'ar' ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {news.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                {onSelectNews && (
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedNews?.has(item.id) || false}
                      onChange={() => onSelectNews(item.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative w-16 h-16">
                    <Image
                      src={getImageUrl(item)}
                      alt={item.title_en || item.title_ar || 'News'}
                      fill
                      className="object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholders/news-placeholder.svg';
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                    {language === 'ar' ? item.title_ar || item.title_en : item.title_en || item.title_ar}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-zinc-400">
                    {new Date(item.published_date).toLocaleDateString(
                      language === 'ar' ? 'ar-SA' : 'en-US'
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.is_deleted
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : item.is_visible
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {item.is_deleted
                      ? language === 'ar'
                        ? 'محذوف'
                        : 'Deleted'
                      : item.is_visible
                      ? language === 'ar'
                        ? 'مرئي'
                        : 'Visible'
                      : language === 'ar'
                      ? 'مخفي'
                      : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StorageTypeBadge storageType={item.storage_type} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {!item.is_deleted && (
                      <>
                        <button
                          onClick={() => onEdit(item)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {language === 'ar' ? 'تعديل' : 'Edit'}
                        </button>
                        <button
                          onClick={() => onToggleVisibility(item.id, item.is_visible)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          {item.is_visible
                            ? language === 'ar'
                              ? 'إخفاء'
                              : 'Hide'
                            : language === 'ar'
                            ? 'إظهار'
                            : 'Show'}
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {language === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      </>
                    )}
                    {item.is_deleted && (
                      <button
                        onClick={() => onRestore(item.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        {language === 'ar' ? 'استعادة' : 'Restore'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {news.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4"
          >
            <div className="flex gap-4 mb-4">
              {onSelectNews && (
                <div className="flex items-start pt-1">
                  <input
                    type="checkbox"
                    checked={selectedNews?.has(item.id) || false}
                    onChange={() => onSelectNews(item.id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              )}
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={getImageUrl(item)}
                  alt={item.title_en || item.title_ar || 'News'}
                  fill
                  className="object-cover rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholders/news-placeholder.svg';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
                  {language === 'ar' ? item.title_ar || item.title_en : item.title_en || item.title_ar}
                </h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  {new Date(item.published_date).toLocaleDateString(
                    language === 'ar' ? 'ar-SA' : 'en-US'
                  )}
                </p>
                <div className="flex gap-2 mt-2">
                  <StorageTypeBadge storageType={item.storage_type} />
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.is_deleted
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : item.is_visible
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {item.is_deleted
                      ? language === 'ar'
                        ? 'محذوف'
                        : 'Deleted'
                      : item.is_visible
                      ? language === 'ar'
                        ? 'مرئي'
                        : 'Visible'
                      : language === 'ar'
                      ? 'مخفي'
                      : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {!item.is_deleted && (
                <>
                  <button
                    onClick={() => onEdit(item)}
                    className="flex-1 min-w-[100px] px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </button>
                  <button
                    onClick={() => onToggleVisibility(item.id, item.is_visible)}
                    className="flex-1 min-w-[100px] px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                  >
                    {item.is_visible
                      ? language === 'ar'
                        ? 'إخفاء'
                        : 'Hide'
                      : language === 'ar'
                      ? 'إظهار'
                      : 'Show'}
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="flex-1 min-w-[100px] px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                  >
                    {language === 'ar' ? 'حذف' : 'Delete'}
                  </button>
                </>
              )}
              {item.is_deleted && (
                <button
                  onClick={() => onRestore(item.id)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
                >
                  {language === 'ar' ? 'استعادة' : 'Restore'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
