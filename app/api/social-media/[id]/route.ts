import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/permissions';

// GET single social media link
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const link = await prisma.socialMediaLink.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Social media link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: link.id,
      platform: link.platform,
      url: link.url,
      icon_path: link.icon_path,
      display_order: link.display_order,
      created_at: link.created_at.toISOString(),
      updated_at: link.updated_at.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching social media link:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social media link' },
      { status: 500 }
    );
  }
}

// PUT update social media link (admin only)
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

    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { platform, url, icon_path, display_order } = body;

    // Validation
    if (url) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    if (icon_path) {
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
    }

    const updatedLink = await prisma.socialMediaLink.update({
      where: { id },
      data: {
        ...(platform && { platform }),
        ...(url && { url }),
        ...(icon_path && { icon_path }),
        ...(display_order !== undefined && { display_order }),
      },
    });

    return NextResponse.json({
      id: updatedLink.id,
      platform: updatedLink.platform,
      url: updatedLink.url,
      icon_path: updatedLink.icon_path,
      display_order: updatedLink.display_order,
      created_at: updatedLink.created_at.toISOString(),
      updated_at: updatedLink.updated_at.toISOString(),
    });
  } catch (error: any) {
    console.error('Error updating social media link:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Social media link not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update social media link' },
      { status: 500 }
    );
  }
}

// DELETE social media link (soft delete, admin only)
export async function DELETE(
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

    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.socialMediaLink.update({
      where: {
        id,
        is_deleted: false,
      },
      data: {
        is_deleted: true,
      },
    });

    return NextResponse.json({ message: 'Social media link deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting social media link:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Social media link not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete social media link' },
      { status: 500 }
    );
  }
}
