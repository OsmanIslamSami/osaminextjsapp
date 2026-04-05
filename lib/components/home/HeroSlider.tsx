'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Slide {
  id: string;
  media_url: string;
  media_type: 'image' | 'video' | 'gif';
  storage_type?: 'blob' | 'local';
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
  const [loadedMedia, setLoadedMedia] = useState<Set<string>>(new Set());
  const videoRefsMap = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const isRTL = language === 'ar';

  // Handle video ref callback
  const setVideoRef = useCallback((id: string, element: HTMLVideoElement | null) => {
    videoRefsMap.current[id] = element;
  }, []);

  // Mark media as loaded
  const handleMediaLoad = useCallback((slideId: string) => {
    setLoadedMedia(prev => new Set(prev).add(slideId));
  }, []);

  // Play current video when slide changes
  useEffect(() => {
    if (!slides[currentIndex]) return;
    const currentSlide = slides[currentIndex];
    
    // Pause all videos first
    Object.values(videoRefsMap.current).forEach(video => {
      if (video && !video.paused) {
        video.pause();
      }
    });
    
    // Play current video if it's a video slide
    if (currentSlide.media_type === 'video') {
      const videoElement = videoRefsMap.current[currentSlide.id];
      if (videoElement) {
        videoElement.currentTime = 0;
        // Use a timeout to ensure the video element is ready
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silently handle autoplay prevention - this is expected behavior
            // User interaction will trigger playback if needed
          });
        }
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

  // Helper function to get the correct media URL based on storage type
  const getMediaUrl = useCallback((slide: Slide) => {
    // If no storage_type is specified, assume 'blob' for backward compatibility
    const storageType = slide.storage_type || 'blob';
    
    if (storageType === 'local') {
      // Local files are served from the public directory
      return slide.media_url;
    }
    
    // Blob storage URLs are already complete URLs
    return slide.media_url;
  }, []);

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
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-white via-gray-200 to-gray-400 animate-pulse"></div>
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
      className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-white via-gray-100 to-gray-300"
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
            className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br from-white via-gray-200 to-gray-400 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Loading background - shows until media loads */}
            {!loadedMedia.has(slide.id) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white via-gray-200 to-gray-400">
                <div className="text-gray-800 text-center">
                  <div className="w-16 h-16 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg font-semibold">Loading...</p>
                </div>
              </div>
            )}
            
            {slide.media_type === 'video' ? (
              <video
                key={slide.id}
                ref={(el) => setVideoRef(slide.id, el)}
                className="w-full h-full object-cover cursor-pointer"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                crossOrigin="anonymous"
                webkit-playsinline="true"
                x-webkit-airplay="allow"
                onClick={(e) => {
                  const video = e.currentTarget;
                  if (video.paused) {
                    video.play().catch(() => {
                      // Silently handle autoplay restrictions
                    });
                  }
                }}
                style={{ 
                  objectFit: 'cover',
                  backgroundColor: '#000'
                }}
                onLoadedData={(e) => {
                  handleMediaLoad(slide.id);
                  const video = e.currentTarget;
                  if (index === currentIndex) {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                      playPromise.catch(() => {
                        // Silently handle - autoplay may be blocked by browser
                      });
                    }
                  }
                }}
              >
                <source src={getMediaUrl(slide)} type="video/mp4" />
                <source src={getMediaUrl(slide)} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={getMediaUrl(slide)}
                alt={title || 'Slide'}
                className="w-full h-full object-cover"
                loading="eager"
                onLoad={() => handleMediaLoad(slide.id)}
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
                      className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-2.5 md:px-8 md:py-3 rounded-full transition-all min-h-[44px] flex items-center justify-center text-sm md:text-base"
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
            onClick={isRTL ? goToNext : goToPrevious}
            className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 md:p-3 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center`}
            aria-label={isRTL ? 'السابق' : 'Previous slide'}
          >
            {isRTL ? (
              <ChevronRightIcon className="w-6 h-6" />
            ) : (
              <ChevronLeftIcon className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={isRTL ? goToPrevious : goToNext}
            className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 md:p-3 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center`}
            aria-label={isRTL ? 'التالي' : 'Next slide'}
          >
            {isRTL ? (
              <ChevronLeftIcon className="w-6 h-6" />
            ) : (
              <ChevronRightIcon className="w-6 h-6" />
            )}
          </button>
        </>
      )}

      {/* Navigation Dashes - Modern Design with Blue Circle */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center group"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-12 md:w-16 bg-white border border-white shadow-[0_0_0_1px_rgba(255,255,255,0.5)]'
                  : 'w-6 md:w-8 bg-white bg-opacity-50 group-hover:bg-opacity-75'
              }`}></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
