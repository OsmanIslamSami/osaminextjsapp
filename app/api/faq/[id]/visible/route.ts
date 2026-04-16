import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * PATCH /api/faq/[id]/visible
 * Toggle the is_visible field for a FAQ
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
    
    // Get current FAQ
    const currentFAQ = await prisma.fAQ.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      select: {
        is_visible: true,
      }
    });
    
    if (!currentFAQ) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    // Toggle is_visible
    const updatedFAQ = await prisma.fAQ.update({
      where: { id },
      data: {
        is_visible: !currentFAQ.is_visible,
        updated_by: user.id,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      is_visible: updatedFAQ.is_visible 
    });
  } catch (error) {
    console.error('Error toggling FAQ visibility:', error);
    return NextResponse.json(
      { error: 'Failed to toggle visibility' },
      { status: 500 }
    );
  }
}
