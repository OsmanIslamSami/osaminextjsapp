'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Slide {
  id: string;
  media_url: string;
  media_type: 'image' | 'video' | 'gif';
  title_en: string | null;
  title_ar: string | null;
  button_text_en: string | null;
  button_text_ar: string | null;
  button_url: string | null;
  show_button: boolean;
  display_order: number;
  is_visible: boolean;
}

interface HeroSliderProps {
  autoPlayInterval?: number;
}

export default function HeroSlider({ autoPlayInterval = 5000 }: HeroSliderProps) {
  const { language } = useLanguage();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const videoRefsMap = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Handle video ref callback
  const setVideoRef = useCallback((id: string, element: HTMLVideoElement | null) => {
    videoRefsMap.current[id] = element;
  }, []);

  // Play current video when slide changes
  useEffect(() => {
    if (!slides[currentIndex]) return;
    const currentSlide = slides[currentIndex];
    
    if (currentSlide.media_type === 'video') {
      const videoElement = videoRefsMap.current[currentSlide.id];
      if (videoElement) {
        // Reset and play video
        videoElement.currentTime = 0;
        videoElement.play().catch((error: unknown) => {
          console.error('Error playing video:', error);
        });
      }
    }
  }, [currentIndex, slides]);

  // Fetch slides
  useEffect(() => {
    async function fetchSlides() {
      try {
        const response = await fetch('/api/slider');
        if (!response.ok) throw new Error('Failed to fetch slides');
        const data = await response.json();
        setSlides(data.slides || []);
      } catch (error) {
        console.error('Error fetching slides:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
  }, []);

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [slides.length, autoPlayInterval, isPaused]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 animate-pulse"></div>
    );
  }

  if (slides.length === 0) {
    return null; // No slides to display
  }

  const currentSlide = slides[currentIndex];
  const title = language === 'ar' ? currentSlide.title_ar : currentSlide.title_en;
  const buttonText = language === 'ar' ? currentSlide.button_text_ar : currentSlide.button_text_en;

  return (
    <div
      className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {slide.media_type === 'video' ? (
              <video
                key={slide.id}
                ref={(el) => setVideoRef(slide.id, el)}
                src={slide.media_url}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                webkit-playsinline="true"
                x-webkit-airplay="allow"
                style={{ 
                  objectFit: 'cover',
                  backgroundColor: '#000'
                }}
                onLoadedData={(e) => {
                  // Ensure video plays when loaded, especially on mobile
                  const video = e.currentTarget;
                  if (index === currentIndex) {
                    video.play().catch((err) => console.error('Video play error:', err));
                  }
                }}
                onError={(e) => {
                  console.error('Video load error:', e);
                }}
              />
            ) : (
              <img
                src={slide.media_url}
                alt={title || 'Slide'}
                className="w-full h-full object-cover"
              />
            )}

            {/* Text overlay with glass effect */}
            {(title || (currentSlide.show_button && buttonText && currentSlide.button_url)) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-6 py-8 md:px-10 md:py-10 max-w-4xl backdrop-blur-lg rounded-lg shadow-2xl">
                  {title && (
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
                      {title}
                    </h1>
                  )}
                  {currentSlide.show_button && buttonText && currentSlide.button_url && (
                    <a
                      href={currentSlide.button_url}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 md:px-10 md:py-4 rounded-lg transition-colors min-h-[44px] flex items-center justify-center"
                    >
                      {buttonText}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 md:p-3 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 md:p-3 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                index === currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
