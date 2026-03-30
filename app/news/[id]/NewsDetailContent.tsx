'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface News {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  image_url: string;
  published_date: Date;
  is_visible: boolean;
  is_deleted: boolean;
}

interface NewsDetailContentProps {
  newsItem: News;
}

function getMediaUrl(url: string | null): string {
  if (!url) return '/placeholder-news.jpg';
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a local file path, prepend the uploads directory
  return `/uploads/${url}`;
}

export default function NewsDetailContent({ newsItem }: NewsDetailContentProps) {
  const { language } = useLanguage();
  
  const publishedDate = new Date(newsItem.published_date);
  const formattedDate = publishedDate.toLocaleDateString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  // Get language-aware content
  const title = language === 'ar' 
    ? (newsItem.title_ar || newsItem.title_en || 'Untitled News')
    : (newsItem.title_en || newsItem.title_ar || 'Untitled News');

  const description = language === 'ar'
    ? (newsItem.description_ar || newsItem.description_en || 'No description available.')
    : (newsItem.description_en || newsItem.description_ar || 'No description available.');

  const backText = language === 'ar' ? 'العودة إلى الرئيسية' : 'Back to Home';

  return (
    <>
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group ${
            language === 'ar' ? 'flex-row-reverse' : ''
          }`}
        >
          <ArrowLeftIcon className={`w-5 h-5 transition-transform ${
            language === 'ar' ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'
          }`} />
          <span className="font-medium">{backText}</span>
        </Link>
      </div>

      {/* News Detail Content */}
      <article className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Image */}
          <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-8">
            <Image
              src={getMediaUrl(newsItem.image_url)}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Title and Date */}
          <div className="mb-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight"
              style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
            >
              {title}
            </h1>

            {/* Published Date */}
            <div className={`flex items-center gap-2 text-gray-600 ${
              language === 'ar' ? 'flex-row-reverse justify-end' : ''
            }`}>
              <CalendarIcon className="w-5 h-5" />
              <time dateTime={publishedDate.toISOString()} className="text-lg">
                {formattedDate}
              </time>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-t-2 border-gray-200 mb-8" />

          {/* Description Content */}
          <div className="prose prose-lg max-w-none" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <p 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg"
              style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
            >
              {description}
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
