'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import FAQSection from '@/lib/components/home/FAQSection';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface FAQ {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function FAQContent() {
  const { t, language, direction } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadFAQs();
  }, [searchParams]);

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
      console.error('Load FAQs error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/faq?${params.toString()}`);
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newLimit.toString());
    params.set('page', '1'); // Reset to first page
    router.push(`/faq?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950" dir={direction}>
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header with Ask a question button only */}
          <div className={`flex mb-12 ${direction === 'rtl' ? 'justify-start' : 'justify-end'}`}>
            <a
              href="mailto:support@example.com"
              className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors whitespace-nowrap text-sm md:text-base"
            >
              {language === 'ar' ? 'اطرح سؤالاً' : 'Ask a question'}
            </a>
          </div>

          <FAQSection faqs={faqs} hasMore={false} showAllButton={false} />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <PaginationControls
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              language={language}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <FAQContent />
    </Suspense>
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
            }}
            className="px-3 py-1.5 border-2 border-gray-300 dark:border-zinc-600 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>
  );
}
