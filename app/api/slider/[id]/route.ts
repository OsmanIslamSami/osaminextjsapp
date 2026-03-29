import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/permissions';

// GET /api/slider/[id] - Admin only
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const slide = await prisma.sliderContent.findFirst({
      where: {
        id: id,
        is_deleted: false,
      },
    });

    if (!slide) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }

    return NextResponse.json({ slide }, { status: 200 });
  } catch (error) {
    console.error('Error fetching slide:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slide' },
      { status: 500 }
    );
  }
}

// PUT /api/slider/[id] - Admin only, update slide
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const {
      media_url,
      media_type,
      storage_type,
      title_en,
      title_ar,
      button_text_en,
      button_text_ar,
      button_url,
      show_button,
      display_order,
      is_visible,
    } = body;

    // Validate media_type if provided
    if (media_type) {
      const validMediaTypes = ['image', 'video', 'gif'];
      if (!validMediaTypes.includes(media_type)) {
        return NextResponse.json(
          { error: 'Invalid media_type. Must be one of: image, video, gif' },
          { status: 400 }
        );
      }
    }

    // Validate storage_type if provided
    if (storage_type) {
      const validStorageTypes = ['blob', 'local'];
      if (!validStorageTypes.includes(storage_type)) {
        return NextResponse.json(
          { error: 'Invalid storage_type. Must be one of: blob, local' },
          { status: 400 }
        );
      }
    }

    const slide = await prisma.sliderContent.updateMany({
      where: {
        id: id,
        is_deleted: false,
      },
      data: {
        ...(media_url !== undefined && { media_url }),
        ...(media_type !== undefined && { media_type }),
        ...(storage_type !== undefined && { storage_type }),
        ...(title_en !== undefined && { title_en }),
        ...(title_ar !== undefined && { title_ar }),
        ...(button_text_en !== undefined && { button_text_en }),
        ...(button_text_ar !== undefined && { button_text_ar }),
        ...(button_url !== undefined && { button_url }),
        ...(show_button !== undefined && { show_button }),
        ...(display_order !== undefined && { display_order }),
        ...(is_visible !== undefined && { is_visible }),
      },
    });

    if (slide.count === 0) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating slide:', error);
    return NextResponse.json(
      { error: 'Failed to update slide' },
      { status: 500 }
    );
  }
}

// DELETE /api/slider/[id] - Admin only, soft-delete
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Get the slide to retrieve media URL for blob deletion
    const slideToDelete = await prisma.sliderContent.findFirst({
      where: {
        id: id,
        is_deleted: false,
      },
    });

    if (!slideToDelete) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }

    // Soft delete in database
    await prisma.sliderContent.updateMany({
      where: {
        id: id,
        is_deleted: false,
      },
      data: {
        is_deleted: true,
      },
    });

    // Delete from Vercel Blob if it's a blob URL
    if (slideToDelete.media_url.includes('vercel-storage.com')) {
      try {
        await del(slideToDelete.media_url);
      } catch (blobError) {
        console.error('Error deleting blob:', blobError);
        // Continue even if blob deletion fails
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting slide:', error);
    return NextResponse.json(
      { error: 'Failed to delete slide' },
      { status: 500 }
    );
  }
}
