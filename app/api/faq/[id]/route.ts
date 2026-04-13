import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/faq/[id]
 * Get a single FAQ by ID
 * Auth: Required (any authenticated user)
 */
export async function GET(
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
    
    const { id } = await context.params;
    
    const faq = await prisma.fAQ.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      select: {
        id: true,
        question_en: true,
        question_ar: true,
        answer_en: true,
        answer_ar: true,
        is_favorite: true,
        display_order: true,
        created_at: true,
        updated_at: true,
      }
    });
    
    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data: faq });
    
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQ' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/faq/[id]
 * Update an existing FAQ
 * Auth: Admin only
 */
export async function PUT(
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
    
    // Check if FAQ exists and not deleted
    const existingFaq = await prisma.fAQ.findFirst({
      where: {
        id,
        is_deleted: false,
      }
    });
    
    if (!existingFaq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { question_en, question_ar, answer_en, answer_ar, is_favorite } = body;
    
    // Build update data (only include provided fields)
    const updateData: any = {
      updated_by: user.id,
    };
    
    if (question_en !== undefined) {
      if (question_en.length > 500) {
        return NextResponse.json(
          { error: 'English question must not exceed 500 characters' },
          { status: 400 }
        );
      }
      updateData.question_en = question_en;
    }
    
    if (question_ar !== undefined) {
      if (question_ar.length > 500) {
        return NextResponse.json(
          { error: 'Arabic question must not exceed 500 characters' },
          { status: 400 }
        );
      }
      updateData.question_ar = question_ar;
    }
    
    if (answer_en !== undefined) updateData.answer_en = answer_en;
    if (answer_ar !== undefined) updateData.answer_ar = answer_ar;
    if (is_favorite !== undefined) updateData.is_favorite = is_favorite;
    
    // Update FAQ
    const faq = await prisma.fAQ.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        question_en: true,
        question_ar: true,
        answer_en: true,
        answer_ar: true,
        is_favorite: true,
        display_order: true,
        updated_by: true,
        updated_at: true,
      }
    });
    
    return NextResponse.json({ data: faq });
    
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/faq/[id]
 * Soft-delete an FAQ (sets is_deleted = true)
 * Auth: Admin only
 */
export async function DELETE(
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
    
    // Check if FAQ exists and not already deleted
    const existingFaq = await prisma.fAQ.findFirst({
      where: {
        id,
        is_deleted: false,
      }
    });
    
    if (!existingFaq) {
      return NextResponse.json(
        { error: 'FAQ not found or already deleted' },
        { status: 404 }
      );
    }
    
    // Soft delete FAQ
    await prisma.fAQ.update({
      where: { id },
      data: {
        is_deleted: true,
        updated_by: user.id,
      }
    });
    
    return NextResponse.json({
      data: {
        message: 'FAQ deleted successfully',
        id
      }
    });
    
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
