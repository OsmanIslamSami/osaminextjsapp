import { NextRequest, NextResponse } from 'next/server';

// GET /api/style-library/diagnostics - Check system configuration
export async function GET(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    vercelBlob: {
      configured: !!process.env.BLOB_READ_WRITE_TOKEN,
      tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0,
    },
    limits: {
      maxFileSize: '50 MB',
      maxFileSizeBytes: 50 * 1024 * 1024,
      allowedTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm',
        'application/pdf',
        'image/x-icon', 'image/vnd.microsoft.icon'
      ]
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      runtime: 'Node.js',
    }
  };

  return NextResponse.json(diagnostics, { status: 200 });
}
