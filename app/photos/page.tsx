/**
 * Photos Gallery Page
 * Grid layout displaying all visible photos with pagination
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRTLDirection } from '@/lib/hooks/useRTLDirection';
import { PhotoPopup, PhotoItem } from '@/lib/components/media/PhotoPopup';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PhotosGalleryPage() {
  const { language } = useLanguage();
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

  const title = language === 'ar' ? 'معرض الصور' : 'Photos Gallery';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{title}</h1>

        {photos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {language === 'ar' ? 'لا توجد صور متاحة' : 'No photos available'}
            </p>
          </div>
        ) : (
          <>
            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {photos.map((photo, index) => {
                const photoTitle = language === 'ar' ? photo.title_ar : photo.title_en;
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="font-semibold line-clamp-2">{photoTitle}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {language === 'ar' ? 'السابق' : 'Previous'}
                </button>
                
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
