/**
 * Partners Section Component
 * Displays 6 partner logos in a carousel on home page
 * Card-by-card auto-sliding animation with News section layout style
 * Shows logo only, title appears on hover
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PartnerItem {
  id: string;
  title_en: string;
  title_ar: string;
  url?: string | null;
  image_url: string;
}

interface PartnersSectionProps {
  partners: PartnerItem[];
  title?: { en?: string | null; ar?: string | null };
}

/**
 * PartnersSection Component
 * 
 * Displays partner logos in a carousel on the home page.
 * Partners with URLs are clickable and open in a new tab.
 * 
 * Features:
 * - 6 partners in responsive carousel (3/2/1 per view)
 * - Card-by-card auto-advance every 5 seconds
 * - Gradient title and button matching News section
 * - Logo display with title overlay on hover
 * - Navigation arrows and dot indicators
 * - Fade-in animations on scroll
 * - RTL layout support
 */
export function PartnersSection({ partners, title }: PartnersSectionProps) {
  const { language } = useLanguage();
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

  const maxIndex = Math.max(0, partners.length - cardsPerView);

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
    if (isPaused || partners.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isPaused, partners.length, maxIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  // Get section title in current language or use default
  const sectionTitle =
    language === 'ar' 
      ? (title?.ar || 'شركاؤنا') 
      : (title?.en || 'Our Partners');

  // Don't render if no partners
  if (partners.length === 0) return null;

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
              {language === 'ar'
                ? 'تعرف على شركائنا الموثوقين'
                : 'Meet our trusted partners'}
            </p>
          </div>
          <Link
            href="/partners"
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
            {language === 'ar' ? 'جميع الشركاء' : 'All Partners'}
          </Link>
        </div>

        {/* Partners carousel */}
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
            {partners.map((partner, index) => {
              const partnerName = language === 'ar' ? partner.title_ar : partner.title_en;
              
              const cardContent = (
                <div
                  className={`flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] transition-all duration-700 ${
                    isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ 
                    transitionDelay: `${(index % cardsPerView) * 100}ms`,
                  }}
                >
                  <div className="group bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 cursor-pointer aspect-[16/9] relative">
                    {/* Partner Logo */}
                    <div className="absolute inset-0 p-6 flex items-center justify-center">
                      <div className="relative w-full h-full">
                        <Image
                          src={partner.image_url}
                          alt={partnerName}
                          fill
                          className="object-contain transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </div>

                    {/* Title overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                      <h3 className="text-white font-bold text-xl text-center">
                        {partnerName}
                      </h3>
                    </div>
                  </div>
                </div>
              );

              // If partner has URL, make it clickable
              if (partner.url) {
                return (
                  <a
                    key={partner.id}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contents"
                  >
                    {cardContent}
                  </a>
                );
              }

              // Otherwise, return non-clickable card
              return <div key={partner.id} className="contents">{cardContent}</div>;
            })}
          </div>

          {/* Navigation arrows */}
          {partners.length > cardsPerView && (
            <>
              <button
                onClick={isRTL ? goToNext : goToPrevious}
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isRTL ? 'right-4' : 'left-4'
                } z-10 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800 p-3 rounded-full shadow-lg transition-all hover:scale-110`}
                aria-label={language === 'ar' ? 'السابق' : 'Previous'}
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
                aria-label={language === 'ar' ? 'التالي' : 'Next'}
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
    </section>
  );
}
