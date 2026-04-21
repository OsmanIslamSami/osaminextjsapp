import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

// GET /api/slider/media/[id] - Serve local media files from database
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const slide = await prisma.sliderContent.findFirst({
      where: {
        id: id,
        storage_type: 'local',
        is_deleted: false,
      },
      select: {
        file_data: true,
        mime_type: true,
        file_name: true,
      },
    });

    if (!slide || !slide.file_data || !slide.mime_type) {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      );
    }

    // Return the file with appropriate headers
    return new NextResponse(slide.file_data, {
      status: 200,
      headers: {
        'Content-Type': slide.mime_type,
        'Content-Disposition': `inline; filename="${slide.file_name || 'media'}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    logger.error('Error serving media file:', error);
    return NextResponse.json(
      { error: 'Failed to serve media file' },
      { status: 500 }
    );
  }
}