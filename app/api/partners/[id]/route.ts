import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';
import { logger } from '@/lib/utils/logger';

/**
 * PUT /api/partners/[id]
 * 
 * Updates an existing partner
 * Supports updating logo, names, URL, and display flags
 */
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

    // Parse request body
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = {
        title_en: formData.get('title_en') as string,
        title_ar: formData.get('title_ar') as string,
        url: formData.get('url') as string | null,
        image: formData.get('image') as File | null,
        image_url: formData.get('image_url') as string | null,
        is_featured: formData.get('is_featured') === 'true',
        is_visible: formData.get('is_visible') === 'true',
      };
    } else {
      data = await request.json();
    }

    // Validation: URL format (if provided)
    if (data.url) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(data.url)) {
        return NextResponse.json(
          { success: false, error: 'Partner URL must start with http:// or https://' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    let updateData: any = {
      title_en: data.title_en,
      title_ar: data.title_ar,
      url: data.url,
      is_featured: data.is_featured,
      is_visible: data.is_visible,
    };

    // Only set updated_by if user exists in database
    if (dbUser) {
      updateData.updated_by = dbUser.id;
    }

    // Upload new logo if provided
    if (data.image && data.image instanceof File) {
      if (data.image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Logo file size exceeds 5MB limit' },
          { status: 400 }
        );
      }

      const blob = await put(`partners/logos/${data.image.name}`, data.image, {
        access: 'public',
        addRandomSuffix: true,
      });

      updateData.image_url = blob.url;
      updateData.storage_type = 'local';
      updateData.file_name = data.image.name;
      updateData.file_size = data.image.size;
      updateData.mime_type = data.image.type;
    } else if (data.image_url) {
      // Get current partner to check if logo URL changed
      const currentPartner = await prisma.partners.findUnique({
        where: { id },
        select: { image_url: true }
      });

      // Only update logo fields if URL actually changed
      if (currentPartner && data.image_url !== currentPartner.image_url) {
        updateData.image_url = data.image_url;
        // Detect if URL is from style library (Vercel Blob storage)
        if (data.image_url.includes('vercel-storage.com') || data.image_url.includes('blob.vercel-storage.com')) {
          updateData.storage_type = 'blob';
        } else {
          updateData.storage_type = 'local';
        }
      }
    }

    const partner = await prisma.partners.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Partner updated successfully',
      data: partner,
    });
  } catch (error: any) {
    logger.error('Partners PUT error:', error);
    logger.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update partner' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/partners/[id]
 * 
 * Soft deletes a partner (sets is_deleted = true)
 * Preserves data for audit trail
 */
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

    const partner = await prisma.partners.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully',
      data: { id: partner.id, is_deleted: true },
    });
  } catch (error: any) {
    logger.error('Partners DELETE error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}