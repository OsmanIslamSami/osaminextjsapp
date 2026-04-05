'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import Image from 'next/image';
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

interface NewsCardProps {
  news: News;
  index: number;
  isVisible: boolean;
}

function getMediaUrl(imageUrl: string, storageType: string, id: string): string {
  if (storageType === 'blob') {
    return imageUrl;
  }
  // For local storage, use the media API endpoint
  return `/api/news/media/${id}`;
}

export default function NewsCard({ news, index, isVisible }: NewsCardProps) {
  const { language } = useLanguage();

  const title =
    language === 'ar'
      ? news.title_ar || news.title_en || 'Untitled'
      : news.title_en || news.title_ar || 'Untitled';

  const imageUrl = getMediaUrl(news.image_url, news.storage_type, news.id);
  const publishedDate = new Date(news.published_date).toLocaleDateString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <Link
      href={`/news/${news.id}`}
      className={`group relative rounded-lg overflow-hidden shadow-lg transition-all duration-700 transform hover:scale-105 hover:shadow-2xl motion-reduce:transition-none motion-reduce:hover:transform-none bg-gradient-to-br from-blue-600 to-purple-600 block cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
        height: '400px',
      }}
      role="article"
      aria-label={`${language === 'ar' ? 'خبر' : 'News item'}: ${title}`}
    >
      {/* Image with fixed height */}
      <div className="relative h-full w-full bg-gradient-to-br from-blue-500 to-purple-500">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          loading="lazy"
          sizes="400px"
          unoptimized={news.storage_type === 'blob'}
          onError={(e) => {
            console.error('Image failed to load:', imageUrl);
            // Hide the failed image element
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        
        {/* Gradient overlay - always visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Enhanced gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Content overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-white z-10">
          <h3
            className="text-2xl font-bold mb-3 drop-shadow-lg"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
          >
            {title}
          </h3>
          
          <div
            className={`flex items-center gap-2 text-sm text-white/90 ${
              language === 'ar' ? 'flex-row-reverse justify-end' : ''
            }`}
            aria-label={`${language === 'ar' ? 'تاريخ النشر' : 'Published date'}: ${publishedDate}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="drop-shadow-md">{publishedDate}</span>
          </div>
        </div>

        {/* Hover indicator with accent color */}
        <div
          className="absolute top-4 right-4 text-white px-4 py-2 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 motion-reduce:opacity-0 shadow-lg"
          style={{ backgroundColor: 'var(--color-accent)' }}
          aria-hidden="true"
        >
          {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
        </div>
      </div>
    </Link>
  );
}
