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
    const newsItems = await prisma.news.findMany({
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
    
    // Map to ensure proper typing
    const news: News[] = newsItems.map(item => ({
      id: item.id,
      title_en: item.title_en,
      title_ar: item.title_ar,
      image_url: item.image_url,
      storage_type: item.storage_type as 'blob' | 'local',
      published_date: item.published_date.toISOString(),
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
    }));
    
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
