import NewsGridClient from './NewsGridClient';
import { prisma } from '@/lib/db';

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

async function getNews(): Promise<News[]> {
  try {
    // Query database directly instead of fetching API
    const news = await prisma.news.findMany({
      where: {
        is_visible: true,
      },
      orderBy: [
        { published_date: 'desc' },
        { created_at: 'desc' },
      ],
      take: 6,
      select: {
        id: true,
        title_en: true,
        title_ar: true,
        image_url: true,
        storage_type: true,
        published_date: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    console.log('[NewsSection Server] Fetched news:', news.length, 'items');
    return news;
  } catch (error) {
    console.error('[NewsSection] Error fetching news:', error);
    return [];
  }
}

export default async function NewsSection() {
  const news = await getNews();

  console.log('[NewsSection Server] Rendering with', news.length, 'news items');

  if (news.length === 0) {
    console.log('[NewsSection Server] No news to display, returning null');
    return null; // Don't show the section if there's no news
  }

  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-zinc-950">
      <div className="container mx-auto max-w-7xl">
        <NewsGridClient news={news} />
      </div>
    </section>
  );
}
