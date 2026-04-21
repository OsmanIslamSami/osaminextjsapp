import { notFound } from 'next/navigation';
import { LanguageSwitcher } from '@/lib/components/LanguageSwitcher';
import { prisma } from '@/lib/db';
import NewsDetailContent from './NewsDetailContent';
import { logger } from '@/lib/utils/logger';

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
    logger.error('Error fetching news item:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Language Switcher */}
      <div className="container mx-auto px-4 py-4">
        <LanguageSwitcher />
      </div>

      {/* News Detail Content - Client Component for language-aware rendering */}
      <NewsDetailContent newsItem={newsItem} />
    </div>
  );
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: NewsDetailPageProps) {
  const { id } = await params;
  const newsItem = await getNewsItem(id);

  if (!newsItem) {
    return {
      title: 'News Not Found',
    };
  }

  const title = newsItem.title_en || newsItem.title_ar || 'News Detail';
  const description = newsItem.description_en?.substring(0, 160) || newsItem.description_ar?.substring(0, 160) || 'Read more about this news item';
  const imageUrl = getMediaUrl(newsItem.image_url);
  const publishedDate = new Date(newsItem.published_date);

  return {
    title,
    description,
    keywords: ['news', 'updates', 'announcements', 'next app'],
    authors: [{ name: 'Next App Team' }],
    
    // Open Graph metadata for social media
    openGraph: {
      type: 'article',
      locale: 'en_US',
      alternateLocale: ['ar_SA'],
      url: `/news/${id}`,
      siteName: 'Next App',
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: publishedDate.toISOString(),
    },
    
    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@nextapp',
    },
    
    // Additional metadata
    robots: {
      index: true,
      follow: true,
    },
  };
}