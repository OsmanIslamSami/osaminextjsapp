'use client';

import { useRef, useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import NewsCard from './NewsCard';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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

interface NewsGridClientProps {
  news: News[];
  title?: {
    en: string | null;
    ar: string | null;
  };
}

export default function NewsGridClient({ news, title }: NewsGridClientProps) {
  const { t, language } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(3); // Default to desktop view

  // Detect screen size and update cards per view
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth >= 1024) {
        setCardsPerView(3); // Desktop: 3 cards
      } else if (window.innerWidth >= 768) {
        setCardsPerView(2); // Tablet: 2 cards
      } else {
        setCardsPerView(1); // Mobile: 1 card
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Calculate max index based on cards per view
  const maxIndex = Math.max(0, news.length - cardsPerView);

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

  // Auto-advance to next card (one card at a time)
  useEffect(() => {
    if (isPaused || news.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => {
        // Loop back to start after reaching the max valid index
        if (prev >= maxIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, 5000); // Change card every 5 seconds

    return () => clearInterval(intervalId);
  }, [isPaused, news.length, maxIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return maxIndex;
      }
      return prev - 1;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= maxIndex) {
        return 0;
      }
      return prev + 1;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  // Determine if RTL mode
  const isRTL = language === 'ar';

  // Get section title in current language or use translation fallback
  const sectionTitle = 
    language === 'ar' 
      ? (title?.ar || t('home.latestNews')) 
      : (title?.en || t('home.latestNews'));

  return (
    <div ref={sectionRef}>
      {/* Header with title on left and button on right */}
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
            {t('home.latestNewsSubtitle')}
          </p>
        </div>
        <Link
          href="/news"
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
          {t('home.viewAllNews')}
        </Link>
      </div>

      {/* News cards carousel - 6 cards with card-by-card sliding animation */}
      <div 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Carousel container */}
        <div 
          ref={carouselRef}
          className="flex transition-transform duration-700 ease-in-out gap-6"
          style={{ 
            transform: isRTL 
              ? `translateX(calc(${currentIndex * (100 / cardsPerView)}% + ${currentIndex * (24 / cardsPerView)}px))`
              : `translateX(calc(-${currentIndex * (100 / cardsPerView)}% - ${currentIndex * (24 / cardsPerView)}px))`
          }}
        >
          {news.map((item, index) => (
            <div 
              key={item.id} 
              className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-shrink-0"
            >
              <NewsCard
                news={item}
                index={index}
                isVisible={isVisible}
              />
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        {news.length > 1 && (
          <>
            <button
              onClick={isRTL ? goToNext : goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('slider.previous')}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={isRTL ? goToPrevious : goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('slider.next')}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
