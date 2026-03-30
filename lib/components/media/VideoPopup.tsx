/**
 * Video Popup Component
 * Full-screen YouTube video player with navigation
 * Extends MediaPopup with YouTube iframe embedding
 */

'use client';

import { MediaPopup, MediaItem } from './MediaPopup';
import { getYouTubeEmbedUrl } from '@/lib/utils/youtube';

export interface VideoItem extends MediaItem {
  youtube_url: string;
  video_id: string | null;
  thumbnail_url?: string | null;
}

interface VideoPopupProps {
  isOpen: boolean;
  videos: VideoItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function VideoPopup({
  isOpen,
  videos,
  currentIndex,
  onClose,
  onNavigate,
}: VideoPopupProps) {
  const currentVideo = videos[currentIndex];

  if (!currentVideo || !currentVideo.video_id) return null;

  const embedUrl = getYouTubeEmbedUrl(currentVideo.video_id);

  return (
    <MediaPopup
      isOpen={isOpen}
      items={videos}
      currentIndex={currentIndex}
      onClose={onClose}
      onNavigate={onNavigate}
    >
      <div className="relative w-full aspect-video bg-black">
        <iframe
          src={`${embedUrl}&autoplay=1`}
          title={currentVideo.title_en}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </MediaPopup>
  );
}
