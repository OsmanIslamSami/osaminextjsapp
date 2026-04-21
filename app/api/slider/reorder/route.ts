import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/permissions';
import { logger } from '@/lib/utils/logger';

// PUT /api/slider/reorder - Admin only, bulk update display_order
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { slides } = body;

    // Validate input
    if (!Array.isArray(slides)) {
      return NextResponse.json(
        { error: 'slides must be an array of {id, display_order}' },
        { status: 400 }
      );
    }

    // Update each slide's display_order
    const updates = slides.map(({ id, display_order }: { id: string; display_order: number }) =>
      prisma.sliderContent.updateMany({
        where: {
          id,
          is_deleted: false,
        },
        data: {
          display_order,
        },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Error reordering slides:', error);
    return NextResponse.json(
      { error: 'Failed to reorder slides' },
      { status: 500 }
    );
  }
}