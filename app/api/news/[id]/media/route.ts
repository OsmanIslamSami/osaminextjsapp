import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/news/media/[id]
 * Serve locally-stored images
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const news = await prisma.news.findUnique({
      where: { id },
      select: {
        file_data: true,
        mime_type: true,
        storage_type: true,
      },
    });

    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    if (news.storage_type !== 'local' || !news.file_data) {
      return NextResponse.json(
        { error: 'Image not available locally' },
        { status: 404 }
      );
    }

    // Set caching headers for immutable content
    const headers = new Headers();
    headers.set('Content-Type', news.mime_type || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(news.file_data, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error serving media:', error);
    return NextResponse.json(
      { error: 'Failed to serve media' },
      { status: 500 }
    );
  }
}
