'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import NewsCard from '@/lib/components/home/NewsCard';
import SearchBar from '@/lib/components/news/SearchBar';
import DateRangeFilter from '@/lib/components/news/DateRangeFilter';
import PaginationControls from '@/lib/components/news/PaginationControls';

interface News {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  image_url: string;
  storage_type: 'blob' | 'local';
  published_date: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function AllNewsContent() {
  const [news, setNews] = useState<News[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        const response = await fetch(`/api/news?${params.toString()}`);
        
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

    fetchNews();
  }, [searchParams]);

  const handleSearch = (keyword: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (keyword.trim()) {
      params.set('search', keyword);
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Reset to first page on new search
    router.push(`/news?${params.toString()}`);
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
    params.set('page', '1'); // Reset to first page on new filter
    router.push(`/news?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/news?${params.toString()}`);
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newLimit.toString());
    params.set('page', '1'); // Reset to first page
    router.push(`/news?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {language === 'ar' ? 'جميع الأخبار' : 'All News'}
            </h1>
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-lg"
              >
                <div className="h-48 bg-gray-200 dark:bg-zinc-800 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-2/3 animate-pulse"></div>
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
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center text-red-600 dark:text-red-400">
            {language === 'ar'
              ? 'حدث خطأ أثناء تحميل الأخبار'
              : 'Error loading news'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {language === 'ar' ? 'جميع الأخبار' : 'All News'}
          </h1>
          <p className="text-gray-600 dark:text-zinc-400">
            {language === 'ar'
              ? 'تصفح جميع الأخبار والإعلانات'
              : 'Browse all news and announcements'}
          </p>
          {/* Total News Count */}
          <div className="mt-4 inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full font-semibold">
            {language === 'ar' 
              ? `${pagination.total} خبر` 
              : `${pagination.total} News Items`}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 sm:p-6">
          {/* For desktop: all in one row */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            {/* Search Bar - takes more space on desktop */}
            <div className="flex-1 lg:max-w-md">
              <SearchBar
                initialValue={searchParams.get('search') || ''}
                onSearch={handleSearch}
              />
            </div>
            
            {/* Date Filter - compact on desktop */}
            <div className="flex-1">
              <DateRangeFilter
                initialDateFrom={searchParams.get('dateFrom') || ''}
                initialDateTo={searchParams.get('dateTo') || ''}
                onFilter={handleDateRange}
              />
            </div>
          </div>
        </div>

        {/* News Grid */}
        {news.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📰</div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-zinc-300 mb-2">
              {language === 'ar' ? 'لا توجد أخبار' : 'No News Found'}
            </h2>
            <p className="text-gray-600 dark:text-zinc-400">
              {language === 'ar'
                ? 'لا توجد أخبار مطابقة لمعايير البحث'
                : 'No news match your search criteria'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              {news.map((item, index) => (
                <NewsCard
                  key={item.id}
                  news={item}
                  index={index}
                  isVisible={true}
                />
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

export default function AllNewsPage() {
  return (
    <Suspense fallback={<NewsLoadingFallback />}>
      <AllNewsContent />
    </Suspense>
  );
}

function NewsLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading...
          </h1>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-lg"
            >
              <div className="h-48 bg-gray-200 dark:bg-zinc-800 animate-pulse"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
