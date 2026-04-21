import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { validateImage, validatePDF } from '@/lib/utils/fileValidation';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/magazines/[id]
 * Get a single Magazine by ID
 * Auth: Required (any authenticated user)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await context.params;
    
    const magazine = await prisma.magazine.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      select: {
        id: true,
        title_en: true,
        title_ar: true,
        description_en: true,
        description_ar: true,
        image_url: true,
        storage_type: true,
        download_link: true,
        published_date: true,
        created_at: true,
        updated_at: true,
      }
    });
    
    if (!magazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      );
    }
    
    // Transform image URL for local storage
    const magazineWithUrl = {
      ...magazine,
      image_url: magazine.storage_type === 'local' 
        ? `/api/magazines/media/${magazine.id}`
        : magazine.image_url
    };
    
    return NextResponse.json({ data: magazineWithUrl });
    
  } catch (error) {
    logger.error('Error fetching Magazine:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Magazine' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/magazines/[id]
 * Update an existing Magazine
 * Auth: Admin only
 * Content-Type: multipart/form-data or application/json
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    const { id } = await context.params;
    
    // Check if Magazine exists and not deleted
    const existingMagazine = await prisma.magazine.findFirst({
      where: {
        id,
        is_deleted: false,
      }
    });
    
    if (!existingMagazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      );
    }
    
    // Parse request (FormData or JSON)
    const contentType = request.headers.get('content-type') || '';
    let data: any = {};
    let storage_type: string | null = null;
    let image_url_from_library: string | null = null;
    let cover_image: File | null = null;
    let pdf_file: File | null = null;
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = {
        title_en: formData.get('title_en') as string | null,
        title_ar: formData.get('title_ar') as string | null,
        description_en: formData.get('description_en') as string | null,
        description_ar: formData.get('description_ar') as string | null,
        published_date: formData.get('published_date') as string | null,
      };
      storage_type = formData.get('storage_type') as string | null;
      image_url_from_library = formData.get('image_url') as string | null;
      cover_image = formData.get('cover_image') as File | null;
      pdf_file = formData.get('pdf_file') as File | null;
    } else {
      data = await request.json();
    }
    
    // Build update data
    const updateData: any = {
      updated_by: user.id,
    };
    
    // Update text fields
    if (data.title_en !== undefined && data.title_en !== null) {
      if (data.title_en.length > 500) {
        return NextResponse.json(
          { error: 'English title must not exceed 500 characters' },
          { status: 400 }
        );
      }
      updateData.title_en = data.title_en;
    }
    
    if (data.title_ar !== undefined && data.title_ar !== null) {
      if (data.title_ar.length > 500) {
        return NextResponse.json(
          { error: 'Arabic title must not exceed 500 characters' },
          { status: 400 }
        );
      }
      updateData.title_ar = data.title_ar;
    }
    
    if (data.description_en !== undefined && data.description_en !== null) {
      updateData.description_en = data.description_en;
    }
    
    if (data.description_ar !== undefined && data.description_ar !== null) {
      updateData.description_ar = data.description_ar;
    }
    
    if (data.published_date !== undefined && data.published_date !== null) {
      updateData.published_date = new Date(data.published_date);
    }
    
    // Handle cover image update
    if (storage_type === 'blob' && image_url_from_library) {
      // Use image from style library (already in blob storage)
      updateData.image_url = image_url_from_library;
      updateData.storage_type = 'blob';
      updateData.file_data = null;
      updateData.file_name = null;
      updateData.file_size = null;
      updateData.mime_type = null;
    } else if (cover_image) {
      // Validate image
      const imageValidation = validateImage(cover_image);
      if (!imageValidation.valid) {
        return NextResponse.json(
          { error: imageValidation.error },
          { status: 400 }
        );
      }
      
      // Upload new image
      try {
        const blob = await put(`magazines/covers/${cover_image.name}`, cover_image, {
          access: 'public',
          addRandomSuffix: true,
        });
        updateData.image_url = blob.url;
        updateData.storage_type = 'blob';
        updateData.file_name = cover_image.name;
        updateData.file_size = cover_image.size;
        updateData.mime_type = cover_image.type;
        updateData.file_data = null;
      } catch (error) {
        logger.error('Blob upload failed, using local storage:', error);
        // Fallback to local storage
        const bytes = await cover_image.arrayBuffer();
        updateData.file_data = Buffer.from(bytes);
        updateData.image_url = cover_image.name;
        updateData.storage_type = 'local';
        updateData.file_name = cover_image.name;
        updateData.file_size = cover_image.size;
        updateData.mime_type = cover_image.type;
      }
    }
    
    // Handle PDF update
    if (pdf_file) {
      // Validate PDF
      const pdfValidation = validatePDF(pdf_file);
      if (!pdfValidation.valid) {
        return NextResponse.json(
          { error: pdfValidation.error },
          { status: 400 }
        );
      }
      
      // Upload new PDF
      try {
        const titleSlug = (updateData.title_en || existingMagazine.title_en)
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        const timestamp = Date.now();
        const pdfFileName = `magazine-${titleSlug}-${timestamp}.pdf`;
        
        const pdfBlob = await put(`magazines/pdfs/${pdfFileName}`, pdf_file, {
          access: 'public',
          addRandomSuffix: false,
        });
        updateData.download_link = pdfBlob.url;
      } catch (error) {
        logger.error('PDF upload failed:', error);
        return NextResponse.json(
          { error: 'Failed to upload PDF file' },
          { status: 500 }
        );
      }
    }
    
    // Update Magazine
    const magazine = await prisma.magazine.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title_en: true,
        title_ar: true,
        description_en: true,
        description_ar: true,
        image_url: true,
        storage_type: true,
        download_link: true,
        published_date: true,
        updated_by: true,
        updated_at: true,
      }
    });
    
    return NextResponse.json({ data: magazine });
    
  } catch (error) {
    logger.error('Error updating Magazine:', error);
    return NextResponse.json(
      { error: 'Failed to update Magazine' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/magazines/[id]
 * Soft-delete a Magazine (sets is_deleted = true)
 * Auth: Admin only
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    const { id } = await context.params;
    
    // Check if Magazine exists and not already deleted
    const existingMagazine = await prisma.magazine.findFirst({
      where: {
        id,
        is_deleted: false,
      }
    });
    
    if (!existingMagazine) {
      return NextResponse.json(
        { error: 'Magazine not found or already deleted' },
        { status: 404 }
      );
    }
    
    // Soft delete Magazine
    await prisma.magazine.update({
      where: { id },
      data: {
        is_deleted: true,
        updated_by: user.id,
      }
    });
    
    return NextResponse.json({
      data: {
        message: 'Magazine deleted successfully',
        id
      }
    });
    
  } catch (error) {
    logger.error('Error deleting Magazine:', error);
    return NextResponse.json(
      { error: 'Failed to delete Magazine' },
      { status: 500 }
    );
  }
}