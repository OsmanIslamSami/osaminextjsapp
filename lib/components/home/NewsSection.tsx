import NewsGridClient from './NewsGridClient';

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
    // Using full URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/news?limit=6`, {
      cache: 'no-store', // Always get fresh data
    });
    
    if (!response.ok) {
      console.error('[NewsSection] Failed to fetch news:', response.status);
      return [];
    }
    
    const data = await response.json();
    console.log('[NewsSection Server] Fetched news:', data.news?.length || 0, 'items');
    return data.news || [];
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
