import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: {
        is_deleted: false,
        is_visible: true,
      },
      orderBy: {
        published_date: 'desc',
      },
      take: 6,
    });

    console.log('Test API - Found news:', news.length);
    console.log('Test API - News items:', news.map(n => ({
      id: n.id,
      title: n.title_en,
      published: n.published_date,
    })));

    return NextResponse.json({ news, count: news.length });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
