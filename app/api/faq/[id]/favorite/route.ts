import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * PATCH /api/faq/[id]/favorite
 * Toggle the is_favorite field for a FAQ
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
        is_favorite: true,
      }
    });
    
    if (!currentFAQ) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    // Toggle is_favorite
    const updatedFAQ = await prisma.fAQ.update({
      where: { id },
      data: {
        is_favorite: !currentFAQ.is_favorite,
        updated_by: user.id,
        updated_at: new Date(),
      },
      select: {
        id: true,
        question_en: true,
        question_ar: true,
        answer_en: true,
        answer_ar: true,
        is_favorite: true,
        created_at: true,
        updated_at: true,
      }
    });
    
    return NextResponse.json(updatedFAQ);
    
  } catch (error) {
    console.error('Toggle FAQ favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}
