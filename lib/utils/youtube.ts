/**
 * YouTube Utility Functions
 * For extracting video IDs, validating URLs, and generating embed URLs
 */

/**
 * Extracts YouTube video ID from various URL formats
 * Supports: watch?v=, youtu.be/, and embed/ URLs
 */
export function extractYouTubeVideoId(url: string): string | null {
  // Pattern 1: watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  
  // Pattern 2: youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  
  // Pattern 3: embed/VIDEO_ID
  const embedMatch = url.match(/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];
  
  return null;
}

/**
 * Validates if a URL is a valid YouTube URL
 */
export function validateYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
  ];
  return patterns.some(pattern => pattern.test(url));
}

/**
 * Generates YouTube embed URL from video ID
 * Includes enablejsapi for iframe API support
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
}

/**
 * Generates YouTube thumbnail URL from video ID
 * Uses maxresdefault for highest quality
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'maxres'): string {
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    mq: 'mqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}
