import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/magazines/media/[id]
 * Retrieve magazine cover image from database (local storage)
 * Auth: Public (magazine covers are publicly viewable)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Find magazine by ID
    const magazine = await prisma.magazine.findFirst({
      where: {
        id,
        is_deleted: false,
        storage_type: 'local',
      },
      select: {
        id: true,
        file_data: true,
        mime_type: true,
        file_name: true,
      }
    });
    
    if (!magazine) {
      return NextResponse.json(
        { error: 'Magazine not found or uses external storage' },
        { status: 404 }
      );
    }
    
    if (!magazine.file_data) {
      return NextResponse.json(
        { error: 'No local file data available' },
        { status: 404 }
      );
    }
    
    // Return the image with proper content type
    return new NextResponse(magazine.file_data, {
      status: 200,
      headers: {
        'Content-Type': magazine.mime_type || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${magazine.file_name || 'cover.jpg'}"`,
      },
    });
    
  } catch (error) {
    console.error('Error retrieving magazine cover:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve magazine cover' },
      { status: 500 }
    );
  }
}
