import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// GET /api/home-sections - Get all sections or single section by section_type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section_type = searchParams.get('section_type');

    if (section_type) {
      const section = await prisma.home_sections.findUnique({
        where: { section_type },
      });

      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Section not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: section });
    }

    const sections = await prisma.home_sections.findMany({
      orderBy: { display_order: 'asc' },
    });

    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error('Home sections GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}
