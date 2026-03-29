import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { LanguageSwitcher } from '@/lib/components/LanguageSwitcher';
import { prisma } from '@/lib/db';

interface NewsDetailPageProps {
  params: Promise<{ id: string }>;
}

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

async function getNewsItem(id: string): Promise<News | null> {
  try {
    const newsItem = await prisma.news.findUnique({
      where: { id },
      select: {
        id: true,
        title_en: true,
        title_ar: true,
        description_en: true,
        description_ar: true,
        image_url: true,
        published_date: true,
        is_visible: true,
        is_deleted: true,
      },
    });

    return newsItem;
  } catch (error) {
    console.error('Error fetching news item:', error);
    return null;
  }
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

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { id } = await params;
  const newsItem = await getNewsItem(id);

  if (!newsItem || newsItem.is_deleted || !newsItem.is_visible) {
    notFound();
  }

  const publishedDate = new Date(newsItem.published_date);
  const formattedDate = publishedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Language Switcher */}
      <div className="container mx-auto px-4 py-4">
        <LanguageSwitcher />
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>

      {/* News Detail Content */}
      <article className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Image */}
          <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-8">
            <Image
              src={getMediaUrl(newsItem.image_url)}
              alt={newsItem.title_en || 'News image'}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Title and Date */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {newsItem.title_en || newsItem.title_ar || 'Untitled News'}
            </h1>

            {/* Published Date */}
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="w-5 h-5" />
              <time dateTime={publishedDate.toISOString()} className="text-lg">
                {formattedDate}
              </time>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-t-2 border-gray-200 mb-8" />

          {/* Description Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
              {newsItem.description_en || newsItem.description_ar || 'No description available.'}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: NewsDetailPageProps) {
  const { id } = await params;
  const newsItem = await getNewsItem(id);

  if (!newsItem) {
    return {
      title: 'News Not Found',
    };
  }

  return {
    title: newsItem.title_en || newsItem.title_ar || 'News Detail',
    description: newsItem.description_en?.substring(0, 160) || newsItem.description_ar?.substring(0, 160) || 'Read more about this news item',
  };
}
