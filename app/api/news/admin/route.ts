import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/auth/permissions';
import {
  buildNewsWhereClause,
  validatePagination,
} from '@/lib/utils/news-search';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/news/admin
 * Fetch all news items for admin management (including hidden/deleted)
 * Query params: page, limit, filter, search, dateFrom, dateTo
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId || !(await hasPermission(userId, 'news:read'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const filter = searchParams.get('filter') as 'all' | 'visible' | 'hidden' | 'deleted' | null;
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Validate pagination (higher limit for admin)
    const { page: validatedPage, limit: validatedLimit, skip } = validatePagination(
      page || undefined,
      limit || undefined,
      100
    );

    // Build where clause for admin with filters
    const where = buildNewsWhereClause(
      {
        keyword: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        status: filter || 'all',
      },
      false // not public
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
      }),
      prisma.news.count({ where }),
    ]);

    const totalPages = Math.ceil(total / validatedLimit);

    return NextResponse.json({
      news,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Error fetching admin news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}