'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { getBilingualQuestion } from '@/lib/utils/bilingual';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';

interface FAQ {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  is_favorite: boolean;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FAQListProps {
  faqs: FAQ[];
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  showPagination?: boolean;
}

export default function FAQList({ faqs, pagination, onPageChange, onLimitChange, showPagination = false }: FAQListProps) {
  const { t, language, direction } = useTranslation();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(null);

  const handleToggleFavorite = async (id: string, currentFavorite: boolean) => {
    setTogglingFavoriteId(id);

    try {
      const response = await fetch(`/api/faq/${id}/favorite`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      router.refresh();
    } catch (error) {
      alert(language === 'ar' ? 'فشل تحديث المفضلة' : 'Failed to update favorite');
    } finally {
      setTogglingFavoriteId(null);
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(language === 'ar' ? `هل أنت متأكد من حذف "${question}"؟` : `Are you sure you want to delete "${question}"?`)) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/faq/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete FAQ');
      }

      router.refresh();
    } catch (error) {
      alert(language === 'ar' ? 'فشل حذف السؤال' : 'Failed to delete FAQ');
    } finally {
      setDeletingId(null);
    }
  };

  if (faqs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900 rounded-lg" dir={direction}>
        <p className="text-gray-500 dark:text-zinc-400">
          {language === 'ar' ? 'لا توجد أسئلة متاحة' : 'No FAQs available'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={direction}>
      <div className="space-y-4">
        {faqs.map((faq) => {
          const question = getBilingualQuestion(faq, language);
          
          return (
            <div
              key={faq.id}
              className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {faq.is_favorite && (
                    <svg
                      className="w-5 h-5 text-yellow-500 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {question}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  {language === 'ar' 
                    ? `تم الإنشاء: ${new Date(faq.created_at).toLocaleDateString('ar-SA')}`
                    : `Created: ${new Date(faq.created_at).toLocaleDateString('en-US')}`
                  }
                </p>
              </div>

              <div className={`flex gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => handleToggleFavorite(faq.id, faq.is_favorite)}
                  disabled={togglingFavoriteId === faq.id}
                  className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                  title={language === 'ar' ? (faq.is_favorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة') : (faq.is_favorite ? 'Remove from favorites' : 'Add to favorites')}
                >
                  {togglingFavoriteId === faq.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <svg
                      className={`w-5 h-5 ${faq.is_favorite ? 'text-yellow-500 fill-current' : 'text-gray-400 dark:text-zinc-500'}`}
                      viewBox="0 0 20 20"
                      fill={faq.is_favorite ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                </button>
                <Link
                  href={`/admin/faq/${faq.id}/edit`}
                  className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium text-gray-700 dark:text-zinc-300 hover:border-gray-400 dark:hover:border-zinc-500 transition-all whitespace-nowrap"
                >
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </Link>
                <button
                  onClick={() => handleDelete(faq.id, question)}
                  disabled={deletingId === faq.id}
                  className="px-4 py-2 border-2 border-red-300 dark:border-red-800 rounded-full text-sm font-medium text-red-600 dark:text-red-400 hover:border-red-400 dark:hover:border-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                >
                  {deletingId === faq.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    language === 'ar' ? 'حذف' : 'Delete'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {showPagination && pagination && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange!}
          onLimitChange={onLimitChange!}
          language={language}
        />
      )}
    </div>
  );
}

// Pagination Controls Component
interface PaginationControlsProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  language: string;
}

function PaginationControls({ pagination, onPageChange, onLimitChange, language }: PaginationControlsProps) {
  const { page, limit, total, totalPages } = pagination;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-2">
        {/* First and Previous */}
        <div className="flex items-center justify-center gap-2 md:contents">
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
          >
            {language === 'ar' ? 'الأول' : 'First'}
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
          >
            {language === 'ar' ? 'السابق' : 'Previous'}
          </button>
        </div>

        {/* Page Numbers */}
        <div className="flex flex-wrap items-center justify-center gap-1 md:contents">
          {pageNumbers.map((pageNum, index) => (
            pageNum === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-500 dark:text-zinc-400"
              >
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum as number)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  pageNum === page
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300'
                }`}
              >
                {pageNum}
              </button>
            )
          ))}
        </div>

        {/* Next and Last */}
        <div className="flex items-center justify-center gap-2 md:contents">
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
          >
            {language === 'ar' ? 'التالي' : 'Next'}
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
          >
            {language === 'ar' ? 'الأخير' : 'Last'}
          </button>
        </div>

        {/* Showing count info */}
        <div className="flex items-center justify-center md:contents">
          <span className="text-sm text-gray-600 dark:text-zinc-400">
            {language === 'ar'
              ? `عرض ${start} - ${end} من ${total}`
              : `Showing ${start} - ${end} of ${total}`
            }
          </span>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center justify-center gap-2 md:contents">
          <label className="text-sm text-gray-600 dark:text-zinc-400">
            {language === 'ar' ? 'عرض:' : 'Show:'}
          </label>
          <select
            value={limit}
            onChange={(e) => {
              onLimitChange(Number(e.target.value));
              onPageChange(1); // Reset to first page when changing limit
            }}
            className="px-3 py-1.5 border-2 border-gray-300 dark:border-zinc-600 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="500">500</option>
          </select>
        </div>
      </div>
    </div>
  );
}
