'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';

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
  const [firstSlideLoaded, setFirstSlideLoaded] = useState(false);
  const videoRefsMap = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const isRTL = language === 'ar';

  // Handle video ref callback
  const setVideoRef = useCallback((id: string, element: HTMLVideoElement | null) => {
    videoRefsMap.current[id] = element;
  }, []);

  // Mark first slide as loaded
  const handleFirstSlideLoad = useCallback(() => {
    setFirstSlideLoaded(true);
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

  // Fallback: Remove skeleton after 5 seconds even if video hasn't loaded
  // This prevents infinite loading states on slow connections
  useEffect(() => {
    if (!loading && !firstSlideLoaded) {
      const fallbackTimer = setTimeout(() => {
        console.warn('Slider skeleton removed by fallback timeout (5s)');
        setFirstSlideLoaded(true);
      }, 5000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [loading, firstSlideLoaded]);

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
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-50 dark:bg-gray-950 overflow-hidden">
        {/* Skeleton content */}
        <div className="flex flex-col items-center justify-center h-full space-y-6 px-8">
          {/* Simulated video/media player icon with pulse animation */}
          <div className="relative">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-300 dark:border-gray-700 animate-pulse">
              <svg className="w-10 h-10 md:w-14 md:h-14 text-gray-400 dark:text-gray-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
            {/* Pulsing ring around icon */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-300 dark:border-gray-700 animate-ping opacity-75"></div>
          </div>
          
          {/* Skeleton text bars */}
          <div className="space-y-4 w-full max-w-lg">
            <div className="h-8 md:h-12 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4 mx-auto skeleton animate-shimmer"></div>
            <div className="h-6 md:h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2 mx-auto skeleton animate-shimmer" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-2/3 mx-auto skeleton animate-shimmer" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          {/* Loading progress indicator */}
          <div className="w-full max-w-xs mt-8">
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 text-sm md:text-base mb-3">
              <LoadingSpinner size="sm" />
              <span className="font-medium">Loading slider...</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-shimmer rounded-full" style={{ width: '60%', animationDuration: '2s' }}></div>
            </div>
          </div>
        </div>
      </div>
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
      className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-100 dark:bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isCurrentSlide = index === currentIndex;
          const isNextSlide = index === (currentIndex + 1) % slides.length;
          const isFirstSlide = index === 0;
          const showLoading = isFirstSlide && !firstSlideLoaded && !loading;
          
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isCurrentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Skeleton Loader - only show for first slide on initial load */}
              {showLoading && (
                <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-20">
                  {/* Skeleton content */}
                  <div className="flex flex-col items-center justify-center h-full space-y-6 px-8">
                    {/* Simulated video/media player icon with pulse animation */}
                    <div className="relative">
                      <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-300 dark:border-gray-700 animate-pulse">
                        {slide.media_type === 'video' ? (
                          <svg className="w-10 h-10 md:w-14 md:h-14 text-gray-400 dark:text-gray-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        ) : (
                          <svg className="w-10 h-10 md:w-14 md:h-14 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      {/* Pulsing ring around icon */}
                      <div className="absolute inset-0 rounded-full border-4 border-gray-300 dark:border-gray-700 animate-ping opacity-75"></div>
                    </div>
                    
                    {/* Skeleton text bars */}
                    <div className="space-y-4 w-full max-w-lg">
                      <div className="h-8 md:h-12 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4 mx-auto skeleton animate-shimmer"></div>
                      <div className="h-6 md:h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2 mx-auto skeleton animate-shimmer" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-2/3 mx-auto skeleton animate-shimmer" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    
                    {/* Loading progress indicator */}
                    <div className="w-full max-w-xs mt-8">
                      <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 text-sm md:text-base mb-3">
                        <LoadingSpinner size="sm" />
                        <span className="font-medium">
                          {slide.media_type === 'video' ? 'Loading video...' : 'Loading image...'}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-shimmer rounded-full" style={{ width: '60%', animationDuration: '2s' }}></div>
                      </div>
                    </div>
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
                preload={isFirstSlide ? "auto" : isCurrentSlide || isNextSlide ? "metadata" : "none"}
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
                onLoadedMetadata={(e) => {
                  // Fire as soon as metadata is available (1-2 seconds instead of 40)
                  if (isFirstSlide) handleFirstSlideLoad();
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
                onError={() => {
                  // Hide skeleton even if video fails to load
                  if (isFirstSlide) {
                    console.error('Video failed to load, removing skeleton');
                    handleFirstSlideLoad();
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
                loading={isFirstSlide ? "eager" : isCurrentSlide || isNextSlide ? "eager" : "lazy"}
                onLoad={() => {
                  if (isFirstSlide) handleFirstSlideLoad();
                }}
                onError={() => {
                  // Hide skeleton even if image fails to load
                  if (isFirstSlide) {
                    console.error('Image failed to load, removing skeleton');
                    handleFirstSlideLoad();
                  }
                }}
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
        );
        })}
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
