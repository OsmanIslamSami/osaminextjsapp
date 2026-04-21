import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/permissions';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Only admins can list all users
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: {
        created_at: 'desc',
      },
      take: 500, // Limit to 500 users per request (can be made configurable)
    });

    const total = await prisma.user.count();

    const formattedUsers = users.map(user => ({
      id: user.id,
      clerk_user_id: user.clerk_user_id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    }));

    return NextResponse.json({ 
      users: formattedUsers,
      total 
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}