import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/permissions';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm',
  'application/pdf',
  'image/x-icon', 'image/vnd.microsoft.icon' // For icons
];

// GET /api/style-library/files - Get files (optionally filtered by folder)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folder_id');
    const fileType = searchParams.get('file_type'); // e.g., 'image', 'video'
    const search = searchParams.get('search');

    const where: any = {
      is_deleted: false,
    };

    if (folderId) {
      where.folder_id = folderId;
    }

    if (fileType) {
      where.file_type = {
        startsWith: fileType
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    const files = await prisma.styleLibraryFile.findMany({
      where,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            path: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// POST /api/style-library/files - Admin only, upload file
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folder_id') as string | null;
    const description = formData.get('description') as string | null;
    const tagsStr = formData.get('tags') as string | null;
    const replaceExisting = formData.get('replace_existing') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log('📤 Upload attempt:', file.name, '(' + file.type + ', ' + fileSizeMB + 'MB)');

    // Check if file with same name already exists in the same folder
    const existingFile = await prisma.styleLibraryFile.findFirst({
      where: {
        name: file.name,
        folder_id: folderId || null,
        is_deleted: false,
      },
    });

    if (existingFile && !replaceExisting) {
      console.log('⚠️ File already exists:', file.name);
      return NextResponse.json(
        { 
          error: 'FILE_EXISTS',
          message: 'A file with this name already exists in this location',
          existingFile: {
            id: existingFile.id,
            name: existingFile.name,
            file_url: existingFile.file_url,
            created_at: existingFile.created_at,
          }
        },
        { status: 409 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type "' + file.type + '". Allowed types: images (JPEG, PNG, GIF, WebP, SVG), videos (MP4, WebM), PDFs, and icons' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error('❌ File too large:', file.size, 'bytes (max:', MAX_FILE_SIZE + ')');
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      return NextResponse.json(
        { error: 'File too large (' + fileSizeMB + 'MB). Maximum size: ' + maxSizeMB + 'MB' },
        { status: 400 }
      );
    }

    console.log('✓ File validation passed');

    // Verify folder exists if provided
    if (folderId) {
      const folder = await prisma.styleLibraryFolder.findFirst({
        where: {
          id: folderId,
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

    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not configured');
      return NextResponse.json(
        { error: 'Storage not configured. Please enable Vercel Blob in your project settings.' },
        { status: 500 }
      );
    }

    // Sanitize filename
    const originalName = file.name;
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const baseName = originalName
      .substring(0, originalName.lastIndexOf('.'))
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    
    // When replacing, use the same filename WITHOUT timestamp to keep the same URL
    // When uploading new, add timestamp to avoid conflicts
    let sanitizedName: string;
    let blobPath: string;
    
    if (existingFile && replaceExisting) {
      // Use the original filename pattern (without timestamp) to maintain the same URL
      sanitizedName = baseName + extension;
      blobPath = 'style-library/' + sanitizedName;
      console.log('🔄 Replacing file with same path:', blobPath);
    } else {
      // New upload: add timestamp to ensure uniqueness
      const timestamp = Date.now();
      sanitizedName = baseName + '_' + timestamp + extension;
      blobPath = 'style-library/' + sanitizedName;
    }

    // Upload to Vercel Blob
    let blob;
    try {
      console.log('📤 Uploading to Vercel Blob:', blobPath);
      blob = await put(blobPath, file, {
        access: 'public',
        addRandomSuffix: false,
      });
      console.log('✓ Blob upload successful:', blob.url);
    } catch (blobError: any) {
      console.error('❌ Vercel Blob upload error:', blobError);
      const errorMsg = blobError?.message || 'Unknown error';
      return NextResponse.json(
        { error: 'Blob upload failed: ' + errorMsg + '. Please ensure Vercel Blob is enabled in your project settings.' },
        { status: 500 }
      );
    }

    // If replacing existing file, delete the old blob first
    if (existingFile && replaceExisting) {
      console.log('🔄 Replacing existing file:', existingFile.name);
      
      // Delete old file from Vercel Blob if it's a blob URL
      if (existingFile.file_url.includes('vercel-storage.com')) {
        try {
          await del(existingFile.file_url);
          console.log('✓ Deleted old blob:', existingFile.file_url);
        } catch (delError) {
          console.error('⚠️ Failed to delete old blob (continuing anyway):', delError);
        }
      }
    }

    // Parse tags
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];

    // Get image/video dimensions if applicable
    let width: number | null = null;
    let height: number | null = null;
    
    // Note: Getting dimensions server-side is complex. 
    // For images, we could use sharp library. For now, we'll set them to null
    // and allow the admin UI to optionally update them.

    // Create or update file record
    let fileRecord;
    
    if (existingFile && replaceExisting) {
      // Update existing record to keep the same ID and maintain references
      fileRecord = await prisma.styleLibraryFile.update({
        where: { id: existingFile.id },
        data: {
          file_url: blob.url,
          file_type: file.type,
          file_size: file.size,
          width,
          height,
          description: description?.trim() || existingFile.description,
          tags: tags.length > 0 ? tags : existingFile.tags,
          updated_at: new Date(),
          is_deleted: false, // Ensure not marked as deleted
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
      console.log('✓ File record updated in database:', fileRecord.id);
    } else {
      // Create new file record
      fileRecord = await prisma.styleLibraryFile.create({
        data: {
          folder_id: folderId || null,
          name: originalName,
          file_url: blob.url,
          file_type: file.type,
          file_size: file.size,
          width,
          height,
          description: description?.trim() || null,
          tags,
          created_by: user.clerk_user_id,
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
      console.log('✓ File record created in database:', fileRecord.id);
    }
    return NextResponse.json({ file: fileRecord }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    const errorMessage = error?.message || 'Failed to upload file';
    const detailedError = process.env.NODE_ENV === 'development' 
      ? errorMessage + ' - ' + (error?.stack?.split('\n')[0] || '')
      : errorMessage;
    
    return NextResponse.json(
      { error: detailedError },
      { status: 500 }
    );
  }
}
