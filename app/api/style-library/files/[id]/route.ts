import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/permissions';
import { logger } from '@/lib/utils/logger';

// GET /api/style-library/files/[id] - Get file details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const file = await prisma.styleLibraryFile.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            path: true
          }
        }
      }
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ file }, { status: 200 });
  } catch (error) {
    logger.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

// PUT /api/style-library/files/[id] - Admin only, update file metadata
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, description, tags, folder_id, width, height } = body;

    const currentFile = await prisma.styleLibraryFile.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!currentFile) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Verify folder exists if provided
    if (folder_id !== undefined && folder_id !== null) {
      const folder = await prisma.styleLibraryFolder.findFirst({
        where: {
          id: folder_id,
          is_deleted: false,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: 'Folder not found' },
          { status: 404 }
        );
      }
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (tags !== undefined) updateData.tags = tags;
    if (folder_id !== undefined) updateData.folder_id = folder_id || null;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;

    const file = await prisma.styleLibraryFile.update({
      where: { id },
      data: updateData,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            path: true
          }
        }
      }
    });

    return NextResponse.json({ file }, { status: 200 });
  } catch (error) {
    logger.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

// DELETE /api/style-library/files/[id] - Admin only, delete file
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const file = await prisma.styleLibraryFile.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Soft delete in database
    await prisma.styleLibraryFile.update({
      where: { id },
      data: {
        is_deleted: true,
      },
    });

    // Delete from Vercel Blob if it's a blob URL
    if (file.file_url.includes('vercel-storage.com')) {
      try {
        await del(file.file_url);
      } catch (blobError) {
        logger.error('Error deleting blob:', blobError);
        // Continue even if blob deletion fails
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}