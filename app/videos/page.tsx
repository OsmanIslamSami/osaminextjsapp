/**
 * Videos Gallery Page
 * Grid layout displaying all visible videos with pagination
 * Each video shows thumbnail with play button overlay
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlayIcon } from '@heroicons/react/24/solid';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRTLDirection } from '@/lib/hooks/useRTLDirection';
import { VideoPopup, VideoItem } from '@/lib/components/media/VideoPopup';
import { getYouTubeThumbnailUrl } from '@/lib/utils/youtube';

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
  const { language } = useLanguage();
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
  const title = language === 'ar' ? 'معرض الفيديوهات' : 'Videos Gallery';

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
        console.error('Failed to fetch videos:', error);
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{title}</h1>

        {/* Empty State */}
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <PlayIcon className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">
              {language === 'ar' ? 'لا توجد فيديوهات متاحة' : 'No videos available'}
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

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 rounded-full p-3 transform transition-transform duration-300 group-hover:scale-110">
                          <PlayIcon className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>

                      {/* Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="text-white text-sm font-semibold line-clamp-2">
                          {videoTitle}
                        </h3>
                      </div>
                    </div>

                    {/* Title Below Card */}
                    <h3 className="mt-2 font-semibold text-gray-900 line-clamp-2">
                      {videoTitle}
                    </h3>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {language === 'ar' ? 'السابق' : 'Previous'}
                </button>
                
                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        page === pagination.page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              </div>
            )}
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
