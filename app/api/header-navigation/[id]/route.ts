import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * PUT /api/header-navigation/[id]
 * Update a navigation item (Admin only)
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
    
    const user = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
      select: { role: true }
    });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    
    const navItem = await prisma.navigation.update({
      where: { id },
      data: {
        label_en: body.label_en,
        label_ar: body.label_ar,
        url: body.url,
        type: body.type,
        parent_id: body.parent_id || null,
        icon: body.icon || null,
        is_visible: body.is_visible,
        display_order: body.display_order,
        target: body.target || '_self',
      },
    });
    
    return NextResponse.json({ data: navItem });
  } catch (error) {
    console.error('Error updating navigation item:', error);
    return NextResponse.json(
      { error: 'Failed to update navigation item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/header-navigation/[id]
 * Delete a navigation item (Admin only)
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
    
    const user = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
      select: { role: true }
    });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    
    // Also delete child items if it's a dropdown
    await prisma.navigation.deleteMany({
      where: { parent_id: id },
    });
    
    await prisma.navigation.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting navigation item:', error);
    return NextResponse.json(
      { error: 'Failed to delete navigation item' },
      { status: 500 }
    );
  }
}
