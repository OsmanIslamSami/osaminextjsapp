'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/lib/components/ToastContainer';
import ConfirmDialog from '@/lib/components/ConfirmDialog';
import NewsForm from '@/lib/components/admin/NewsForm';
import NewsTable from '@/lib/components/admin/NewsTable';
import AdminSearchBar from '@/lib/components/admin/AdminSearchBar';
import AdminDateRangeFilter from '@/lib/components/admin/AdminDateRangeFilter';
import ExportButton from '@/lib/components/admin/ExportButton';

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

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingNewsId, setDeletingNewsId] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const { language, direction } = useLanguage();
  const { showError, showSuccess } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetchNews();
  }, [searchParams]);

  async function fetchNews() {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      if (!params.get('limit')) {
        params.set('limit', '20');
      }
      
      const response = await fetch(`/api/news/admin?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setNews(data.news || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = () => {
    setEditingNews(null);
    setShowForm(true);
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingNews(null);
    fetchNews();
  };

  const handleDelete = async (id: string) => {
    setDeletingNewsId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingNewsId) return;

    try {
      const response = await fetch(`/api/news/${deletingNewsId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete news');
      }

      fetchNews();
    } catch (err) {
      showError(language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingNewsId(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedNews.size === news.length) {
      setSelectedNews(new Set());
    } else {
      setSelectedNews(new Set(news.map(item => item.id)));
    }
  };

  const handleSelectNews = (id: string) => {
    const newSelected = new Set(selectedNews);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNews(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedNews.size === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedNews).map(id =>
        fetch(`/api/news/${id}`, { method: 'DELETE' })
      );

      const results = await Promise.all(deletePromises);
      const failedCount = results.filter(r => !r.ok).length;

      if (failedCount > 0) {
        showError(
          language === 'ar' 
            ? `فشل حذف ${failedCount} من ${selectedNews.size} خبر` 
            : `Failed to delete ${failedCount} of ${selectedNews.size} news items`
        );
      } else {
        showSuccess(
          language === 'ar' 
            ? `تم حذف ${selectedNews.size} خبر بنجاح` 
            : `Successfully deleted ${selectedNews.size} news items`
        );
      }

      setSelectedNews(new Set());
      fetchNews();
    } catch (err) {
      showError(language === 'ar' ? 'فشل الحذف الجماعي' : 'Failed to bulk delete');
    } finally {
      setShowBulkDeleteConfirm(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_deleted: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore news');
      }

      fetchNews();
    } catch (err) {
      showError(language === 'ar' ? 'فشلت الاستعادة' : 'Failed to restore');
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !currentVisibility }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle visibility');
      }

      fetchNews();
    } catch (err) {
      showError(language === 'ar' ? 'فشل التحديث' : 'Failed to update');
    }
  };

  const handleSearch = (keyword: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (keyword.trim()) {
      params.set('search', keyword);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/admin/news?${params.toString()}`);
  };

  const handleDateRange = (dateFrom: string, dateTo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (dateFrom) {
      params.set('dateFrom', dateFrom);
    } else {
      params.delete('dateFrom');
    }
    if (dateTo) {
      params.set('dateTo', dateTo);
    } else {
      params.delete('dateTo');
    }
    params.set('page', '1');
    router.push(`/admin/news?${params.toString()}`);
  };

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filter && filter !== 'all') {
      params.set('filter', filter);
    } else {
      params.delete('filter');
    }
    params.set('page', '1');
    router.push(`/admin/news?${params.toString()}`);
  };

  const handleLimitChange = (limit: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', limit);
    params.set('page', '1');
    router.push(`/admin/news?${params.toString()}`);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams(searchParams.toString());
      const response = await fetch(`/api/news/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `news-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showError(language === 'ar' ? 'فشل التصدير' : 'Failed to export');
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6" dir={direction}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
            {language === 'ar' ? 'إدارة الأخبار' : 'News Management'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            {language === 'ar' 
              ? `${pagination.total} خبر إجمالاً` 
              : `${pagination.total} total news items`}
            {selectedNews.size > 0 && (
              <span className="mx-2 text-blue-600 dark:text-blue-400 font-semibold">
                ({language === 'ar' 
                  ? `${selectedNews.size} محدد` 
                  : `${selectedNews.size} selected`})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedNews.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all text-sm shadow-sm"
            >
              {language === 'ar' ? `حذف المحدد (${selectedNews.size})` : `Delete Selected (${selectedNews.size})`}
            </button>
          )}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium transition-all text-sm shadow-sm"
          >
            {language === 'ar' ? 'إضافة خبر' : 'Add News'}
          </button>
        </div>
      </div>

      {/* Search, Filter, and Export */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="w-full">
            <AdminSearchBar
              initialValue={searchParams.get('search') || ''}
              onSearch={handleSearch}
            />
          </div>
          <div className="w-full">
            <AdminDateRangeFilter
              initialDateFrom={searchParams.get('dateFrom') || ''}
              initialDateTo={searchParams.get('dateTo') || ''}
              onFilter={handleDateRange}
            />
          </div>
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <select
              value={searchParams.get('filter') || 'all'}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="visible">{language === 'ar' ? 'مرئي' : 'Visible'}</option>
              <option value="hidden">{language === 'ar' ? 'مخفي' : 'Hidden'}</option>
              <option value="deleted">{language === 'ar' ? 'محذوف' : 'Deleted'}</option>
            </select>
            <div className="w-full sm:w-auto">
              <ExportButton onExport={handleExport} />
            </div>
          </div>
        </div>
      </div>

      {/* News Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 dark:text-red-400 py-8">
          {error}
        </div>
      ) : (
        <>
          <NewsTable
            news={news}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onToggleVisibility={handleToggleVisibility}
            selectedNews={selectedNews}
            onSelectNews={handleSelectNews}
            onSelectAll={handleSelectAll}
          />

          {/* Pagination Controls */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
              <div className="flex flex-col gap-4">
                {/* All pagination elements */}
                <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-2">
                  {/* First Row: First and Previous */}
                  <div className="flex items-center justify-center gap-2 md:contents">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', '1');
                        router.push(`/admin/news?${params.toString()}`);
                      }}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 dark:hover:border-zinc-500 transition-all min-h-[40px] text-gray-700 dark:text-zinc-300"
                    >
                      {language === 'ar' ? 'الأولى' : 'First'}
                    </button>
                    
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', String(pagination.page - 1));
                        router.push(`/admin/news?${params.toString()}`);
                      }}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 dark:hover:border-zinc-500 transition-all min-h-[40px] text-gray-700 dark:text-zinc-300"
                    >
                      {language === 'ar' ? 'السابق' : 'Previous'}
                    </button>
                  </div>

                  {/* Second Row: Page Numbers */}
                  <div className="flex flex-wrap items-center justify-center gap-1 md:contents">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('page', String(pageNum));
                            router.push(`/admin/news?${params.toString()}`);
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[40px] min-w-[40px] ${
                            pagination.page === pageNum
                              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                              : 'border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Third Row: Next and Last */}
                  <div className="flex items-center justify-center gap-2 md:contents">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', String(pagination.page + 1));
                        router.push(`/admin/news?${params.toString()}`);
                      }}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 dark:hover:border-zinc-500 transition-all min-h-[40px] text-gray-700 dark:text-zinc-300"
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                    </button>

                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', String(pagination.totalPages));
                        router.push(`/admin/news?${params.toString()}`);
                      }}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 dark:hover:border-zinc-500 transition-all min-h-[40px] text-gray-700 dark:text-zinc-300"
                    >
                      {language === 'ar' ? 'الأخيرة' : 'Last'}
                    </button>
                  </div>

                  {/* Page Info */}
                  <div className="flex items-center justify-center md:contents">
                    <span className="text-sm text-gray-600 dark:text-zinc-400">
                      {language === 'ar' 
                        ? `عرض ${((pagination.page - 1) * pagination.limit) + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} من ${pagination.total}`
                        : `Showing ${((pagination.page - 1) * pagination.limit) + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}`
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
                      onChange={(e) => handleLimitChange(e.target.value)}
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
            </div>
        </>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        title={language === 'ar' ? 'تأكيد الحذف الجماعي' : 'Confirm Bulk Delete'}
        message={language === 'ar' 
          ? `هل أنت متأكد من حذف ${selectedNews.size} خبر؟ يمكن استعادتها لاحقاً.` 
          : `Are you sure you want to delete ${selectedNews.size} news items? They can be restored later.`}
        confirmText={language === 'ar' ? 'حذف الكل' : 'Delete All'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        onConfirm={confirmBulkDelete}
        onCancel={() => setShowBulkDeleteConfirm(false)}
      />

      {/* Form Modal */}
      {showForm && (
        <NewsForm
          news={editingNews}
          onClose={handleFormClose}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
        message={language === 'ar' ? 'هل أنت متأكد من حذف هذا الخبر؟' : 'Are you sure you want to delete this news item?'}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeletingNewsId(null);
        }}
        confirmText={language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
      />
    </div>
  );
}
