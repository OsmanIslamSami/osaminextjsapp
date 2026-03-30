import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';
import { extractYouTubeVideoId, validateYouTubeUrl } from '@/lib/utils/youtube';

// PUT /api/videos/[id] - Update video
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Look up the database user ID from Clerk user ID
    const dbUser = await prisma.user.findUnique({
      where: { clerk_user_id: session.userId },
      select: { id: true }
    });
    
    const contentType = request.headers.get('content-type') || '';
    let data: any = {};

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
        is_visible: formData.get('is_visible') === 'true',
        published_date: formData.get('published_date')
          ? new Date(formData.get('published_date') as string)
          : undefined,
      };
    } else {
      data = await request.json();
      if (data.published_date) {
        data.published_date = new Date(data.published_date);
      }
    }

    let updateData: any = {
      title_en: data.title_en,
      title_ar: data.title_ar,
      description_en: data.description_en,
      description_ar: data.description_ar,
      is_featured: data.is_featured,
      is_visible: data.is_visible,
    };

    // Only set updated_by if user exists in database
    if (dbUser) {
      updateData.updated_by = dbUser.id;
    }

    if (data.published_date) {
      updateData.published_date = data.published_date;
    }

    // Update YouTube URL if provided
    if (data.youtube_url) {
      if (!validateYouTubeUrl(data.youtube_url)) {
        return NextResponse.json(
          { success: false, error: 'Invalid YouTube URL format' },
          { status: 400 }
        );
      }

      const video_id = extractYouTubeVideoId(data.youtube_url);
      if (!video_id) {
        return NextResponse.json(
          { success: false, error: 'Could not extract video ID from YouTube URL' },
          { status: 400 }
        );
      }

      updateData.youtube_url = data.youtube_url;
      updateData.video_id = video_id;
    }

    // Upload new thumbnail if provided
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

      updateData.thumbnail_url = blob.url;
      updateData.storage_type = 'local';
      updateData.file_name = data.thumbnail.name;
      updateData.file_size = data.thumbnail.size;
      updateData.mime_type = data.thumbnail.type;
    } else if (data.thumbnail_url) {
      // Get current video to check if thumbnail URL changed
      const currentVideo = await prisma.videos.findUnique({
        where: { id },
        select: { thumbnail_url: true }
      });

      // Only update thumbnail fields if URL actually changed
      if (currentVideo && data.thumbnail_url !== currentVideo.thumbnail_url) {
        updateData.thumbnail_url = data.thumbnail_url;
        // Detect if URL is from style library (Vercel Blob storage)
        if (data.thumbnail_url.includes('vercel-storage.com') || data.thumbnail_url.includes('blob.vercel-storage.com')) {
          updateData.storage_type = 'blob';
        } else {
          updateData.storage_type = 'local';
        }
      }
    }

    const video = await prisma.videos.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully',
      data: video,
    });
  } catch (error: any) {
    console.error('Videos PUT error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update video' },
      { status: 500 }
    );
  }
}

// DELETE /api/videos/[id] - Soft delete video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Look up the database user ID from Clerk user ID
    const dbUser = await prisma.user.findUnique({
      where: { clerk_user_id: session.userId },
      select: { id: true }
    });

    const updateData: any = {
      is_deleted: true,
    };
    
    if (dbUser) {
      updateData.updated_by = dbUser.id;
    }

    const video = await prisma.videos.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
      data: { id: video.id, is_deleted: true },
    });
  } catch (error: any) {
    console.error('Videos DELETE error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
