import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/auth/permissions';

/**
 * GET /api/news/[id]
 * Get a specific news item (public for visible items, admin for all)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    const news = await prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    // Public users can only see visible, non-deleted news
    if (!userId || !(await hasPermission(userId, 'news:read'))) {
      if (news.is_deleted || !news.is_visible) {
        return NextResponse.json({ error: 'News not found' }, { status: 404 });
      }
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/news/[id]
 * Update a news item (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId || !(await hasPermission(userId, 'news:write'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    // Validation: if both titles are being set to null/empty, reject
    const newTitleEn = body.title_en !== undefined ? body.title_en : existingNews.title_en;
    const newTitleAr = body.title_ar !== undefined ? body.title_ar : existingNews.title_ar;

    if (!newTitleEn && !newTitleAr) {
      return NextResponse.json(
        { error: 'At least one title (EN or AR) must be non-empty' },
        { status: 400 }
      );
    }

    // Validation: published_date if provided
    if (body.published_date) {
      const publishedDate = new Date(body.published_date);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (publishedDate > oneYearFromNow) {
        return NextResponse.json(
          { error: 'Published date cannot be more than 1 year in the future' },
          { status: 400 }
        );
      }
    }

    // Update news
    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(body.title_en !== undefined && { title_en: body.title_en || null }),
        ...(body.title_ar !== undefined && { title_ar: body.title_ar || null }),
        ...(body.image_url && { image_url: body.image_url }),
        ...(body.published_date && { published_date: new Date(body.published_date) }),
        ...(body.is_visible !== undefined && { is_visible: body.is_visible }),
        ...(body.file_data && { file_data: Buffer.from(body.file_data, 'base64') }),
        ...(body.file_name && { file_name: body.file_name }),
        ...(body.file_size !== undefined && { file_size: body.file_size }),
        ...(body.mime_type && { mime_type: body.mime_type }),
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { error: 'Failed to update news' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/news/[id]
 * Soft delete a news item (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId || !(await hasPermission(userId, 'news:delete'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.news.update({
      where: { id },
      data: { is_deleted: true },
    });

    return NextResponse.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { error: 'Failed to delete news' },
      { status: 500 }
    );
  }
}
