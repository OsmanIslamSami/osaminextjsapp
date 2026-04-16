'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useToast } from '@/lib/components/ToastContainer';
import Link from 'next/link';
import FAQList from '@/lib/components/faq/FAQList';
import ConfirmDialog from '@/lib/components/ConfirmDialog';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface FAQ {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  is_favorite: boolean;
  is_visible: boolean;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminFAQPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, isLoading: userLoading } = useCurrentUser();
  const { t, language, direction } = useTranslation();
  const { showError, showSuccess } = useToast();
  
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFAQs, setSelectedFAQs] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (userLoading) return;
    
    if (!user || !isAdmin) {
      router.push('/login');
      return;
    }

    loadFAQs();
  }, [userLoading, user, isAdmin, router, searchParams]);

  async function loadFAQs() {
    try {
      setLoading(true);
      const page = searchParams.get('page') || '1';
      const limit = searchParams.get('limit') || '20';
      
      const response = await fetch(`/api/faq?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to load FAQs');
      }

      const result = await response.json();
      setFaqs(result.data);
      setPagination({
        page: result.currentPage,
        limit: result.limit,
        total: result.totalCount,
        totalPages: result.totalPages,
      });
    } catch (error) {
      showError('Failed to load FAQs');
      console.error('Load FAQs error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/faq?${params.toString()}`);
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newLimit.toString());
    params.set('page', '1'); // Reset to first page
    router.push(`/admin/faq?${params.toString()}`);
  };

  const handleSelectAll = () => {
    if (selectedFAQs.size === faqs.length) {
      setSelectedFAQs(new Set());
    } else {
      setSelectedFAQs(new Set(faqs.map(item => item.id)));
    }
  };

  const handleSelectFAQ = (id: string) => {
    const newSelected = new Set(selectedFAQs);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFAQs(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedFAQs.size === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedFAQs).map(id =>
        fetch(`/api/faq/${id}`, { method: 'DELETE' })
      );

      const results = await Promise.all(deletePromises);
      const failedCount = results.filter(r => !r.ok).length;

      if (failedCount > 0) {
        showError(
          language === 'ar' 
            ? `فشل حذف ${failedCount} من ${selectedFAQs.size} سؤال` 
            : `Failed to delete ${failedCount} of ${selectedFAQs.size} FAQs`
        );
      } else {
        showSuccess(
          language === 'ar' 
            ? `تم حذف ${selectedFAQs.size} سؤال بنجاح` 
            : `Successfully deleted ${selectedFAQs.size} FAQs`
        );
      }

      setSelectedFAQs(new Set());
      loadFAQs();
    } catch (err) {
      showError(language === 'ar' ? 'فشل الحذف الجماعي' : 'Failed to bulk delete');
    } finally {
      setShowBulkDeleteConfirm(false);
    }
  };

  if (userLoading || loading) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6" dir={direction}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('faq.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            {language === 'ar' 
              ? `${pagination.total} سؤال إجمالاً` 
              : `${pagination.total} total FAQs`}
            {selectedFAQs.size > 0 && (
              <span className="mx-2 text-blue-600 dark:text-blue-400 font-semibold">
                ({language === 'ar' 
                  ? `${selectedFAQs.size} محدد` 
                  : `${selectedFAQs.size} selected`})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedFAQs.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all text-sm shadow-sm"
            >
              <TrashIcon className="w-4 h-4" />
              {language === 'ar' ? `حذف المحدد (${selectedFAQs.size})` : `Delete Selected (${selectedFAQs.size})`}
            </button>
          )}
          <Link
            href="/admin/faq/add"
            className="flex items-center gap-2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all text-sm shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            {t('faq.addFAQ')}
          </Link>
        </div>
      </div>

      <FAQList 
        faqs={faqs} 
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        showPagination={true}
        selectedFAQs={selectedFAQs}
        onSelectFAQ={handleSelectFAQ}
        onSelectAll={handleSelectAll}
        onVisibilityToggled={loadFAQs}
        onFavoriteToggled={loadFAQs}
      />

      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        title={language === 'ar' ? 'حذف الأسئلة المحددة' : 'Delete Selected FAQs'}
        message={
          language === 'ar'
            ? `هل أنت متأكد من حذف ${selectedFAQs.size} سؤال؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete ${selectedFAQs.size} FAQs? This action cannot be undone.`
        }
        confirmText={language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        onConfirm={confirmBulkDelete}
        onCancel={() => setShowBulkDeleteConfirm(false)}
      />
    </div>
  );
}
