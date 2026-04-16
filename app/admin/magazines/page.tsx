'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useToast } from '@/lib/components/ToastContainer';
import Link from 'next/link';
import MagazineList from '@/lib/components/magazines/MagazineList';
import ConfirmDialog from '@/lib/components/ConfirmDialog';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Magazine {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image_url: string;
  published_date: string;
  is_visible: boolean;
}

export default function AdminMagazinesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, isLoading: userLoading } = useCurrentUser();
  const { t, language, direction } = useTranslation();
  const { showError, showSuccess } = useToast();
  
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMagazines, setSelectedMagazines] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (userLoading) return;
    
    if (!user || !isAdmin) {
      router.push('/login');
      return;
    }

    loadMagazines();
  }, [userLoading, user, isAdmin, router, searchParams]);

  async function loadMagazines() {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      if (!params.get('limit')) {
        params.set('limit', '20');
      }
      if (!params.get('page')) {
        params.set('page', '1');
      }
      
      const response = await fetch(`/api/magazines?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to load magazines');
      }

      const { data, totalCount, totalPages, currentPage, limit } = await response.json();
      setMagazines(data);
      setPagination({
        page: currentPage,
        limit: limit,
        total: totalCount,
        totalPages: totalPages,
      });
    } catch (error) {
      showError('Failed to load magazines');
      console.error('Load magazines error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (userLoading || loading) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/magazines?${params.toString()}`);
  };

  const handleLimitChange = (limit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', limit.toString());
    params.set('page', '1');
    router.push(`/admin/magazines?${params.toString()}`);
  };

  const handleSelectAll = () => {
    if (selectedMagazines.size === magazines.length) {
      setSelectedMagazines(new Set());
    } else {
      setSelectedMagazines(new Set(magazines.map(item => item.id)));
    }
  };

  const handleSelectMagazine = (id: string) => {
    const newSelected = new Set(selectedMagazines);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMagazines(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedMagazines.size === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedMagazines).map(id =>
        fetch(`/api/magazines/${id}`, { method: 'DELETE' })
      );

      const results = await Promise.all(deletePromises);
      const failedCount = results.filter(r => !r.ok).length;

      if (failedCount > 0) {
        showError(
          language === 'ar' 
            ? `فشل حذف ${failedCount} من ${selectedMagazines.size} مجلة` 
            : `Failed to delete ${failedCount} of ${selectedMagazines.size} magazines`
        );
      } else {
        showSuccess(
          language === 'ar' 
            ? `تم حذف ${selectedMagazines.size} مجلة بنجاح` 
            : `Successfully deleted ${selectedMagazines.size} magazines`
        );
      }

      setSelectedMagazines(new Set());
      loadMagazines();
    } catch (err) {
      showError(language === 'ar' ? 'فشل الحذف الجماعي' : 'Failed to bulk delete');
    } finally {
      setShowBulkDeleteConfirm(false);
    }
  };

  const start = (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 7;
    
    if (pagination.totalPages <= maxPages) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (pagination.page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(pagination.totalPages);
      } else if (pagination.page >= pagination.totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = pagination.totalPages - 4; i <= pagination.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = pagination.page - 1; i <= pagination.page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(pagination.totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="space-y-6" dir={direction}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('magazines.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            {language === 'ar' 
              ? `${pagination.total} مجلة إجمالاً` 
              : `${pagination.total} total magazines`}
            {selectedMagazines.size > 0 && (
              <span className="mx-2 text-blue-600 dark:text-blue-400 font-semibold">
                ({language === 'ar' 
                  ? `${selectedMagazines.size} محدد` 
                  : `${selectedMagazines.size} selected`})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedMagazines.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all text-sm shadow-sm"
            >
              <TrashIcon className="w-4 h-4" />
              {language === 'ar' ? `حذف المحدد (${selectedMagazines.size})` : `Delete Selected (${selectedMagazines.size})`}
            </button>
          )}
          <Link
            href="/admin/magazines/add"
            className="flex items-center gap-2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all text-sm shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            {t('magazines.addMagazine')}
          </Link>
        </div>
      </div>

      <MagazineList 
        magazines={magazines}
        selectedMagazines={selectedMagazines}
        onSelectMagazine={handleSelectMagazine}
        onSelectAll={handleSelectAll}
        onVisibilityToggled={loadMagazines}
      />

      {/* Pagination */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-2">
          {/* First and Previous */}
          <div className="flex items-center justify-center gap-2 md:contents">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
            >
              {language === 'ar' ? 'الأولى' : 'First'}
            </button>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
            >
              {language === 'ar' ? 'السابق' : 'Previous'}
            </button>
          </div>

          {/* Page Numbers */}
          <div className="flex flex-wrap items-center justify-center gap-1 md:contents">
            {pageNumbers.map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500 dark:text-zinc-400">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                    page === pagination.page
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          {/* Next and Last */}
          <div className="flex items-center justify-center gap-2 md:contents">
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </button>
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
            >
              {language === 'ar' ? 'الأخيرة' : 'Last'}
            </button>
          </div>

          {/* Showing count info */}
          <div className="flex items-center justify-center md:contents">
            <span className="text-sm text-gray-600 dark:text-zinc-400">
              {language === 'ar'
                ? `عرض ${start} - ${end} من ${pagination.total}`
                : `Showing ${start} - ${end} of ${pagination.total}`
              }
            </span>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center justify-center gap-2 md:contents">
            <label className="text-sm text-gray-600 dark:text-zinc-400">
              {language === 'ar' ? 'عرض:' : 'Show:'}
            </label>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
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

      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        title={language === 'ar' ? 'حذف المجلات المحددة' : 'Delete Selected Magazines'}
        message={
          language === 'ar'
            ? `هل أنت متأكد من حذف ${selectedMagazines.size} مجلة؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete ${selectedMagazines.size} magazines? This action cannot be undone.`
        }
        confirmText={language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        isDangerous={true}
        onConfirm={confirmBulkDelete}
        onCancel={() => setShowBulkDeleteConfirm(false)}
      />
    </div>
  );
}
