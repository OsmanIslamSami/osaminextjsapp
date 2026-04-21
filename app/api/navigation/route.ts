import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/navigation
 * Get navigation items by location (public endpoint)
 * Query params: location ('header' | 'footer', defaults to 'header')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'header';

    const navigation = await prisma.navigation.findMany({
      where: {
        is_visible: true,
        location,
      },
      orderBy: {
        display_order: 'asc',
      },
    });

    // Group dropdown/section items under their parents
    const grouped = navigation.reduce((acc, item) => {
      if (item.type === 'dropdown' || item.type === 'section-header') {
        acc.push({
          ...item,
          items: navigation.filter(child => child.parent_id === item.id),
        });
      } else if ((item.type === 'link' || item.type === 'dropdown-item') && !item.parent_id) {
        acc.push(item);
      }
      return acc;
    }, [] as any[]);

    return NextResponse.json({ data: grouped });
  } catch (error) {
    logger.error('Error fetching navigation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch navigation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/navigation (admin) with ?admin=true
 * Returns ALL items (including hidden) for admin management
 * 
 * POST /api/navigation
 * Create a new navigation item (Admin only)
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

    const body = await request.json();

    const navItem = await prisma.navigation.create({
      data: {
        label_en: body.label_en,
        label_ar: body.label_ar,
        url: body.url || '#',
        location: body.location || 'header',
        type: body.type,
        parent_id: body.parent_id || null,
        icon: body.icon || null,
        is_visible: body.is_visible ?? true,
        display_order: body.display_order ?? 0,
        target: body.target || '_self',
      },
    });

    return NextResponse.json({ data: navItem }, { status: 201 });
  } catch (error) {
    logger.error('Error creating navigation item:', error);
    return NextResponse.json(
      { error: 'Failed to create navigation item' },
      { status: 500 }
    );
  }
}