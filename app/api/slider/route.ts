import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/permissions';

// GET /api/slider - Public route to fetch active slides (only visible ones)
export async function GET() {
  try {
    // Only return slides that are visible AND not deleted
    // Hidden slides (is_visible: false) are NOT returned to the public
    const slides = await prisma.sliderContent.findMany({
      where: {
        is_visible: true,
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

// POST /api/slider - Admin only, create slide
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      media_url,
      media_type,
      title_en,
      title_ar,
      button_text_en,
      button_text_ar,
      button_url,
      show_button,
      display_order,
      is_visible,
    } = body;

    // Validate media_type
    const validMediaTypes = ['image', 'video', 'gif'];
    if (!validMediaTypes.includes(media_type)) {
      return NextResponse.json(
        { error: 'Invalid media_type. Must be one of: image, video, gif' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!media_url || !media_type) {
      return NextResponse.json(
        { error: 'media_url and media_type are required' },
        { status: 400 }
      );
    }

    const slide = await prisma.sliderContent.create({
      data: {
        media_url,
        media_type,
        title_en: title_en || null,
        title_ar: title_ar || null,
        button_text_en: button_text_en || null,
        button_text_ar: button_text_ar || null,
        button_url: button_url || null,
        show_button: show_button ?? false,
        display_order: display_order ?? 0,
        is_visible: is_visible ?? true,
      },
    });

    return NextResponse.json({ slide }, { status: 201 });
  } catch (error) {
    console.error('Error creating slide:', error);
    return NextResponse.json(
      { error: 'Failed to create slide' },
      { status: 500 }
    );
  }
}
