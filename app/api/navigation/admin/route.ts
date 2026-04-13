import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/navigation/admin
 * Get ALL navigation items for admin (including hidden), grouped by location
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const allItems = await prisma.navigation.findMany({
      orderBy: { display_order: 'asc' },
    });

    const header = allItems.filter(item => item.location === 'header');
    const footer = allItems.filter(item => item.location === 'footer');

    return NextResponse.json({ data: { header, footer } });
  } catch (error) {
    console.error('Error fetching admin navigation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch navigation' },
      { status: 500 }
    );
  }
}
