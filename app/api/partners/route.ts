import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';
import { getHomeSectionConfig } from '@/lib/utils/home-sections';

/**
 * GET /api/partners
 * 
 * Retrieves partners list or single partner by ID
 * 
 * Context modes:
 * - home: Configurable count (default: all), featured-first sorting
 * - gallery: All visible partners, paginated
 * - admin: All partners including hidden/deleted
 * 
 * Query params:
 * - id: Get single partner by ID
 * - context: home | gallery | admin
 * - page: Page number for pagination
 * - limit: Items per page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const context = searchParams.get('context') || 'admin';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || (context === 'admin' ? '50' : '20'));

    // Single partner by ID
    if (id) {
      const partner = await prisma.partners.findUnique({
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

      if (!partner) {
        return NextResponse.json(
          { success: false, error: 'Partner not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: partner });
    }

    // List partners based on context
    let where: any = {};
    let orderBy: any = {};
    let take: number | undefined = limit;

    if (context === 'home') {
      // Home page: configurable count, featured-first, visible partners
      where = {
        is_deleted: false,
        is_visible: true,
      };
      orderBy = [
        { is_featured: 'desc' },
        { created_at: 'desc' }, // Partners use created_at instead of published_date
      ];
      
      // Check section config for display mode and count
      const sectionConfig = await getHomeSectionConfig('partners');
      if (sectionConfig?.partners_display_mode === 'limit' && sectionConfig.partners_max_count) {
        take = sectionConfig.partners_max_count;
      } else {
        take = undefined; // Show all
      }
    } else if (context === 'gallery') {
      // Gallery page: all visible partners, most recent first
      where = {
        is_deleted: false,
        is_visible: true,
      };
      orderBy = { created_at: 'desc' };
    } else {
      // Admin context: all partners
      where = { is_deleted: false };
      orderBy = { created_at: 'desc' };
    }

    const [partners, total] = await Promise.all([
      prisma.partners.findMany({
        where,
        orderBy,
        take,
        skip: take ? (page - 1) * take : undefined,
        include: {
          createdByUser: {
            select: { name: true, email: true },
          },
          updatedByUser: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.partners.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: partners,
      pagination: {
        page,
        limit: take || total,
        total,
        totalPages: take ? Math.ceil(total / take) : 1,
      },
    });
  } catch (error) {
    console.error('Partners GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/partners
 * 
 * Creates a new partner entry
 * 
 * Required fields:
 * - title_en, title_ar: Partner organization names
 * - image: Logo file OR image_url
 * 
 * Optional fields:
 * - url: Partner website URL (must be http:// or https://)
 * - is_featured: Priority display flag
 * - is_visible: Visibility toggle
 */
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

    // Parse multipart form data or JSON
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = {
        title_en: formData.get('title_en') as string,
        title_ar: formData.get('title_ar') as string,
        url: formData.get('url') as string | null,
        image: formData.get('image') as File | null,
        image_url: formData.get('image_url') as string | null,
        is_featured: formData.get('is_featured') === 'true',
        is_visible: formData.get('is_visible') !== 'false', // Default true
      };
    } else {
      data = await request.json();
      data.is_visible = data.is_visible !== false;
    }

    // Validation: titles are required
    if (!data.title_en || !data.title_ar) {
      return NextResponse.json(
        { success: false, error: 'Partner names (EN/AR) are required' },
        { status: 400 }
      );
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

    // Upload logo to Vercel Blob if file provided
    let image_url = data.image_url;
    let storage_type = 'local';
    let file_name: string | null = null;
    let file_size: number | null = null;
    let mime_type: string | null = null;

    if (data.image && data.image instanceof File) {
      // Validate file size (5MB max)
      if (data.image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Logo file size exceeds 5MB limit' },
          { status: 400 }
        );
      }

      // Upload to Vercel Blob
      const blob = await put(`partners/logos/${data.image.name}`, data.image, {
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
      if (data.image_url.includes('vercel-storage.com') || data.image_url.includes('blob.vercel-storage.com')) {
        storage_type = 'blob';
      } else {
        storage_type = 'local';
      }
    }

    if (!image_url) {
      return NextResponse.json(
        { success: false, error: 'Partner logo is required (file or URL)' },
        { status: 400 }
      );
    }

    // Create partner in database
    const partner = await prisma.partners.create({
      data: {
        title_en: data.title_en,
        title_ar: data.title_ar,
        url: data.url,
        image_url,
        storage_type,
        file_name,
        file_size,
        mime_type,
        is_featured: data.is_featured || false,
        is_visible: data.is_visible,
        created_by: dbUser?.id,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Partner created successfully', data: partner },
      { status: 201 }
    );
  } catch (error) {
    console.error('Partners POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}
