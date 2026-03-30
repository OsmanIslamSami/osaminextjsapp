import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// PATCH /api/home-sections/[section_type] - Update section configuration
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ section_type: string }> }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { section_type } = await params;
    const data = await request.json();

    // Validate section_type enum
    const validSectionTypes = ['photos', 'videos', 'partners'];
    if (!validSectionTypes.includes(section_type)) {
      return NextResponse.json(
        { success: false, error: `Invalid section_type. Must be one of: ${validSectionTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (typeof data.is_visible === 'boolean') {
      updateData.is_visible = data.is_visible;
    }

    // Partners-specific validation
    if (section_type === 'partners') {
      if (data.partners_display_mode !== undefined) {
        if (!['all', 'limit'].includes(data.partners_display_mode)) {
          return NextResponse.json(
            { success: false, error: 'partners_display_mode must be "all" or "limit"' },
            { status: 400 }
          );
        }
        updateData.partners_display_mode = data.partners_display_mode;
      }

      if (data.partners_max_count !== undefined) {
        const maxCount = parseInt(data.partners_max_count);
        if (isNaN(maxCount) || maxCount < 1) {
          return NextResponse.json(
            { success: false, error: 'partners_max_count must be a positive integer' },
            { status: 400 }
          );
        }
        updateData.partners_max_count = maxCount;
      }
    }

    // Update section
    const section = await prisma.home_sections.update({
      where: { section_type },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Section updated successfully',
      data: section,
    });
  } catch (error: any) {
    console.error('Home sections PATCH error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update section' },
      { status: 500 }
    );
  }
}
