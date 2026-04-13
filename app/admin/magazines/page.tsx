'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useToast } from '@/lib/components/ToastContainer';
import Link from 'next/link';
import MagazineList from '@/lib/components/magazines/MagazineList';
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

export default function AdminMagazinesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, isLoading: userLoading } = useCurrentUser();
  const { t, language } = useTranslation();
  const { showError } = useToast();
  
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('magazines.title')}
        </h1>
        <Link
          href="/admin/magazines/add"
          className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
        >
          {t('magazines.addMagazine')}
        </Link>
      </div>

      <MagazineList magazines={magazines} />

      {/* Pagination Controls - Always Visible */}
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
    </div>
  );
}
