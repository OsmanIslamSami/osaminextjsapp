'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { getBilingualTitle } from '@/lib/utils/bilingual';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';

interface Magazine {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image_url: string;
  published_date: string;
}

interface MagazineListProps {
  magazines: Magazine[];
}

export default function MagazineList({ magazines }: MagazineListProps) {
  const { t, language, direction } = useTranslation();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(language === 'ar' ? `هل أنت متأكد من حذف "${title}"؟` : `Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/magazines/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete Magazine');
      }

      router.refresh();
    } catch (error) {
      alert(language === 'ar' ? 'فشل حذف المجلة' : 'Failed to delete Magazine');
    } finally {
      setDeletingId(null);
    }
  };

  const getBilingualDescription = (magazine: Magazine) => {
    return language === 'ar' ? magazine.description_ar : magazine.description_en;
  };

  if (magazines.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900 rounded-lg" dir={direction}>
        <p className="text-gray-500 dark:text-zinc-400">
          {language === 'ar' ? 'لا توجد مجلات متاحة' : 'No magazines available'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={direction}>
      {magazines.map((magazine) => {
        const title = getBilingualTitle(magazine, language);
        const description = getBilingualDescription(magazine);
        const publishedDate = new Date(magazine.published_date).toLocaleDateString(
          language === 'ar' ? 'ar-SA' : 'en-US',
          { year: 'numeric', month: 'long', day: 'numeric' }
        );
        
        return (
          <div
            key={magazine.id}
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 flex gap-4"
          >
            {/* Image Column */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-44 rounded-lg overflow-hidden">
                <Image
                  src={magazine.image_url}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            {/* Content Column */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-2 ${
                direction === 'rtl' ? 'text-right' : 'text-left'
              }`}>
                {title}
              </h3>
              <p className={`text-sm text-gray-500 dark:text-zinc-400 mb-3 ${
                direction === 'rtl' ? 'text-right' : 'text-left'
              }`}>
                {publishedDate}
              </p>
              <p className={`text-gray-600 dark:text-zinc-300 line-clamp-3 ${
                direction === 'rtl' ? 'text-right' : 'text-left'
              }`}>
                {description}
              </p>
            </div>
            
            {/* Actions Column */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link
                href={`/admin/magazines/${magazine.id}/edit`}
                className="px-6 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium text-gray-700 dark:text-zinc-300 hover:border-gray-400 dark:hover:border-zinc-500 transition-all text-center whitespace-nowrap min-w-[100px]"
              >
                {language === 'ar' ? 'تعديل' : 'Edit'}
              </Link>
              <button
                onClick={() => handleDelete(magazine.id, title)}
                disabled={deletingId === magazine.id}
                className="px-6 py-2 border-2 border-red-300 dark:border-red-800 rounded-full text-sm font-medium text-red-600 dark:text-red-400 hover:border-red-400 dark:hover:border-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-center whitespace-nowrap min-w-[100px]"
              >
                {deletingId === magazine.id ? (
                  <span className="inline-flex justify-center w-full">
                    <LoadingSpinner size="sm" />
                  </span>
                ) : (
                  language === 'ar' ? 'حذف' : 'Delete'
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
