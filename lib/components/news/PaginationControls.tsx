'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationControlsProps) {
  const { language } = useLanguage();

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of page buttons to show

    if (totalPages <= showPages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-2">
        {/* First and Previous */}
        <div className="flex items-center justify-center gap-2 md:contents">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300 font-medium transition-all text-sm bg-transparent"
          >
            {language === 'ar' ? 'الأولى' : 'First'}
          </button>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300 font-medium transition-all text-sm bg-transparent"
          >
            {language === 'ar' ? 'السابق' : 'Previous'}
          </button>
        </div>

        {/* Page numbers */}
        <div className="flex flex-wrap items-center justify-center gap-1 md:contents">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-500 dark:text-zinc-400 text-sm"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                  isActive
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 bg-transparent'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next and Last */}
        <div className="flex items-center justify-center gap-2 md:contents">
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300 font-medium transition-all text-sm bg-transparent"
          >
            {language === 'ar' ? 'التالي' : 'Next'}
          </button>

          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300 font-medium transition-all text-sm bg-transparent"
          >
            {language === 'ar' ? 'الأخيرة' : 'Last'}
          </button>
        </div>

        {/* Showing count info */}
        <div className="flex items-center justify-center md:contents">
          <span className="text-sm text-gray-600 dark:text-zinc-400">
            {language === 'ar'
              ? `عرض ${(currentPage - 1) * limit + 1} - ${Math.min(currentPage * limit, total)} من ${total}`
              : `Showing ${(currentPage - 1) * limit + 1} - ${Math.min(currentPage * limit, total)} of ${total}`
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
            onChange={(e) => onLimitChange(Number(e.target.value))}
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
  );
}
