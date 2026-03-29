'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
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
    <div className="flex justify-center items-center gap-2 flex-wrap">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300 font-medium transition-colors min-h-[44px]"
      >
        {language === 'ar' ? 'السابق' : 'Previous'}
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-4 py-2 text-gray-500 dark:text-zinc-400"
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
            className={`px-4 py-2 rounded-lg font-medium transition-all min-h-[44px] min-w-[44px] ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg'
                : 'border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300 font-medium transition-colors min-h-[44px]"
      >
        {language === 'ar' ? 'التالي' : 'Next'}
      </button>
    </div>
  );
}
