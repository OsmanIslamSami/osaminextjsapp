import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { validateImage, validatePDF } from '@/lib/utils/fileValidation';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/magazines
 * List Magazines with optional pagination and filtering
 * Auth: Required (any authenticated user)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const homePage = searchParams.get('home_page') === 'true';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    // Validate limit values
    const allowedLimits = [10, 20, 50, 100, 500];
    const validLimit = allowedLimits.includes(limit) ? limit : 10;
    
    // Calculate pagination
    const skip = (page - 1) * validLimit;
    
    // Build where clause
    const where: any = {
      is_deleted: false,
    };
    
    // Add date range filter
    if (dateFrom || dateTo) {
      where.published_date = {};
      if (dateFrom) {
        where.published_date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Add one day to include the end date
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        where.published_date.lt = endDate;
      }
    }
    
    // Adjust limit for home page
    const finalLimit = homePage ? Math.min(validLimit, 8) : validLimit;
    
    // Fetch Magazines with pagination
    const [magazines, totalCount] = await Promise.all([
      prisma.magazine.findMany({
        where,
        orderBy: {
          published_date: 'desc'
        },
        skip,
        take: finalLimit,
        select: {
          id: true,
          title_en: true,
          title_ar: true,
          description_en: true,
          description_ar: true,
          image_url: true,
          storage_type: true,
          file_data: true,  // Include to check if data exists
          download_link: true,
          published_date: true,
          is_visible: true,
          created_at: true,
          updated_at: true,
        }
      }),
      prisma.magazine.count({ where })
    ]);
    
    // Transform image URLs for local storage
    const magazinesWithUrls = magazines.map(magazine => {
      let imageUrl = magazine.image_url;
      
      // Only use local API endpoint if storage_type is 'local' AND file_data exists
      if (magazine.storage_type === 'local') {
        if (magazine.file_data && magazine.file_data.length > 0) {
          imageUrl = `/api/magazines/media/${magazine.id}`;
        } else {
          logger.warn(`Magazine ${magazine.id} has storage_type='local' but no file_data. Using original URL.`);
        }
      }
      
      // Remove file_data from response (it's binary and large)
      const { file_data, ...magazineWithoutFileData } = magazine;
      
      return {
        ...magazineWithoutFileData,
        image_url: imageUrl
      };
    });
    
    const totalPages = Math.ceil(totalCount / finalLimit);
    
    return NextResponse.json({
      data: magazinesWithUrls,
      totalCount,
      totalPages,
      currentPage: page,
      limit: finalLimit
    });
    
  } catch (error) {
    logger.error('Error fetching Magazines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Magazines' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/magazines
 * Create a new Magazine with image and PDF uploads
 * Auth: Admin only
 * Content-Type: multipart/form-data
 */
export async function POST(request: NextRequest) {
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
    
    // Parse FormData
    const formData = await request.formData();
    const title_en = formData.get('title_en') as string;
    const title_ar = formData.get('title_ar') as string;
    const description_en = formData.get('description_en') as string;
    const description_ar = formData.get('description_ar') as string;
    const published_date = formData.get('published_date') as string;
    const storage_type = formData.get('storage_type') as string || 'upload';
    const image_url_from_library = formData.get('image_url') as string | null;
    const cover_image = formData.get('cover_image') as File | null;
    const pdf_file = formData.get('pdf_file') as File | null;
    
    // Validate required fields
    if (!title_en || !title_ar || !description_en || !description_ar || !published_date) {
      return NextResponse.json(
        { error: 'Missing required fields: title_en, title_ar, description_en, description_ar, published_date' },
        { status: 400 }
      );
    }
    
    // Validate field lengths
    if (title_en.length > 500 || title_ar.length > 500) {
      return NextResponse.json(
        { error: 'Title must not exceed 500 characters' },
        { status: 400 }
      );
    }
    
    // Validate cover image is provided (either from library or upload)
    if (!image_url_from_library && !cover_image) {
      return NextResponse.json(
        { error: 'Cover image is required' },
        { status: 400 }
      );
    }
    
    // Validate PDF is provided
    if (!pdf_file) {
      return NextResponse.json(
        { error: 'PDF file is required' },
        { status: 400 }
      );
    }
    
    // Handle cover image based on storage type
    let image_url: string;
    let final_storage_type = storage_type;
    let file_data: Buffer | null = null;
    let file_name: string | null = null;
    let file_size: number | null = null;
    let mime_type: string | null = null;
    
    if (storage_type === 'blob' && image_url_from_library) {
      // Use image from style library (already in blob storage)
      image_url = image_url_from_library;
      final_storage_type = 'blob';
    } else if (cover_image) {
      // Validate cover image format and size
      const imageValidation = validateImage(cover_image);
      if (!imageValidation.valid) {
        return NextResponse.json(
          { error: imageValidation.error },
          { status: 400 }
        );
      }
      
      // Upload new cover image to Vercel Blob
      try {
        const blob = await put(`magazines/covers/${cover_image.name}`, cover_image, {
          access: 'public',
          addRandomSuffix: true,
        });
        image_url = blob.url;
        final_storage_type = 'blob';
        file_name = cover_image.name;
        file_size = cover_image.size;
        mime_type = cover_image.type;
      } catch (error) {
        logger.error('Blob upload failed, using local storage:', error);
        // Fallback to local storage
        const bytes = await cover_image.arrayBuffer();
        file_data = Buffer.from(bytes);
        image_url = cover_image.name; // Store filename as identifier
        final_storage_type = 'local';
        file_name = cover_image.name;
        file_size = cover_image.size;
        mime_type = cover_image.type;
      }
    } else {
      return NextResponse.json(
        { error: 'No cover image provided' },
        { status: 400 }
      );
    }
    
    // Validate PDF format and size
    const pdfValidation = validatePDF(pdf_file);
    if (!pdfValidation.valid) {
      return NextResponse.json(
        { error: pdfValidation.error },
        { status: 400 }
      );
    }
    
    // Upload PDF to Vercel Blob
    let download_link: string;
    
    try {
      // Create SEO-friendly filename
      const titleSlug = title_en.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const timestamp = Date.now();
      const pdfFileName = `magazine-${titleSlug}-${timestamp}.pdf`;
      
      const pdfBlob = await put(`magazines/pdfs/${pdfFileName}`, pdf_file, {
        access: 'public',
        addRandomSuffix: false, // Using timestamp instead
      });
      download_link = pdfBlob.url;
    } catch (error) {
      logger.error('PDF upload failed:', error);
      return NextResponse.json(
        { error: 'Failed to upload PDF file' },
        { status: 500 }
      );
    }
    
    // Create Magazine in database
    const magazine = await prisma.magazine.create({
      data: {
        title_en,
        title_ar,
        description_en,
        description_ar,
        image_url,
        storage_type: final_storage_type,
        file_data: file_data as any,
        file_name,
        file_size,
        mime_type,
        download_link,
        published_date: new Date(published_date),
        created_by: user.id,
        updated_by: user.id,
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
        created_by: true,
        updated_by: true,
        created_at: true,
        updated_at: true,
      }
    });
    
    return NextResponse.json(
      { data: magazine },
      { status: 201 }
    );
    
  } catch (error) {
    logger.error('Error creating Magazine:', error);
    return NextResponse.json(
      { error: 'Failed to create Magazine' },
      { status: 500 }
    );
  }
}