import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

// POST /api/home-sections/reorder - Reorder sections
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { section_type, direction } = body;

    if (!section_type || !direction || !['up', 'down'].includes(direction)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. section_type and direction (up/down) are required' },
        { status: 400 }
      );
    }

    // Get all sections ordered by display_order
    const sections = await prisma.home_sections.findMany({
      orderBy: { display_order: 'asc' },
    });

    // Find the current section index
    const currentIndex = sections.findIndex((s) => s.section_type === section_type);

    if (currentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    // Calculate new index
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    // Check boundaries
    if (newIndex < 0 || newIndex >= sections.length) {
      return NextResponse.json(
        { success: false, error: 'Cannot move section beyond boundaries' },
        { status: 400 }
      );
    }

    // Swap display_order values
    const currentSection = sections[currentIndex];
    const targetSection = sections[newIndex];

    await prisma.$transaction([
      prisma.home_sections.update({
        where: { section_type: currentSection.section_type },
        data: { display_order: targetSection.display_order },
      }),
      prisma.home_sections.update({
        where: { section_type: targetSection.section_type },
        data: { display_order: currentSection.display_order },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Section reordered successfully',
    });
  } catch (error) {
    logger.error('Home sections reorder error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder section' },
      { status: 500 }
    );
  }
}