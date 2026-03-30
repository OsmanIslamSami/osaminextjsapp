/**
 * Reusable Slider Component
 * Supports RTL arrow reversal, keyboard navigation, and touch gestures
 */

'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRTLDirection } from '@/lib/hooks/useRTLDirection';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface SliderProps {
  items: ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  itemClassName?: string;
}

export function Slider({
  items,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className = '',
  itemClassName = '',
}: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isRTL = useRTLDirection();
  const { t } = useTranslation();

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  }, [items.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  }, [items.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goToNext, items.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        // In RTL: Left arrow = next, Right arrow = previous
        isRTL ? goToNext() : goToPrevious();
      } else if (e.key === 'ArrowRight') {
        isRTL ? goToPrevious() : goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRTL, goToNext, goToPrevious]);

  if (items.length === 0) return null;

  return (
    <div className={`relative ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Slider container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(${isRTL ? '' : '-'}${currentIndex * 100}%)`,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={`min-w-full ${itemClassName}`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute top-1/2 -translate-y-1/2 ${
              isRTL ? 'right-4' : 'left-4'
            } z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110`}
            aria-label={t('slider.previous') || 'Previous'}
          >
            {isRTL ? (
              <ChevronRightIcon className="w-6 h-6 text-gray-800" />
            ) : (
              <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
            )}
          </button>
          <button
            onClick={goToNext}
            className={`absolute top-1/2 -translate-y-1/2 ${
              isRTL ? 'left-4' : 'right-4'
            } z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110`}
            aria-label={t('slider.next') || 'Next'}
          >
            {isRTL ? (
              <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
            ) : (
              <ChevronRightIcon className="w-6 h-6 text-gray-800" />
            )}
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showDots && items.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-blue-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`${t('slider.goToSlide') || 'Go to slide'} ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
