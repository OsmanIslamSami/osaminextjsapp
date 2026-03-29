'use client';

import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import NewsCard from './NewsCard';
import Link from 'next/link';

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
}

export default function NewsGridClient({ news }: NewsGridClientProps) {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

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

  // Auto-scroll animation
  useEffect(() => {
    if (!scrollContainerRef.current || isPaused || news.length === 0) return;

    const container = scrollContainerRef.current;
    const cardWidth = 320 + 24; // card width (w-80 = 320px) + gap (gap-6 = 24px)
    const maxScroll = cardWidth * news.length;
    
    const scroll = () => {
      setScrollPosition((prev) => {
        const newPosition = prev + 1;
        // Reset to start when reaching the end
        if (newPosition >= maxScroll) {
          return 0;
        }
        return newPosition;
      });
    };

    const intervalId = setInterval(scroll, 30); // Smooth 30ms interval

    return () => clearInterval(intervalId);
  }, [isPaused, news.length]);

  // Apply scroll position
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div ref={sectionRef}>
      {/* Header with title on left and button on right */}
      <div className={`flex items-center justify-between mb-8 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {language === 'ar' ? 'آخر الأخبار' : 'Latest News'}
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 mt-2">
            {language === 'ar'
              ? 'ابق على اطلاع بأحدث الأخبار والإعلانات'
              : 'Stay updated with our latest news and announcements'}
          </p>
        </div>
        <Link
          href="/news"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 whitespace-nowrap"
        >
          {language === 'ar' ? 'جميع الأخبار' : 'All News'}
        </Link>
      </div>

      {/* News cards carousel with auto-scroll */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
      >
        <div className="flex gap-6 pb-4">
          {/* Render news items twice for seamless loop */}
          {[...news, ...news].map((item, index) => (
            <div key={`${item.id}-${index}`} className="w-80 flex-shrink-0">
              <NewsCard
                news={item}
                index={index % news.length}
                isVisible={isVisible}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
