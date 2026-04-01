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
  const { showError } = useToast();
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          {language === 'ar' ? 'إدارة الأخبار' : 'News Management'}
        </h2>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px]"
        >
          {language === 'ar' ? '+ إضافة خبر' : '+ Add News'}
        </button>
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
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 min-h-[44px]"
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
          {pagination.totalPages > 1 && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page Info */}
                <div className="text-sm text-gray-600 dark:text-zinc-400">
                  {language === 'ar' 
                    ? `عرض ${((pagination.page - 1) * pagination.limit) + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} من ${pagination.total}`
                    : `Showing ${((pagination.page - 1) * pagination.limit) + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}`
                  }
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', '1');
                      router.push(`/admin/news?${params.toString()}`);
                    }}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors min-h-[40px]"
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
                    className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors min-h-[40px]"
                  >
                    {language === 'ar' ? 'السابق' : 'Previous'}
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
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
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] min-w-[40px] ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(pagination.page + 1));
                      router.push(`/admin/news?${params.toString()}`);
                    }}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors min-h-[40px]"
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
                    className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors min-h-[40px]"
                  >
                    {language === 'ar' ? 'الأخيرة' : 'Last'}
                  </button>
        

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
      />        </div>
              </div>
            </div>
          )}
        </>
      )}

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
