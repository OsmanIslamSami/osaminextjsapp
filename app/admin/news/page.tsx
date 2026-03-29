'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const { language } = useLanguage();
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
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الخبر؟' : 'Are you sure you want to delete this news item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete news');
      }

      fetchNews();
    } catch (err) {
      alert(language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
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
      alert(language === 'ar' ? 'فشلت الاستعادة' : 'Failed to restore');
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
      alert(language === 'ar' ? 'فشل التحديث' : 'Failed to update');
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
      alert(language === 'ar' ? 'فشل التصدير' : 'Failed to export');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          {language === 'ar' ? 'إدارة الأخبار' : 'News Management'}
        </h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px]"
        >
          {language === 'ar' ? '+ إضافة خبر' : '+ Add News'}
        </button>
      </div>

      {/* Search, Filter, and Export */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <AdminSearchBar
            initialValue={searchParams.get('search') || ''}
            onSearch={handleSearch}
          />
          <AdminDateRangeFilter
            initialDateFrom={searchParams.get('dateFrom') || ''}
            initialDateTo={searchParams.get('dateTo') || ''}
            onFilter={handleDateRange}
          />
          <div className="flex gap-2">
            <select
              value={searchParams.get('filter') || 'all'}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
            >
              <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="visible">{language === 'ar' ? 'مرئي' : 'Visible'}</option>
              <option value="hidden">{language === 'ar' ? 'مخفي' : 'Hidden'}</option>
              <option value="deleted">{language === 'ar' ? 'محذوف' : 'Deleted'}</option>
            </select>
            <ExportButton onExport={handleExport} />
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
        <NewsTable
          news={news}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onToggleVisibility={handleToggleVisibility}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <NewsForm
          news={editingNews}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
