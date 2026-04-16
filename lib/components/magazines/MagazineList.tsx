'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { getBilingualTitle } from '@/lib/utils/bilingual';
import { useToast } from '@/lib/components/ToastContainer';
import ConfirmDialog from '@/lib/components/ConfirmDialog';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Magazine {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image_url: string;
  published_date: string;
  is_visible?: boolean;
}

interface MagazineListProps {
  magazines: Magazine[];
  selectedMagazines?: Set<string>;
  onSelectMagazine?: (id: string) => void;
  onSelectAll?: () => void;
  onVisibilityToggled?: () => void;
}

export default function MagazineList({ magazines, selectedMagazines = new Set(), onSelectMagazine, onSelectAll, onVisibilityToggled }: MagazineListProps) {
  const { t, language, direction } = useTranslation();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingVisibleId, setTogglingVisibleId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingMagazine, setDeletingMagazine] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = (id: string, title: string) => {
    setDeletingMagazine({ id, title });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingMagazine) return;

    setDeletingId(deletingMagazine.id);

    try {
      const response = await fetch(`/api/magazines/${deletingMagazine.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete Magazine');
      }

      showSuccess(language === 'ar' ? 'تم حذف المجلة بنجاح' : 'Magazine deleted successfully');
      router.refresh();
    } catch (error) {
      showError(language === 'ar' ? 'فشل حذف المجلة' : 'Failed to delete Magazine');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(false);
      setDeletingMagazine(null);
    }
  };

  const handleToggleVisible = async (id: string, currentVisible: boolean) => {
    setTogglingVisibleId(id);

    try {
      const response = await fetch(`/api/magazines/${id}/visible`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle visibility');
      }

      // Call parent callback to reload data FIRST
      if (onVisibilityToggled) {
        await onVisibilityToggled();
      }
      
      showSuccess(language === 'ar' ? 'تم تحديث الظهور بنجاح' : 'Visibility updated successfully');
      router.refresh();
    } catch (error) {
      showError(language === 'ar' ? 'فشل تحديث الظهور' : 'Failed to update visibility');
    } finally {
      setTogglingVisibleId(null);
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
      {onSelectAll && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <input
            type="checkbox"
            checked={selectedMagazines && selectedMagazines.size === magazines.length && magazines.length > 0}
            onChange={onSelectAll}
            className="w-4 h-4 cursor-pointer"
            aria-label={language === 'ar' ? 'تحديد الكل' : 'Select all'}
          />
          <span className="text-sm text-gray-600 dark:text-zinc-400">
            {language === 'ar' ? 'تحديد الكل' : 'Select All'}
          </span>
        </div>
      )}
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
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4"
          >
            {/* Mobile: Vertical Stack, Desktop: Horizontal */}
            <div className="flex flex-col md:flex-row gap-4">
              {onSelectMagazine && (
                <div className="flex-shrink-0 flex items-start md:pt-2">
                  <input
                    type="checkbox"
                    checked={selectedMagazines?.has(magazine.id) || false}
                    onChange={() => onSelectMagazine(magazine.id)}
                    className="w-4 h-4 cursor-pointer mt-1"
                  />
                </div>
              )}
              {/* Image - Full width on mobile, fixed on desktop */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="relative w-48 h-64 md:w-32 md:h-44 rounded-lg overflow-hidden">
                  <Image
                    src={magazine.image_url}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              
              {/* Content Column */}
              <div className="flex-1 min-w-0 flex flex-col">
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
              <p className={`text-gray-600 dark:text-zinc-300 line-clamp-3 mb-4 ${
                direction === 'rtl' ? 'text-right' : 'text-left'
              }`}>
                {description}
              </p>
              
              {/* Actions Row at Bottom */}
              <div className="flex gap-2 mt-auto pt-3 border-t border-gray-200 dark:border-zinc-700">
                <button
                  onClick={() => handleToggleVisible(magazine.id, magazine.is_visible ?? true)}
                  disabled={togglingVisibleId === magazine.id}
                  className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center"
                  aria-label={magazine.is_visible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                  title={magazine.is_visible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                >
                  {togglingVisibleId === magazine.id ? (
                    <LoadingSpinner size="sm" />
                  ) : magazine.is_visible ? (
                    <EyeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                  )}
                </button>
                <Link
                  href={`/admin/magazines/${magazine.id}/edit`}
                  className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium text-gray-700 dark:text-zinc-300 hover:border-gray-400 dark:hover:border-zinc-500 transition-all inline-flex items-center justify-center"
                  aria-label={language === 'ar' ? 'تعديل' : 'Edit'}
                  title={language === 'ar' ? 'تعديل' : 'Edit'}
                >
                  <PencilIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </Link>
                <button
                  onClick={() => handleDelete(magazine.id, title)}
                  disabled={deletingId === magazine.id}
                  className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center"
                  aria-label={language === 'ar' ? 'حذف' : 'Delete'}
                  title={language === 'ar' ? 'حذف' : 'Delete'}
                >
                  {deletingId === magazine.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </button>
              </div>
            </div>
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
        message={
          deletingMagazine
            ? language === 'ar'
              ? `هل أنت متأكد من حذف "${deletingMagazine.title}"؟`
              : `Are you sure you want to delete "${deletingMagazine.title}"?`
            : ''
        }
        confirmText={language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeletingMagazine(null);
        }}
      />
    </div>
  );
}
