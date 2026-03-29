import { query } from '@/lib/db';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Get current month and last month date ranges
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Execute all queries in parallel for better performance
    const [
      totalClientsResult,
      totalOrdersResult,
      thisMonthClientsResult,
      lastMonthClientsResult,
      thisMonthOrdersResult,
      lastMonthOrdersResult,
      statusBreakdownResult,
      recentClientsResult,
      recentOrdersResult,
      latestClientsResult,
    ] = await Promise.all([
      // Total counts
      query('SELECT COUNT(*) as count FROM clients WHERE is_deleted = false'),
      query('SELECT COUNT(*) as count FROM orders'),
      
      // Month comparisons
      query('SELECT COUNT(*) as count FROM clients WHERE is_deleted = false AND created_at >= $1', [currentMonthStart]),
      query('SELECT COUNT(*) as count FROM clients WHERE is_deleted = false AND created_at >= $1 AND created_at < $2', [lastMonthStart, currentMonthStart]),
      query('SELECT COUNT(*) as count FROM orders WHERE created_at >= $1', [currentMonthStart]),
      query('SELECT COUNT(*) as count FROM orders WHERE created_at >= $1 AND created_at < $2', [lastMonthStart, currentMonthStart]),
      
      // Status breakdown
      query('SELECT status, COUNT(*)::int as count FROM orders GROUP BY status'),
      
      // Recent clients (last 5)
      query('SELECT id, name, email, created_at, created_by FROM clients WHERE is_deleted = false ORDER BY created_at DESC LIMIT 5'),
      
      // Recent orders (last 5 with client name)
      query(`
        SELECT o.id, o.description, o.status, o.created_at, o.created_by, c.name as client_name 
        FROM orders o 
        JOIN clients c ON o.client_id = c.id 
        WHERE c.is_deleted = false
        ORDER BY o.created_at DESC 
        LIMIT 5
      `),
      
      // Latest clients (last 10)
      query('SELECT id, name, email, mobile, created_at FROM clients WHERE is_deleted = false ORDER BY created_at DESC LIMIT 10'),
    ]);

    // Fetch news metrics using Prisma
    const [totalNews, latestNews] = await Promise.all([
      prisma.news.count({
        where: { is_deleted: false },
      }),
      prisma.news.findMany({
        where: { is_deleted: false },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          id: true,
          title_en: true,
          title_ar: true,
          published_date: true,
          is_visible: true,
          storage_type: true,
        },
      }),
    ]);

    return NextResponse.json({
      clientCount: parseInt(totalClientsResult.rows[0].count),
      orderCount: parseInt(totalOrdersResult.rows[0].count),
      newsCount: totalNews,
      thisMonthClients: parseInt(thisMonthClientsResult.rows[0].count),
      lastMonthClients: parseInt(lastMonthClientsResult.rows[0].count),
      thisMonthOrders: parseInt(thisMonthOrdersResult.rows[0].count),
      lastMonthOrders: parseInt(lastMonthOrdersResult.rows[0].count),
      statusBreakdown: statusBreakdownResult.rows,
      recentClients: recentClientsResult.rows,
      recentOrders: recentOrdersResult.rows,
      latestClients: latestClientsResult.rows,
      latestNews,
    });
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch dashboard metrics. Please try again.' },
      { status: 500 }
    );
  }
}
