import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/permissions';
import { logger } from '@/lib/utils/logger';

// PUT /api/style-library/files/[id]/move - Admin only, move file to another folder
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
    const { folder_id } = body;

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

    // Verify target folder exists if provided
    if (folder_id) {
      const folder = await prisma.styleLibraryFolder.findFirst({
        where: {
          id: folder_id,
          is_deleted: false,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: 'Target folder not found' },
          { status: 404 }
        );
      }
    }

    const updatedFile = await prisma.styleLibraryFile.update({
      where: { id },
      data: {
        folder_id: folder_id || null,
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

    return NextResponse.json({ file: updatedFile }, { status: 200 });
  } catch (error) {
    logger.error('Error moving file:', error);
    return NextResponse.json(
      { error: 'Failed to move file' },
      { status: 500 }
    );
  }
}