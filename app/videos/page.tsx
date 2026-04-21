/**
 * Videos Gallery Page
 * Grid layout displaying all visible videos with pagination
 * Each video shows thumbnail with play button overlay
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlayIcon, HomeIcon } from '@heroicons/react/24/solid';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRTLDirection } from '@/lib/hooks/useRTLDirection';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import { VideoPopup, VideoItem } from '@/lib/components/media/VideoPopup';
import { getYouTubeThumbnailUrl } from '@/lib/utils/youtube';
import { logger } from '@/lib/utils/logger';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Videos Gallery Page Component
 * 
 * Displays all published videos in a grid layout with pagination.
 * Videos can be clicked to play in a popup YouTube player.
 * 
 * Features:
 * - Grid layout (responsive: 1/2/3/4 columns)
 * - Custom or YouTube default thumbnails
 * - Pagination controls
 * - Loading states
 * - Empty state handling
 * - RTL support
 */
export default function VideosGalleryPage() {
  const { t, language } = useTranslation();
  const isRTL = useRTLDirection();
  
  // Component state
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);

  // Page title in current language
  const title = t('videos.gallery');

  /**
   * Fetch videos from API
   * Called on mount and when pagination changes
   */
  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/videos?context=gallery&page=${pagination.page}&limit=${pagination.limit}`
        );
        const data = await response.json();
        
        if (data.success) {
          setVideos(data.data);
          setPagination(data.pagination);
        }
      } catch (error) {
        logger.error('Failed to fetch videos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [pagination.page, pagination.limit]);

  /**
   * Handle video click - opens popup player
   */
  const handleVideoClick = (index: number) => {
    setPopupIndex(index);
    setShowPopup(true);
  };

  /**
   * Handle popup navigation
   * Allows browsing videos without closing popup
   */
  const handlePopupNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setPopupIndex((prev) => (prev + 1) % videos.length);
    } else {
      setPopupIndex((prev) => (prev - 1 + videos.length) % videos.length);
    }
  };

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
                ? `${pagination.total} فيديو` 
                : `${pagination.total} Video${pagination.total !== 1 ? 's' : ''}`}
            </div>
          )}
          <Link 
            href="/"
            className="flex items-center gap-2 px-5 py-2 rounded-full border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 bg-transparent transition-all font-medium text-sm"
          >
            <HomeIcon className="w-4 h-4" />
              <span>{t('pages.home')}</span>
          </Link>
        </div>

        {/* Empty State */}
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <PlayIcon className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">
              {t('videos.noVideos')}
            </p>
          </div>
        ) : (
          <>
            {/* Videos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {videos.map((video, index) => {
                const videoTitle = language === 'ar' ? video.title_ar : video.title_en;
                const thumbnailUrl = video.thumbnail_url || 
                  (video.video_id ? getYouTubeThumbnailUrl(video.video_id) : '');
                const publishedDate = new Date(video.published_date).toLocaleDateString(
                  language === 'ar' ? 'ar-SA' : 'en-US',
                  { year: 'numeric', month: 'long', day: 'numeric' }
                );
                
                return (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(index)}
                    className="group cursor-pointer"
                  >
                    {/* Video Card */}
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 shadow-md hover:shadow-xl transition-shadow duration-300">
                      {/* Thumbnail */}
                      {thumbnailUrl && (
                        <Image
                          src={thumbnailUrl}
                          alt={videoTitle}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      )}

                      {/* Featured badge */}
                      {video.is_featured && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg z-20" style={{ backgroundColor: 'var(--color-accent)' }}>
                          {t('videos.featured')}
                        </div>
                      )}

                      {/* Gradient overlay - always visible */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                      {/* Enhanced gradient on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="bg-red-600 rounded-full p-3 transform transition-transform duration-300 group-hover:scale-110">
                          <PlayIcon className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>

                      {/* Content overlay at bottom - always visible */}
                      <div className="absolute inset-x-0 bottom-0 p-4 text-white z-10">
                        <h3 className="text-sm font-semibold line-clamp-2 mb-2 drop-shadow-lg">
                          {videoTitle}
                        </h3>
                        
                        <div
                          className={`flex items-center gap-2 text-xs text-white/90 ${
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

            {/* Pagination Controls */}
            <div className="flex flex-col gap-4">
                {/* All pagination elements */}
                <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-2">
                  {/* First Row: Previous */}
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

      {/* Video Popup Player */}
      <VideoPopup
        isOpen={showPopup}
        videos={videos}
        currentIndex={popupIndex}
        onClose={() => setShowPopup(false)}
        onNavigate={handlePopupNavigate}
      />
    </main>
  );
}