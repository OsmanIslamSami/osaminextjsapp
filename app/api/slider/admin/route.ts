import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/permissions';

// GET /api/slider/admin - Admin only, fetch all slides (including hidden)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const slides = await prisma.sliderContent.findMany({
      where: {
        is_deleted: false,
      },
      orderBy: {
        display_order: 'asc',
      },
    });

    return NextResponse.json({ slides }, { status: 200 });
  } catch (error) {
    console.error('Error fetching slides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slides' },
      { status: 500 }
    );
  }
}
