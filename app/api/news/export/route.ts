import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/auth/permissions';
import { buildNewsWhereClause } from '@/lib/utils/news-search';
import { formatNewsForExport } from '@/lib/utils/news-search';
import { generateExcel, createExcelResponse } from '@/lib/utils/excel-export';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/news/export
 * Export news to Excel with filters (admin only)
 * Query params: search, dateFrom, dateTo, filter
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId || !(await hasPermission(userId, 'news:read'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const filter = searchParams.get('filter') as 'all' | 'visible' | 'hidden' | 'deleted' | null;

    // Build where clause with filters
    const where = buildNewsWhereClause(
      {
        keyword: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        status: filter || 'all',
      },
      false
    );

    // Fetch all matching news (no pagination for export)
    const news = await prisma.news.findMany({
      where,
      orderBy: [
        { published_date: 'desc' },
        { created_at: 'desc' },
      ],
    });

    if (news.length === 0) {
      return NextResponse.json(
        { error: 'No news items to export' },
        { status: 404 }
      );
    }

    // Format data for Excel
    const formattedData = formatNewsForExport(news);

    // Generate Excel file
    const buffer = await generateExcel({
      fileName: 'news-export.xlsx',
      sheetName: 'News',
      columns: [
        { header: 'ID', key: 'ID', width: 30 },
        { header: 'Title (EN)', key: 'Title (EN)', width: 40 },
        { header: 'Title (AR)', key: 'Title (AR)', width: 40 },
        { header: 'Published Date', key: 'Published Date', width: 20 },
        { header: 'Visible', key: 'Visible', width: 10 },
        { header: 'Storage Type', key: 'Storage Type', width: 15 },
        { header: 'Created Date', key: 'Created Date', width: 20 },
        { header: 'Status', key: 'Status', width: 15 },
      ],
      data: formattedData,
      autoFilter: true,
    });

    // Create response with download headers
    const fileName = `news-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    return createExcelResponse(buffer, fileName);
  } catch (error) {
    logger.error('Error exporting news:', error);
    return NextResponse.json(
      { error: 'Failed to export news' },
      { status: 500 }
    );
  }
}