import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * PUT /api/navigation/[id]
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
      select: { role: true },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    // Build update data - only include provided fields
    const updateData: Record<string, unknown> = {};
    if (body.label_en !== undefined) updateData.label_en = body.label_en;
    if (body.label_ar !== undefined) updateData.label_ar = body.label_ar;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.parent_id !== undefined) updateData.parent_id = body.parent_id || null;
    if (body.icon !== undefined) updateData.icon = body.icon || null;
    if (body.is_visible !== undefined) updateData.is_visible = body.is_visible;
    if (body.display_order !== undefined) updateData.display_order = body.display_order;
    if (body.target !== undefined) updateData.target = body.target;

    const navItem = await prisma.navigation.update({
      where: { id },
      data: updateData,
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
 * DELETE /api/navigation/[id]
 * Delete a navigation item and its children (Admin only)
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
      select: { role: true },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Delete child items first (dropdown items or section links)
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
