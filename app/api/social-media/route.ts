import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/permissions';
import { logger } from '@/lib/utils/logger';

// GET all active social media links (public)
export async function GET() {
  try {
    const links = await prisma.socialMediaLink.findMany({
      where: {
        is_deleted: false,
      },
      orderBy: {
        display_order: 'asc',
      },
    });

    const formattedLinks = links.map(link => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
      icon_path: link.icon_path,
      display_order: link.display_order,
      created_at: link.created_at.toISOString(),
      updated_at: link.updated_at.toISOString(),
    }));

    return NextResponse.json(formattedLinks);
  } catch (error) {
    logger.error('Error fetching social media links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social media links' },
      { status: 500 }
    );
  }
}

// POST create new social media link (admin only)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { platform, url, icon_path, display_order } = body;

    // Validation
    if (!platform || !url || !icon_path) {
      return NextResponse.json(
        { error: 'Platform, URL, and icon_path are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate icon_path format
    const validExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];
    const hasValidExtension = validExtensions.some(ext => icon_path.toLowerCase().endsWith(ext));
    const isLocalPath = icon_path.startsWith('/icons/');
    const isVercelBlob = icon_path.includes('vercel-storage.com');
    const isValidUrl = icon_path.startsWith('http://') || icon_path.startsWith('https://');
    
    // Accept: local /icons/ paths with valid extensions, OR Vercel Blob URLs, OR other valid image URLs
    if (!hasValidExtension) {
      return NextResponse.json(
        { error: 'Icon must be a valid image file (.svg, .png, .jpg, .jpeg, .webp)' },
        { status: 400 }
      );
    }
    
    if (!isLocalPath && !isVercelBlob && !isValidUrl) {
      return NextResponse.json(
        { error: 'Icon path must be a local path (/icons/...) or a valid URL' },
        { status: 400 }
      );
    }

    const newLink = await prisma.socialMediaLink.create({
      data: {
        platform,
        url,
        icon_path,
        display_order: display_order || 0,
      },
    });

    return NextResponse.json({
      id: newLink.id,
      platform: newLink.platform,
      url: newLink.url,
      icon_path: newLink.icon_path,
      display_order: newLink.display_order,
      created_at: newLink.created_at.toISOString(),
      updated_at: newLink.updated_at.toISOString(),
    }, { status: 201 });
  } catch (error) {
    logger.error('Error creating social media link:', error);
    return NextResponse.json(
      { error: 'Failed to create social media link' },
      { status: 500 }
    );
  }
}