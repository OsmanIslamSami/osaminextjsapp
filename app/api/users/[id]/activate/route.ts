import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/permissions';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Only admins can activate users
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { is_active: true },
    });

    return NextResponse.json({
      id: updatedUser.id,
      clerk_user_id: updatedUser.clerk_user_id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      is_active: updatedUser.is_active,
      created_at: updatedUser.created_at.toISOString(),
      updated_at: updatedUser.updated_at.toISOString(),
    });
  } catch (error) {
    console.error('Error activating user:', error);
    return NextResponse.json(
      { error: 'Failed to activate user' },
      { status: 500 }
    );
  }
}
