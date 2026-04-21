import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/permissions';
import { logger } from '@/lib/utils/logger';

// PUT /api/slider/[id]/toggle - Admin only, toggle is_active
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Fetch current slide
    const currentSlide = await prisma.sliderContent.findFirst({
      where: {
        id: id,
        is_deleted: false,
      },
    });

    if (!currentSlide) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }

    // Toggle is_visible
    const slide = await prisma.sliderContent.update({
      where: {
        id: id,
      },
      data: {
        is_visible: !currentSlide.is_visible,
      },
    });

    return NextResponse.json({ slide }, { status: 200 });
  } catch (error) {
    logger.error('Error toggling slide:', error);
    return NextResponse.json(
      { error: 'Failed to toggle slide' },
      { status: 500 }
    );
  }
}