import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import {
  buildNewsWhereClause,
  validatePagination,
} from '@/lib/utils/news-search';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/news
 * Fetch visible news items for public display
 * Query params: page, limit, search, dateFrom, dateTo
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Validate pagination
    const { page: validatedPage, limit: validatedLimit, skip } = validatePagination(
      page || undefined,
      limit || undefined,
      50
    );

    // Build where clause for public news with search and filters
    const where = buildNewsWhereClause(
      {
        keyword: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      },
      true
    );

    // Fetch news with pagination
    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: [
          { published_date: 'desc' },
          { created_at: 'desc' },
        ],
        take: validatedLimit,
        skip,
        select: {
          id: true,
          title_en: true,
          title_ar: true,
          description_en: true,
          description_ar: true,
          image_url: true,
          storage_type: true,
          published_date: true,
          created_at: true,
          updated_at: true,
        },
      }),
      prisma.news.count({ where }),
    ]);

    logger.log('News API - Where clause:', JSON.stringify(where, null, 2));
    logger.log('News API - Found:', news.length, 'news items');
    logger.log('News API - Total count:', total);

    const totalPages = Math.ceil(total / validatedLimit);

    const response = NextResponse.json({
      news,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
      },
    });

    // Add caching headers for public news endpoint
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=900');

    return response;
  } catch (error) {
    logger.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/news
 * Create a new news item (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const { hasPermission } = await import('@/lib/auth/permissions');
    if (!(await hasPermission(userId, 'news:write'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title_en,
      title_ar,
      image_url,
      storage_type,
      file_data,
      file_name,
      file_size,
      mime_type,
      published_date,
      is_visible,
    } = body;

    // Validation: at least one title must be provided
    if (!title_en && !title_ar) {
      return NextResponse.json(
        { error: 'At least one title (EN or AR) is required' },
        { status: 400 }
      );
    }

    // Validation: required fields
    if (!image_url || !storage_type || !published_date) {
      return NextResponse.json(
        { error: 'Missing required fields: image_url, storage_type, published_date' },
        { status: 400 }
      );
    }

    // Validation: storage_type
    if (!['blob', 'local'].includes(storage_type)) {
      return NextResponse.json(
        { error: 'Invalid storage_type. Must be "blob" or "local"' },
        { status: 400 }
      );
    }

    // Validation: published_date not more than 1 year in future
    const publishedDate = new Date(published_date);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (publishedDate > oneYearFromNow) {
      return NextResponse.json(
        { error: 'Published date cannot be more than 1 year in the future' },
        { status: 400 }
      );
    }

    // Create news item
    const news = await prisma.news.create({
      data: {
        title_en: title_en || null,
        title_ar: title_ar || null,
        image_url,
        storage_type,
        file_data: file_data ? Buffer.from(file_data, 'base64') : null,
        file_name: file_name || null,
        file_size: file_size || null,
        mime_type: mime_type || null,
        published_date: publishedDate,
        is_visible: is_visible !== undefined ? is_visible : true,
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    logger.error('Error creating news:', error);
    return NextResponse.json(
      { error: 'Failed to create news' },
      { status: 500 }
    );
  }
}