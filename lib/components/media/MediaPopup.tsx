/**
 * Base Media Popup Component
 * Full-screen modal with keyboard navigation and RTL support
 * Extended by PhotoPopup and VideoPopup
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRTLDirection } from '@/lib/hooks/useRTLDirection';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { createPortal } from 'react-dom';

export interface MediaItem {
  id: string;
  title_en: string;
  title_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
}

interface MediaPopupProps {
  isOpen: boolean;
  items: MediaItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  children: ReactNode; // Media content (image, video, etc.)
  showNavigation?: boolean;
}

export function MediaPopup({
  isOpen,
  items,
  currentIndex,
  onClose,
  onNavigate,
  children,
  showNavigation = true,
}: MediaPopupProps) {
  const isRTL = useRTLDirection();
  const { t, direction } = useTranslation();
  const language = direction === 'rtl' ? 'ar' : 'en';

  const currentItem = items[currentIndex];
  const title = isRTL ? currentItem?.title_ar : currentItem?.title_en;
  const description = isRTL 
    ? currentItem?.description_ar 
    : currentItem?.description_en;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyboard = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (showNavigation) {
            // In RTL: Left arrow = next, Right arrow = previous
            onNavigate(isRTL ? 'next' : 'prev');
          }
          break;
        case 'ArrowRight':
          if (showNavigation) {
            onNavigate(isRTL ? 'prev' : 'next');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isOpen, isRTL, onClose, onNavigate, showNavigation]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !currentItem) return null;

  const popupContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-popup-title"
    >
      <div
        className="relative max-w-7xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
          aria-label={t('popup.close') || 'Close'}
        >
          <XMarkIcon className="w-8 h-8" />
        </button>

        {/* Navigation buttons */}
        {showNavigation && items.length > 1 && (
          <>
            <button
              onClick={() => onNavigate('prev')}
              className={`absolute top-1/2 -translate-y-1/2 ${
                isRTL ? 'right-4' : 'left-4'
              } z-10 text-white hover:text-gray-300 transition-all hover:scale-110 bg-black/50 rounded-full p-2`}
              aria-label={t('popup.previous') || 'Previous'}
            >
              {isRTL ? (
                <ChevronRightIcon className="w-12 h-12" />
              ) : (
                <ChevronLeftIcon className="w-12 h-12" />
              )}
            </button>
            <button
              onClick={() => onNavigate('next')}
              className={`absolute top-1/2 -translate-y-1/2 ${
                isRTL ? 'left-4' : 'right-4'
              } z-10 text-white hover:text-gray-300 transition-all hover:scale-110 bg-black/50 rounded-full p-2`}
              aria-label={t('popup.next') || 'Next'}
            >
              {isRTL ? (
                <ChevronLeftIcon className="w-12 h-12" />
              ) : (
                <ChevronRightIcon className="w-12 h-12" />
              )}
            </button>
          </>
        )}

        {/* Media content container */}
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
          {/* Media content (image, video, etc.) */}
          {children}

          {/* Title, description, and counter */}
          <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 id="media-popup-title" className="text-2xl font-bold mb-2 text-gray-900">
              {title}
            </h2>
            {description && (
              <p className="text-gray-600 leading-relaxed">{description}</p>
            )}
            {items.length > 1 && (
              <p className="text-sm text-gray-400 mt-4">
                {currentIndex + 1} / {items.length}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render popup using portal to document.body
  if (typeof window !== 'undefined') {
    return createPortal(popupContent, document.body);
  }

  return null;
}
