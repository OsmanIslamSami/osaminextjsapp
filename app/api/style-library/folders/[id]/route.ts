import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/permissions';

// GET /api/style-library/folders/[id] - Get folder with contents
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const folder = await prisma.styleLibraryFolder.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        parent: true,
        children: {
          where: { is_deleted: false },
          include: {
            _count: {
              select: {
                files: { where: { is_deleted: false } },
                children: { where: { is_deleted: false } }
              }
            }
          }
        },
        files: {
          where: { is_deleted: false },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ folder }, { status: 200 });
  } catch (error) {
    console.error('Error fetching folder:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folder' },
      { status: 500 }
    );
  }
}

// PUT /api/style-library/folders/[id] - Admin only, update folder
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
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    // Validate folder name
    const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validNamePattern.test(name)) {
      return NextResponse.json(
        { error: 'Folder name can only contain letters, numbers, spaces, hyphens, and underscores' },
        { status: 400 }
      );
    }

    // Get current folder
    const currentFolder = await prisma.styleLibraryFolder.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        parent: true,
      }
    });

    if (!currentFolder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name in same parent (excluding current folder)
    if (name !== currentFolder.name) {
      const existing = await prisma.styleLibraryFolder.findFirst({
        where: {
          name,
          parent_id: currentFolder.parent_id,
          is_deleted: false,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'A folder with this name already exists in this location' },
          { status: 409 }
        );
      }
    }

    // Build new path
    const newPath = currentFolder.parent
      ? `${currentFolder.parent.path}/${name}`
      : `/${name}`;

    // Update folder and all children paths if name changed
    if (name !== currentFolder.name) {
      // Update the folder itself
      await prisma.styleLibraryFolder.update({
        where: { id },
        data: {
          name: name.trim(),
          path: newPath,
          description: description?.trim() || null,
        },
      });

      // Update all descendant paths (recursive)
      await updateDescendantPaths(id, currentFolder.path, newPath);
    } else {
      // Just update description
      await prisma.styleLibraryFolder.update({
        where: { id },
        data: {
          description: description?.trim() || null,
        },
      });
    }

    // Return updated folder
    const folder = await prisma.styleLibraryFolder.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            files: { where: { is_deleted: false } },
            children: { where: { is_deleted: false } }
          }
        }
      }
    });

    return NextResponse.json({ folder }, { status: 200 });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    );
  }
}

// DELETE /api/style-library/folders/[id] - Admin only, soft-delete folder
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

    // Check if folder exists
    const folder = await prisma.styleLibraryFolder.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        _count: {
          select: {
            children: { where: { is_deleted: false } },
            files: { where: { is_deleted: false } }
          }
        }
      }
    });

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Soft delete the folder and all its contents recursively
    await deleteFolderRecursive(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}

// Helper: Update paths of all descendant folders
async function updateDescendantPaths(folderId: string, oldPath: string, newPath: string) {
  const children = await prisma.styleLibraryFolder.findMany({
    where: {
      parent_id: folderId,
      is_deleted: false,
    },
  });

  for (const child of children) {
    const updatedChildPath = child.path.replace(oldPath, newPath);
    await prisma.styleLibraryFolder.update({
      where: { id: child.id },
      data: { path: updatedChildPath },
    });

    // Recursively update grandchildren
    await updateDescendantPaths(child.id, child.path, updatedChildPath);
  }
}

// Helper: Recursively soft-delete folder and all contents
async function deleteFolderRecursive(folderId: string) {
  // Get all child folders
  const children = await prisma.styleLibraryFolder.findMany({
    where: {
      parent_id: folderId,
      is_deleted: false,
    },
  });

  // Recursively delete children
  for (const child of children) {
    await deleteFolderRecursive(child.id);
  }

  // Soft delete all files in this folder
  await prisma.styleLibraryFile.updateMany({
    where: {
      folder_id: folderId,
      is_deleted: false,
    },
    data: {
      is_deleted: true,
    },
  });

  // Soft delete the folder itself
  await prisma.styleLibraryFolder.update({
    where: { id: folderId },
    data: {
      is_deleted: true,
    },
  });
}
