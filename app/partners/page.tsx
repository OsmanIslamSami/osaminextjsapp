/**
 * Partners Directory Page
 * 
 * Displays all partner organizations in a card grid layout
 * Each card shows logo, name, and clickable website link
 * 
 * Features:
 * - Responsive grid layout (1/2/3/4 columns)
 * - Clickable partner cards
 * - External links open in new tabs
 * - Loading and empty states
 * - RTL support
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowTopRightOnSquareIcon, BuildingOfficeIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRTLDirection } from '@/lib/hooks/useRTLDirection';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import { logger } from '@/lib/utils/logger';

interface PartnerItem {
  id: string;
  title_en: string;
  title_ar: string;
  url?: string | null;
  image_url: string;
  is_featured: boolean;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Partners Directory Page Component
 * 
 * Public-facing page displaying all visible partners.
 * Partners are shown in a grid with their logos and names.
 * Clicking a partner opens their website (if provided).
 */
export default function PartnersDirectoryPage() {
  const { t, language } = useTranslation();
  const isRTL = useRTLDirection();
  
  // Component state
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  // Page title in current language
  const title = t('partners.ourPartners');

  /**
   * Fetch partners with pagination from API
   */
  useEffect(() => {
    async function fetchPartners() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/partners?context=gallery&page=${pagination.page}&limit=${pagination.limit}`
        );
        const data = await response.json();
        
        if (data.success) {
          setPartners(data.data);
          setPagination((prev) => ({
            ...prev,
            total: data.pagination?.total || data.data.length,
            totalPages: data.pagination?.totalPages || Math.ceil(data.data.length / prev.limit),
          }));
        }
      } catch (error) {
        logger.error('Failed to fetch partners:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPartners();
  }, [pagination.page, pagination.limit]);

  /**
   * Handle page change
   * Scrolls to top for better UX
   */
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  return (
    <main className="min-h-screen py-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-zinc-100">{title}</h1>
          {pagination.total > 0 && (
            <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full font-semibold">
              {language === 'ar' 
                ? `${pagination.total} شريك` 
                : `${pagination.total} Partner${pagination.total !== 1 ? 's' : ''}`}
            </div>
          )}
          <Link 
            href="/"
            className="flex items-center gap-2 px-5 py-2 rounded-full border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 bg-transparent transition-all font-medium text-sm"
          >
            <HomeIcon className="w-4 h-4" />
            <span>{t('partners.home')}</span>
          </Link>
        </div>

        {/* Empty State */}
        {partners.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <BuildingOfficeIcon className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">
              {t('partners.noPartners')}
            </p>
          </div>
        ) : (
          <>
            {/* Partners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {partners.map((partner) => {
                const partnerName = language === 'ar' ? partner.title_ar : partner.title_en;
                
                /**
                 * Partner Card Component
                 * Displays logo, name, and optional website link
                 */
                const CardContent = (
                  <>
                    {/* Partner Logo */}
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-white p-6 shadow-md group-hover:shadow-xl transition-shadow duration-300">
                      {/* Featured badge */}
                      {partner.is_featured && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg z-10" style={{ backgroundColor: 'var(--color-accent)' }}>
                          {t('partners.featured')}
                        </div>
                      )}
                      <Image
                        src={partner.image_url}
                        alt={partnerName}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>

                    {/* Partner Info */}
                    <div className="mt-4">
                      <h3 
                        className="font-bold text-center mb-2 group-hover:transition-colors"
                        style={{ color: 'var(--color-text-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-primary)';
                        }}
                      >
                        {partnerName}
                      </h3>
                      
                      {/* Website Link Badge (if URL provided) */}
                      {partner.url && (
                        <div className="flex items-center justify-center gap-1 text-sm" style={{ color: 'var(--color-primary)' }}>
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          <span>{t('partners.visitWebsite')}</span>
                        </div>
                      )}
                    </div>
                  </>
                );

                // If partner has URL, make entire card clickable
                if (partner.url) {
                  return (
                    <a
                      key={partner.id}
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group cursor-pointer"
                    >
                      {CardContent}
                    </a>
                  );
                }

                // Otherwise, render non-clickable card
                return (
                  <div key={partner.id} className="group">
                    {CardContent}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col gap-4 mt-12">
                {/* Pagination Buttons */}
                <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-2">
                  {/* First Row: First and Previous */}
                  <div className="flex items-center justify-center gap-2 md:contents">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded-full border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
                    >
                      {t('pagination.first')}
                    </button>

                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded-full border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
                    >
                      {t('pagination.previous')}
                    </button>
                  </div>

                  {/* Second Row: Page Numbers */}
                  <div className="flex flex-wrap items-center justify-center gap-1 md:contents">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        Math.abs(page - pagination.page) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const prevPage = index > 0 ? array[index - 1] : 0;
                      const showEllipsis = page - prevPage > 1;

                      return (
                        <div key={page} className="flex gap-2">
                          {showEllipsis && (
                            <span className="px-3 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                              pagination.page === page
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Third Row: Next and Last */}
                  <div className="flex items-center justify-center gap-2 md:contents">
                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 rounded-full border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
                    >
                      {t('pagination.next')}
                    </button>

                    {/* Last Page Button */}
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 rounded-full border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
                    >
                      {t('pagination.last')}
                    </button>
                  </div>

                  {/* Showing count info */}
                  <div className="flex items-center justify-center md:contents">
                    <span className="text-sm text-gray-600 dark:text-zinc-400">
                      {t('pagination.showing', {
                        start: (pagination.page - 1) * pagination.limit + 1,
                        end: Math.min(pagination.page * pagination.limit, pagination.total),
                        total: pagination.total
                      })}
                    </span>
                  </div>

                  {/* Page Size Selector */}
                  <div className="flex items-center justify-center gap-2 md:contents">
                    <label className="text-sm text-gray-600 dark:text-zinc-400">
                      {t('pagination.show')}
                    </label>
                    <select
                      value={pagination.limit}
                      onChange={(e) => setPagination({ ...pagination, limit: Number(e.target.value), page: 1 })}
                      className="px-3 py-1.5 border-2 border-gray-300 dark:border-zinc-600 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="10">10</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="500">500</option>
                    </select>
                  </div>
                </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}