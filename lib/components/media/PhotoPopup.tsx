/**
 * Photo Popup Component
 * Full-screen photo viewer with navigation
 * Extends MediaPopup with photo-specific rendering
 */

'use client';

import Image from 'next/image';
import { MediaPopup, MediaItem } from './MediaPopup';

export interface PhotoItem extends MediaItem {
  image_url: string;
}

interface PhotoPopupProps {
  isOpen: boolean;
  photos: PhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function PhotoPopup({
  isOpen,
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: PhotoPopupProps) {
  const currentPhoto = photos[currentIndex];

  if (!currentPhoto) return null;

  return (
    <MediaPopup
      isOpen={isOpen}
      items={photos}
      currentIndex={currentIndex}
      onClose={onClose}
      onNavigate={onNavigate}
    >
      <div className="relative w-full bg-black">
        <Image
          src={currentPhoto.image_url}
          alt={currentPhoto.title_en}
          width={1200}
          height={800}
          className="w-full h-auto max-h-[70vh] object-contain"
          priority
        />
      </div>
    </MediaPopup>
  );
}
