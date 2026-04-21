import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';
import { extractYouTubeVideoId, validateYouTubeUrl } from '@/lib/utils/youtube';
import { logger } from '@/lib/utils/logger';

// GET /api/videos - List videos or get single video by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const context = searchParams.get('context') || 'admin';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || (context === 'admin' ? '50' : '20'));

    // Single video by ID
    if (id) {
      const video = await prisma.videos.findUnique({
        where: { id },
        include: {
          createdByUser: {
            select: { name: true, email: true },
          },
          updatedByUser: {
            select: { name: true, email: true },
          },
        },
      });

      if (!video) {
        return NextResponse.json(
          { success: false, error: 'Video not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: video });
    }

    // List videos based on context
    let where: Record<string, unknown> = {};
    let orderBy: Record<string, string> | Record<string, string>[] = {};
    let take = limit;

    if (context === 'home') {
      // Home page: 6 featured-first, visible, published videos
      where = {
        is_deleted: false,
        is_visible: true,
        published_date: { lte: new Date() },
      };
      orderBy = [
        { is_featured: 'desc' },
        { published_date: 'desc' },
      ];
      take = 6;
    } else if (context === 'gallery') {
      // Gallery page: visible, published videos, paginated
      where = {
        is_deleted: false,
        is_visible: true,
        published_date: { lte: new Date() },
      };
      orderBy = { published_date: 'desc' };
    } else {
      // Admin context
      where = { is_deleted: false };
      orderBy = { created_at: 'desc' };
    }

    const [videos, total] = await Promise.all([
      prisma.videos.findMany({
        where,
        orderBy,
        take,
        skip: (page - 1) * take,
        include: {
          createdByUser: {
            select: { name: true, email: true },
          },
          updatedByUser: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.videos.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: videos,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    logger.error('Videos GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// POST /api/videos - Create new video
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Look up the database user ID from Clerk user ID
    const dbUser = await prisma.user.findUnique({
      where: { clerk_user_id: session.userId },
      select: { id: true }
    });

    const contentType = request.headers.get('content-type') || '';
    let data: Record<string, unknown> = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = {
        title_en: formData.get('title_en') as string,
        title_ar: formData.get('title_ar') as string,
        description_en: formData.get('description_en') as string | null,
        description_ar: formData.get('description_ar') as string | null,
        youtube_url: formData.get('youtube_url') as string,
        thumbnail: formData.get('thumbnail') as File | null,
        thumbnail_url: formData.get('thumbnail_url') as string | null,
        is_featured: formData.get('is_featured') === 'true',
        is_visible: formData.get('is_visible') !== 'false',
        published_date: formData.get('published_date')
          ? new Date(formData.get('published_date') as string)
          : new Date(),
      };
    } else {
      data = await request.json();
      data.published_date =
        typeof data.published_date === 'string' || typeof data.published_date === 'number'
          ? new Date(data.published_date)
          : new Date();
      data.is_visible = data.is_visible !== false;
    }

    // Validation
    if (!data.title_en || !data.title_ar) {
      return NextResponse.json(
        { success: false, error: 'Titles (EN/AR) are required' },
        { status: 400 }
      );
    }

    if (!data.youtube_url) {
      return NextResponse.json(
        { success: false, error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    if (!validateYouTubeUrl(data.youtube_url)) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL format' },
        { status: 400 }
      );
    }

    // Extract video ID
    const video_id = extractYouTubeVideoId(data.youtube_url);
    if (!video_id) {
      return NextResponse.json(
        { success: false, error: 'Could not extract video ID from YouTube URL' },
        { status: 400 }
      );
    }

    // Upload thumbnail if provided
    let thumbnail_url = data.thumbnail_url;
    let storage_type = 'local';
    let file_name: string | null = null;
    let file_size: number | null = null;
    let mime_type: string | null = null;

    if (data.thumbnail && data.thumbnail instanceof File) {
      if (data.thumbnail.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Thumbnail size exceeds 5MB limit' },
          { status: 400 }
        );
      }

      const blob = await put(`videos/thumbnails/${data.thumbnail.name}`, data.thumbnail, {
        access: 'public',
        addRandomSuffix: true,
      });

      thumbnail_url = blob.url;
      storage_type = 'local';
      file_name = data.thumbnail.name;
      file_size = data.thumbnail.size;
      mime_type = data.thumbnail.type;
    } else if (data.thumbnail_url) {
      // Detect if URL is from style library (Vercel Blob storage)
      if (data.thumbnail_url.includes('vercel-storage.com') || data.thumbnail_url.includes('blob.vercel-storage.com')) {
        storage_type = 'blob';
      } else {
        storage_type = 'local';
      }
    }

    // Create video in database
    const video = await prisma.videos.create({
      data: {
        title_en: data.title_en,
        title_ar: data.title_ar,
        description_en: data.description_en,
        description_ar: data.description_ar,
        youtube_url: data.youtube_url,
        video_id,
        thumbnail_url,
        storage_type,
        file_name,
        file_size,
        mime_type,
        is_featured: data.is_featured || false,
        is_visible: data.is_visible,
        published_date: data.published_date,
        created_by: dbUser?.id,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Video created successfully', data: video },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Videos POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create video' },
      { status: 500 }
    );
  }
}
