import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/permissions';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

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

    // Only admins can change user roles
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || (role !== 'admin' && role !== 'user')) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "user".' },
        { status: 400 }
      );
    }

    // Prevent admin from demoting themselves
    if (id === currentUser.id && role === 'user') {
      return NextResponse.json(
        { error: 'You cannot change your own role.' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
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
    logger.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}