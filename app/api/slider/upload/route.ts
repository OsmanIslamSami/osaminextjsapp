import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/permissions';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

// POST /api/slider/upload - Admin only, upload media files to database (local storage)
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

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Convert file to buffer for database storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a database record with the file data
    const slide = await prisma.sliderContent.create({
      data: {
        media_url: '', // Will be updated with the ID after creation
        media_type: file.type.startsWith('video/') ? 'video' : file.type === 'image/gif' ? 'gif' : 'image',
        storage_type: 'local',
        file_data: buffer,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        is_visible: false, // Set to false initially, admin needs to configure and publish
      },
    });

    // Update media_url to point to the API endpoint
    const mediaUrl = `/api/slider/media/${slide.id}`;
    await prisma.sliderContent.update({
      where: { id: slide.id },
      data: { media_url: mediaUrl },
    });

    return NextResponse.json(
      { 
        url: mediaUrl,
        id: slide.id,
        filename: file.name,
        size: file.size,
        type: file.type,
        storage_type: 'local' // Indicate this is stored in database (local)
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}