import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/permissions';
import { logger } from '@/lib/utils/logger';

// GET /api/style-library/folders - Get all folders (hierarchical)
export async function GET() {
  try {
    const folders = await prisma.styleLibraryFolder.findMany({
      where: {
        is_deleted: false,
      },
      include: {
        _count: {
          select: {
            files: {
              where: { is_deleted: false }
            },
            children: {
              where: { is_deleted: false }
            }
          }
        }
      },
      orderBy: [
        { path: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ folders }, { status: 200 });
  } catch (error) {
    logger.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

// POST /api/style-library/folders - Admin only, create folder
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
    const { name, parent_id, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    // Validate folder name (no special characters)
    const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validNamePattern.test(name)) {
      return NextResponse.json(
        { error: 'Folder name can only contain letters, numbers, spaces, hyphens, and underscores' },
        { status: 400 }
      );
    }

    // Build the path
    let path = `/${name}`;
    if (parent_id) {
      const parent = await prisma.styleLibraryFolder.findFirst({
        where: {
          id: parent_id,
          is_deleted: false,
        },
      });

      if (!parent) {
        return NextResponse.json(
          { error: 'Parent folder not found' },
          { status: 404 }
        );
      }

      path = `${parent.path}/${name}`;
    }

    // Check for duplicate name in same parent
    const existing = await prisma.styleLibraryFolder.findFirst({
      where: {
        name,
        parent_id: parent_id || null,
        is_deleted: false,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A folder with this name already exists in this location' },
        { status: 409 }
      );
    }

    const folder = await prisma.styleLibraryFolder.create({
      data: {
        name: name.trim(),
        parent_id: parent_id || null,
        path,
        description: description?.trim() || null,
        created_by: user.clerk_user_id,
      },
      include: {
        _count: {
          select: {
            files: { where: { is_deleted: false } },
            children: { where: { is_deleted: false } }
          }
        }
      }
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    logger.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}