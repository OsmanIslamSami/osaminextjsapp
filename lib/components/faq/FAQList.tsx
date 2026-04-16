'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { getBilingualQuestion } from '@/lib/utils/bilingual';
import { useToast } from '@/lib/components/ToastContainer';
import ConfirmDialog from '@/lib/components/ConfirmDialog';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import { StarIcon, EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FAQ {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  is_favorite: boolean;
  is_visible?: boolean;
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
  selectedFAQs?: Set<string>;
  onSelectFAQ?: (id: string) => void;
  onSelectAll?: () => void;
  onVisibilityToggled?: () => void;
  onFavoriteToggled?: () => void;
}

export default function FAQList({ faqs, pagination, onPageChange, onLimitChange, showPagination = false, selectedFAQs = new Set(), onSelectFAQ, onSelectAll, onVisibilityToggled, onFavoriteToggled }: FAQListProps) {
  const { t, language, direction } = useTranslation();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(null);
  const [togglingVisibleId, setTogglingVisibleId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<{ id: string; question: string } | null>(null);

  const handleToggleFavorite = async (id: string, currentFavorite: boolean) => {
    setTogglingFavoriteId(id);

    try {
      const response = await fetch(`/api/faq/${id}/favorite`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      showSuccess(language === 'ar' ? 'تم تحديث المفضلة بنجاح' : 'Favorite updated successfully');
      // Call parent callback to reload data
      if (onFavoriteToggled) {
        onFavoriteToggled();
      }
      router.refresh();
    } catch (error) {
      showError(language === 'ar' ? 'فشل تحديث المفضلة' : 'Failed to update favorite');
    } finally {
      setTogglingFavoriteId(null);
    }
  };

  const handleToggleVisible = async (id: string, currentVisible: boolean) => {
    setTogglingVisibleId(id);

    try {
      const response = await fetch(`/api/faq/${id}/visible`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle visibility');
      }

      showSuccess(language === 'ar' ? 'تم تحديث الظهور بنجاح' : 'Visibility updated successfully');
      // Call parent callback to reload data
      if (onVisibilityToggled) {
        onVisibilityToggled();
      }
      router.refresh();
    } catch (error) {
      showError(language === 'ar' ? 'فشل تحديث الظهور' : 'Failed to update visibility');
    } finally {
      setTogglingVisibleId(null);
    }
  };

  const handleDelete = (id: string, question: string) => {
    setDeletingQuestion({ id, question });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingQuestion) return;

    setDeletingId(deletingQuestion.id);

    try {
      const response = await fetch(`/api/faq/${deletingQuestion.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete FAQ');
      }

      showSuccess(language === 'ar' ? 'تم حذف السؤال بنجاح' : 'FAQ deleted successfully');
      router.refresh();
    } catch (error) {
      showError(language === 'ar' ? 'فشل حذف السؤال' : 'Failed to delete FAQ');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(false);
      setDeletingQuestion(null);
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
      {onSelectAll && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <input
            type="checkbox"
            checked={selectedFAQs && selectedFAQs.size === faqs.length && faqs.length > 0}
            onChange={onSelectAll}
            className="w-4 h-4 cursor-pointer"
            aria-label={language === 'ar' ? 'تحديد الكل' : 'Select all'}
          />
          <span className="text-sm text-gray-600 dark:text-zinc-400">
            {language === 'ar' ? 'تحديد الكل' : 'Select All'}
          </span>
        </div>
      )}
      
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
          <thead className="bg-gray-50 dark:bg-zinc-800">
            <tr>
              {onSelectFAQ && (
                <th className="px-6 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedFAQs && selectedFAQs.size === faqs.length && faqs.length > 0}
                    onChange={onSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {language === 'ar' ? 'السؤال' : 'Question'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {language === 'ar' ? 'تاريخ الإنشاء' : 'Created'}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {language === 'ar' ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
            {faqs.map((faq) => {
              const question = getBilingualQuestion(faq, language);
              const createdDate = new Date(faq.created_at).toLocaleDateString(
                language === 'ar' ? 'ar-SA' : 'en-US',
                { year: 'numeric', month: 'short', day: 'numeric' }
              );

              return (
                <tr key={faq.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                  {onSelectFAQ && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedFAQs?.has(faq.id) || false}
                        onChange={() => onSelectFAQ(faq.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {faq.is_favorite && (
                        <svg className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{question}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400 whitespace-nowrap">
                    {createdDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggleFavorite(faq.id, faq.is_favorite)}
                        disabled={togglingFavoriteId === faq.id}
                        className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center"
                        aria-label={faq.is_favorite ? (language === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites') : (language === 'ar' ? 'إضافة إلى المفضلة' : 'Add to favorites')}
                        title={faq.is_favorite ? (language === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites') : (language === 'ar' ? 'إضافة إلى المفضلة' : 'Add to favorites')}
                      >
                        {togglingFavoriteId === faq.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <StarIcon className={`w-5 h-5 ${faq.is_favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 dark:text-zinc-500'}`} />
                        )}
                      </button>
                      <button
                        onClick={() => handleToggleVisible(faq.id, faq.is_visible ?? true)}
                        disabled={togglingVisibleId === faq.id}
                        className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center"
                        aria-label={faq.is_visible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                        title={faq.is_visible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                      >
                        {togglingVisibleId === faq.id ? (
                          <LoadingSpinner size="sm" />
                        ) : faq.is_visible ? (
                          <EyeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                        )}
                      </button>
                      <Link
                        href={`/admin/faq/${faq.id}/edit`}
                        className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 transition-all inline-flex items-center justify-center"
                        aria-label={language === 'ar' ? 'تعديل' : 'Edit'}
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <PencilIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </Link>
                      <button
                        onClick={() => handleDelete(faq.id, question)}
                        disabled={deletingId === faq.id}
                        className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center"
                        aria-label={language === 'ar' ? 'حذف' : 'Delete'}
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        {deletingId === faq.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {faqs.map((faq) => {
          const question = getBilingualQuestion(faq, language);
          const createdDate = new Date(faq.created_at).toLocaleDateString(
            language === 'ar' ? 'ar-SA' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
          );

          return (
            <div
              key={faq.id}
              className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4"
            >
              {/* Card Header */}
              <div className="flex items-start gap-3 mb-3">
                {onSelectFAQ && (
                  <input
                    type="checkbox"
                    checked={selectedFAQs?.has(faq.id) || false}
                    onChange={() => onSelectFAQ(faq.id)}
                    className="w-4 h-4 cursor-pointer mt-1 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {faq.is_favorite && (
                      <svg className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-zinc-100 line-clamp-2">
                      {question}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {createdDate}
                  </p>
                </div>
              </div>

              {/* Action buttons at bottom */}
              <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-zinc-800">
                <button
                  onClick={() => handleToggleFavorite(faq.id, faq.is_favorite)}
                  disabled={togglingFavoriteId === faq.id}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center"
                  aria-label={faq.is_favorite ? (language === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites') : (language === 'ar' ? 'إضافة إلى المفضلة' : 'Add to favorites')}
                  title={faq.is_favorite ? (language === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites') : (language === 'ar' ? 'إضافة إلى المفضلة' : 'Add to favorites')}
                >
                  {togglingFavoriteId === faq.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <StarIcon className={`w-5 h-5 ${faq.is_favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 dark:text-zinc-500'}`} />
                  )}
                </button>
                <button
                  onClick={() => handleToggleVisible(faq.id, faq.is_visible ?? true)}
                  disabled={togglingVisibleId === faq.id}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center"
                  aria-label={faq.is_visible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                  title={faq.is_visible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                >
                  {togglingVisibleId === faq.id ? (
                    <LoadingSpinner size="sm" />
                  ) : faq.is_visible ? (
                    <EyeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                  )}
                </button>
                <Link
                  href={`/admin/faq/${faq.id}/edit`}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 transition-all inline-flex items-center justify-center"
                  aria-label={language === 'ar' ? 'تعديل' : 'Edit'}
                  title={language === 'ar' ? 'تعديل' : 'Edit'}
                >
                  <PencilIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </Link>
                <button
                  onClick={() => handleDelete(faq.id, question)}
                  disabled={deletingId === faq.id}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center"
                  aria-label={language === 'ar' ? 'حذف' : 'Delete'}
                  title={language === 'ar' ? 'حذف' : 'Delete'}
                >
                  {deletingId === faq.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
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

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
        message={
          deletingQuestion
            ? language === 'ar'
              ? `هل أنت متأكد من حذف "${deletingQuestion.question}"؟`
              : `Are you sure you want to delete "${deletingQuestion.question}"?`
            : ''
        }
        confirmLabel={language === 'ar' ? 'حذف' : 'Delete'}
        cancelLabel={language === 'ar' ? 'إلغاء' : 'Cancel'}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeletingQuestion(null);
        }}
      />
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
