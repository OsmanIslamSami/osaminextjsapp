import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';

// PUT /api/photos/[id] - Update photo
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

    // Handle multipart form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = {
        title_en: formData.get('title_en') as string,
        title_ar: formData.get('title_ar') as string,
        description_en: formData.get('description_en') as string | null,
        description_ar: formData.get('description_ar') as string | null,
        image: formData.get('image') as File | null,
        image_url: formData.get('image_url') as string | null,
        is_featured: formData.get('is_featured') === 'true',
        is_visible: formData.get('is_visible') === 'true',
        published_date: formData.get('published_date')
          ? new Date(formData.get('published_date') as string)
          : undefined,
      };
    } else {
      // Handle JSON body
      data = await request.json();
      if (data.published_date) {
        data.published_date = new Date(data.published_date);
      }
    }

    // Validation
    if (data.title_en && data.title_en.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Title (EN) must be max 255 characters' },
        { status: 400 }
      );
    }

    if (data.title_ar && data.title_ar.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Title (AR) must be max 255 characters' },
        { status: 400 }
      );
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

    // Upload new image if provided
    if (data.image && data.image instanceof File) {
      if (data.image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'File size exceeds 5MB limit' },
          { status: 400 }
        );
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(data.image.type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
          { status: 400 }
        );
      }

      const blob = await put(`photos/${data.image.name}`, data.image, {
        access: 'public',
        addRandomSuffix: true,
      });

      updateData.image_url = blob.url;
      updateData.storage_type = 'local';
      updateData.file_name = data.image.name;
      updateData.file_size = data.image.size;
      updateData.mime_type = data.image.type;
    } else if (data.image_url) {
      // Get current photo to check if URL changed
      const currentPhoto = await prisma.photos.findUnique({
        where: { id },
        select: { image_url: true }
      });

      // Only update image fields if URL actually changed
      if (currentPhoto && data.image_url !== currentPhoto.image_url) {
        updateData.image_url = data.image_url;
        // Detect if URL is from style library (Vercel Blob storage)
        if (data.image_url.includes('vercel-storage.com') || data.image_url.includes('blob.vercel-storage.com')) {
          updateData.storage_type = 'blob';
        } else {
          updateData.storage_type = 'local';
        }
      }
    }

    const photo = await prisma.photos.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Photo updated successfully',
      data: photo,
    });
  } catch (error: any) {
    console.error('Photos PUT error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Photo not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update photo' },
      { status: 500 }
    );
  }
}

// DELETE /api/photos/[id] - Soft delete photo
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

    const photo = await prisma.photos.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
      data: { id: photo.id, is_deleted: true },
    });
  } catch (error: any) {
    console.error('Photos DELETE error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Photo not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
