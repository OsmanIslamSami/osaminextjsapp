import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';
import { logger } from '@/lib/utils/logger';

// GET /api/photos - List photos or get single photo by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const context = searchParams.get('context') || 'admin';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || (context === 'admin' ? '50' : '20'));
    const includeHidden = searchParams.get('includeHidden') === 'true';
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    // Single photo by ID
    if (id) {
      const photo = await prisma.photos.findUnique({
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

      if (!photo) {
        return NextResponse.json(
          { success: false, error: 'Photo not found' },
          { status: 404 }
        );
      }

      // Check authorization for hidden/deleted photos
      if ((photo.is_deleted || !photo.is_visible) && context !== 'admin') {
        const session = await auth();
        if (!session?.userId) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
          );
        }
      }

      return NextResponse.json({ success: true, data: photo });
    }

    // List photos based on context
    let where: any = {};
    let orderBy: any = {};
    let take = limit;

    if (context === 'home') {
      // Home page: 5 featured-first, visible, published photos
      where = {
        is_deleted: false,
        is_visible: true,
        published_date: { lte: new Date() },
      };
      orderBy = [
        { is_featured: 'desc' },
        { published_date: 'desc' },
      ];
      take = 5;
    } else if (context === 'gallery') {
      // Gallery page: visible, published photos, paginated
      where = {
        is_deleted: false,
        is_visible: true,
        published_date: { lte: new Date() },
      };
      orderBy = { published_date: 'desc' };
    } else {
      // Admin context: all photos (with optional filters)
      where = {
        is_deleted: includeDeleted ? undefined : false,
      };
      if (!includeHidden) {
        where.is_visible = true;
      }
      orderBy = { created_at: 'desc' };
    }

    const [photos, total] = await Promise.all([
      prisma.photos.findMany({
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
      prisma.photos.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: photos,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    logger.error('Photos GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// POST /api/photos - Create new photo
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
        is_visible: formData.get('is_visible') !== 'false', // Default true
        published_date: formData.get('published_date')
          ? new Date(formData.get('published_date') as string)
          : new Date(),
      };
    } else {
      // Handle JSON body
      data = await request.json();
      data.published_date = data.published_date 
        ? new Date(data.published_date) 
        : new Date();
      data.is_visible = data.is_visible !== false; // Default true
    }

    // Validation
    if (!data.title_en || !data.title_ar) {
      return NextResponse.json(
        { success: false, error: 'Titles (EN/AR) are required' },
        { status: 400 }
      );
    }

    if (data.title_en.length > 255 || data.title_ar.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Titles must be max 255 characters' },
        { status: 400 }
      );
    }

    // Upload image to Vercel Blob if file provided
    let image_url = data.image_url;
    let storage_type = 'local';
    let file_name: string | null = null;
    let file_size: number | null = null;
    let mime_type: string | null = null;

    if (data.image && data.image instanceof File) {
      // Validate file size (5MB)
      if (data.image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'File size exceeds 5MB limit' },
          { status: 400 }
        );
      }

      // Validate MIME type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(data.image.type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
          { status: 400 }
        );
      }

      // Upload to Vercel Blob
      const blob = await put(`photos/${data.image.name}`, data.image, {
        access: 'public',
        addRandomSuffix: true,
      });

      image_url = blob.url;
      storage_type = 'local';
      file_name = data.image.name;
      file_size = data.image.size;
      mime_type = data.image.type;
    } else if (data.image_url) {
      // Detect if URL is from style library (Vercel Blob storage)
      // Style library images are stored in Vercel Blob with specific patterns
      if (data.image_url.includes('vercel-storage.com') || data.image_url.includes('blob.vercel-storage.com')) {
        storage_type = 'blob';
      } else {
        storage_type = 'local';
      }
    }

    if (!image_url) {
      return NextResponse.json(
        { success: false, error: 'Image is required (file or URL)' },
        { status: 400 }
      );
    }

    // Create photo in database
    const photo = await prisma.photos.create({
      data: {
        title_en: data.title_en,
        title_ar: data.title_ar,
        description_en: data.description_en,
        description_ar: data.description_ar,
        image_url,
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
      { success: true, message: 'Photo created successfully', data: photo },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Photos POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create photo' },
      { status: 500 }
    );
  }
}