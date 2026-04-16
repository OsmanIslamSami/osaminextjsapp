/**
 * Photos Section Component
 * Displays 6 featured photos in a carousel on home page
 * Card-by-card auto-sliding animation with News section layout style
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { PhotoPopup, PhotoItem } from '@/lib/components/media/PhotoPopup';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PhotosSectionProps {
  photos: PhotoItem[];
  title?: { en?: string | null; ar?: string | null };
}

export function PhotosSection({ photos, title }: PhotosSectionProps) {
  const { t, language } = useTranslation();
  const [showPopup, setShowPopup] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(3);
  const sectionRef = useRef<HTMLDivElement>(null);

  const isRTL = language === 'ar';

  // Detect screen size and update cards per view
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth >= 1024) {
        setCardsPerView(3);
      } else if (window.innerWidth >= 768) {
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, photos.length - cardsPerView);

  // Intersection Observer for fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (isPaused || photos.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isPaused, photos.length, maxIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

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

  if (photos.length === 0) return null;

  // Get section title in current language or use translation fallback
  const sectionTitle =
    language === 'ar' 
      ? (title?.ar || t('home.photos')) 
      : (title?.en || t('home.photos'));

  return (
    <section className="py-16 px-4 bg-white dark:bg-zinc-900">
      <div className="container mx-auto max-w-7xl" ref={sectionRef}>
        {/* Header with title and button */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <div>
            <h2 
              className="text-4xl font-bold"
              style={{
                color: 'var(--color-primary)',
              }}
            >
              {sectionTitle}
            </h2>
            <p className="text-gray-600 dark:text-zinc-400 mt-2">
              {t('home.photosSubtitle')}
            </p>
          </div>
          <Link
            href="/photos"
            className="inline-block text-white px-6 py-2.5 rounded-full font-medium transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 whitespace-nowrap w-fit text-sm"
            style={{
              backgroundColor: 'var(--color-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }}
          >
            {t('home.viewAllPhotos')}
          </Link>
        </div>

        {/* Photos carousel */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div 
            className="flex transition-transform duration-700 ease-in-out gap-6"
            style={{ 
              transform: isRTL 
                ? `translateX(calc(${currentIndex * (100 / cardsPerView)}% + ${currentIndex * (24 / cardsPerView)}px))`
                : `translateX(calc(-${currentIndex * (100 / cardsPerView)}% - ${currentIndex * (24 / cardsPerView)}px))`
            }}
          >
            {photos.map((photo, index) => {
              const photoTitle = language === 'ar' ? photo.title_ar : photo.title_en;
              const photoDescription = language === 'ar' ? photo.description_ar : photo.description_en;
              
              return (
                <div
                  key={photo.id}
                  className={`flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] transition-all duration-700 ${
                    isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ 
                    transitionDelay: `${(index % cardsPerView) * 100}ms`,
                  }}
                >
                  <div 
                    className="group bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                    onClick={() => handlePhotoClick(index)}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={photo.image_url}
                        alt={photoTitle}
                        fill
                        className="object-cover transform transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-2 line-clamp-2">
                        {photoTitle}
                      </h3>
                      {photoDescription && (
                        <p className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-2">
                          {photoDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation arrows */}
          {photos.length > cardsPerView && (
            <>
              <button
                onClick={isRTL ? goToNext : goToPrevious}
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isRTL ? 'right-4' : 'left-4'
                } z-10 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800 p-3 rounded-full shadow-lg transition-all hover:scale-110`}
                aria-label={t('slider.previous')}
              >
                {isRTL ? (
                  <ChevronRightIcon className="w-6 h-6 text-gray-800 dark:text-zinc-100" />
                ) : (
                  <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-zinc-100" />
                )}
              </button>
              <button
                onClick={isRTL ? goToPrevious : goToNext}
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isRTL ? 'left-4' : 'right-4'
                } z-10 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800 p-3 rounded-full shadow-lg transition-all hover:scale-110`}
                aria-label={t('slider.next')}
              >
                {isRTL ? (
                  <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-zinc-100" />
                ) : (
                  <ChevronRightIcon className="w-6 h-6 text-gray-800 dark:text-zinc-100" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Photo Popup */}
      <PhotoPopup
        isOpen={showPopup}
        photos={photos}
        currentIndex={popupIndex}
        onClose={() => setShowPopup(false)}
        onNavigate={handlePopupNavigate}
      />
    </section>
  );
}
