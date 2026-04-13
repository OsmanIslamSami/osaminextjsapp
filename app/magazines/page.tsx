'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import MagazineRowItem from '@/lib/components/magazines/MagazineRowItem';
import DateRangeFilter from '@/lib/components/news/DateRangeFilter';
import PaginationControls from '@/lib/components/news/PaginationControls';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';

interface Magazine {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image_url: string;
  download_link: string;
  published_date: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function AllMagazinesContent() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { language } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchMagazines() {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        
        // Set default limit if not provided
        if (!params.has('limit')) {
          params.set('limit', '10');
        }
        
        const response = await fetch(`/api/magazines?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch magazines');
        }
        
        const data = await response.json();
        setMagazines(data.data || []);
        setPagination({
          page: data.currentPage,
          limit: data.limit,
          total: data.totalCount,
          totalPages: data.totalPages,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchMagazines();
  }, [searchParams]);

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
    params.set('page', '1'); // Reset to first page on new filter
    router.push(`/magazines?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/magazines?${params.toString()}`);
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newLimit.toString());
    params.set('page', '1'); // Reset to first page
    router.push(`/magazines?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--color-primary)' }}
            >
              {language === 'ar' ? 'جميع المجلات' : 'All Magazines'}
            </h1>
          </div>

          {/* Loading skeleton - Row-based layout */}
          <div className="flex flex-col gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-zinc-800 rounded-lg overflow-hidden shadow-lg p-4 md:p-6"
              >
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {/* Image skeleton */}
                  <div className="w-full md:w-32 h-48 md:h-44 bg-gray-200 dark:bg-zinc-700 rounded-lg animate-pulse"></div>
                  
                  {/* Content skeleton */}
                  <div className="flex-1 flex flex-col justify-center gap-3">
                    <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/4 animate-pulse"></div>
                  </div>
                  
                  {/* Button skeleton */}
                  <div className="md:flex md:items-center">
                    <div className="h-12 w-full md:w-40 bg-gray-200 dark:bg-zinc-700 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center text-red-600 dark:text-red-400">
            {language === 'ar'
              ? 'حدث خطأ أثناء تحميل المجلات'
              : 'Error loading magazines'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            {language === 'ar' ? 'جميع المجلات' : 'All Magazines'}
          </h1>
          <p className="text-gray-600 dark:text-zinc-400">
            {language === 'ar'
              ? 'تصفح وحمل أحدث إصداراتنا'
              : 'Browse and download our latest publications'}
          </p>
          {/* Total Magazines Count */}
          <div 
            className="mt-4 inline-block text-white px-4 py-2 rounded-full font-semibold"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {language === 'ar' 
              ? `${pagination.total} مجلة` 
              : `${pagination.total} Magazines`}
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-8 bg-gray-50 dark:bg-zinc-800 rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            {/* Date Filter */}
            <div className="flex-1 lg:max-w-md">
              <DateRangeFilter
                initialDateFrom={searchParams.get('dateFrom') || ''}
                initialDateTo={searchParams.get('dateTo') || ''}
                onFilter={handleDateRange}
              />
            </div>
          </div>
        </div>

        {/* Magazines List - Row-based layout */}
        {magazines.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-zinc-300 mb-2">
              {language === 'ar' ? 'لا توجد مجلات' : 'No Magazines Found'}
            </h2>
            <p className="text-gray-600 dark:text-zinc-400">
              {language === 'ar'
                ? 'لا توجد مجلات مطابقة لمعايير البحث'
                : 'No magazines match your search criteria'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6 mb-12">
              {magazines.map((magazine) => (
                <MagazineRowItem key={magazine.id} magazine={magazine} />
              ))}
            </div>

            {/* Pagination */}
            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function AllMagazinesPage() {
  return (
    <Suspense fallback={<MagazinesLoadingFallback />}>
      <AllMagazinesContent />
    </Suspense>
  );
}

function MagazinesLoadingFallback() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <LoadingSpinner className="py-12" size="lg" />
      </div>
    </div>
  );
}
