import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

/**
 * PATCH /api/magazines/[id]/visible
 * Toggle the is_visible field for a Magazine
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    const { id } = await context.params;
    
    // Get current Magazine
    const currentMagazine = await prisma.magazine.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      select: {
        is_visible: true,
      }
    });
    
    if (!currentMagazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      );
    }
    
    // Toggle is_visible
    const updatedMagazine = await prisma.magazine.update({
      where: { id },
      data: {
        is_visible: !currentMagazine.is_visible,
        updated_by: user.id,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      is_visible: updatedMagazine.is_visible 
    });
  } catch (error) {
    logger.error('Error toggling Magazine visibility:', error);
    return NextResponse.json(
      { error: 'Failed to toggle visibility' },
      { status: 500 }
    );
  }
}