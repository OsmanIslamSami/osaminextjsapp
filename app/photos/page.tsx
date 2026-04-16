/**
 * Photos Gallery Page
 * Grid layout displaying all visible photos with pagination
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRTLDirection } from '@/lib/hooks/useRTLDirection';
import { PhotoPopup, PhotoItem } from '@/lib/components/media/PhotoPopup';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PhotosGalleryPage() {
  const { t, language } = useTranslation();
  const isRTL = useRTLDirection();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);

  const title = t('photos.gallery');

  useEffect(() => {
    async function fetchPhotos() {
      setLoading(true);
      try {
        const response = await fetch(`/api/photos?context=gallery&page=${pagination.page}&limit=${pagination.limit}`);
        const data = await response.json();
        
        if (data.success) {
          setPhotos(data.data);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, [pagination.page, pagination.limit]);

  const handlePhotoClick = (index: number) => {
    setPopupIndex(index);
    setShowPopup(true);
  };

  const handlePopupNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setPopupIndex((prev) => (prev + 1) % photos.length);
    } else {
      setPopupIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                ? `${pagination.total} صورة` 
                : `${pagination.total} Photo${pagination.total !== 1 ? 's' : ''}`}
            </div>
          )}
          <Link 
            href="/"
            className="flex items-center gap-2 px-5 py-2 rounded-full border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 bg-transparent transition-all font-medium text-sm"
          >
            <HomeIcon className="w-4 h-4" />
            <span>{t('photos.home')}</span>
          </Link>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {t('photos.noPhotos')}
            </p>
          </div>
        ) : (
          <>
            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {photos.map((photo, index) => {
                const photoTitle = language === 'ar' ? photo.title_ar : photo.title_en;
                const publishedDate = new Date(photo.published_date).toLocaleDateString(
                  language === 'ar' ? 'ar-SA' : 'en-US',
                  { year: 'numeric', month: 'long', day: 'numeric' }
                );
                return (
                  <div
                    key={photo.id}
                    onClick={() => handlePhotoClick(index)}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={photo.image_url}
                        alt={photoTitle}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {/* Featured badge */}
                      {photo.is_featured && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg z-20" style={{ backgroundColor: 'var(--color-accent)' }}>
                          {t('photos.featured')}
                        </div>
                      )}
                      {/* Gradient overlay - always visible */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      
                      {/* Enhanced gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Content overlay at bottom */}
                      <div className="absolute inset-x-0 bottom-0 p-4 text-white z-10">
                        <h3 className="font-semibold line-clamp-2 mb-2 drop-shadow-lg">{photoTitle}</h3>
                        
                        <div
                          className={`flex items-center gap-2 text-sm text-white/90 ${
                            language === 'ar' ? 'flex-row-reverse justify-end' : ''
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="drop-shadow-md">{publishedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4">
                {/* All pagination elements */}
                <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-2">
                  {/* First Row: First and Previous */}
                  <div className="flex items-center justify-center gap-2 md:contents">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-1.5 rounded-full border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 bg-transparent transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('pagination.previous')}
                    </button>
                  </div>
                  
                  {/* Second Row: Page Numbers */}
                  <div className="flex flex-wrap items-center justify-center gap-1 md:contents">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 rounded-full transition-all font-medium text-sm ${
                        page === pagination.page
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 bg-transparent'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                  {/* Third Row: Next */}
                  <div className="flex items-center justify-center gap-2 md:contents">
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-1.5 rounded-full border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 bg-transparent transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('pagination.next')}
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
                      onChange={(e) => handleLimitChange(Number(e.target.value))}
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

      {/* Photo Popup */}
      <PhotoPopup
        isOpen={showPopup}
        photos={photos}
        currentIndex={popupIndex}
        onClose={() => setShowPopup(false)}
        onNavigate={handlePopupNavigate}
      />
    </main>
  );
}
