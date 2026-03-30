# Quickstart Guide: Media Library Home Sections

**Feature**: 005-media-library-home  
**Estimated Time**: 8-12 hours for complete implementation  
**Prerequisites**: Next.js 16.1.6, Prisma 7.5.0, Clerk Auth configured  

---

## Implementation Phases

### Phase 1: Database Schema (30 min)
### Phase 2: Seed Data & Utilities (30 min)
Phase 3: API Routes (3-4 hours)
### Phase 4: Frontend Components (4-5 hours)
### Phase 5: Admin Panel (2-3 hours)
### Phase 6: Testing & Validation (1-2 hours)

---

## Phase 1: Database Schema Migration

### Step 1.1: Update Prisma Schema

**File**: `prisma/schema.prisma`

Add four new models at the end of the file:

```prisma
// Media Library: Photos
model photos {
  id              String    @id @default(cuid())
  title_en        String
  title_ar        String
  description_en  String?   @db.Text
  description_ar  String?   @db.Text
  image_url       String
  storage_type    String    @default("blob")
  file_name       String?
  file_size       Int?
  mime_type       String?
  file_data       Bytes?
  is_featured     Boolean   @default(false)
  is_visible      Boolean   @default(true)
  is_deleted      Boolean   @default(false)
  display_order   Int       @default(0)
  published_date  DateTime  @default(now())
  created_by      String?
  updated_by      String?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  
  createdByUser   User?     @relation("PhotosCreatedBy", fields: [created_by], references: [id])
  updatedByUser   User?     @relation("PhotosUpdatedBy", fields: [updated_by], references: [id])
  
  @@index([is_deleted, is_visible, is_featured, published_date(sort: Desc)])
  @@index([published_date(sort: Desc)])
  @@index([created_at])
  @@map("photos")
}

// Media Library: Videos
model videos {
  id              String    @id @default(cuid())
  title_en        String
  title_ar        String
  description_en  String?   @db.Text
  description_ar  String?   @db.Text
  youtube_url     String
  video_id        String?
  thumbnail_url   String?
  storage_type    String    @default("blob")
  file_name       String?
  file_size       Int?
  mime_type       String?
  is_featured     Boolean   @default(false)
  is_visible      Boolean   @default(true)
  is_deleted      Boolean   @default(false)
  display_order   Int       @default(0)
  published_date  DateTime  @default(now())
  created_by      String?
  updated_by      String?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  
  createdByUser   User?     @relation("VideosCreatedBy", fields: [created_by], references: [id])
  updatedByUser   User?     @relation("VideosUpdatedBy", fields: [updated_by], references: [id])
  
  @@index([is_deleted, is_visible, is_featured, published_date(sort: Desc)])
  @@index([published_date(sort: Desc)])
  @@index([video_id])
  @@map("videos")
}

// Media Library: Partners
model partners {
  id              String    @id @default(cuid())
  title_en        String
  title_ar        String
  url             String?
  image_url       String
  storage_type    String    @default("blob")
  file_name       String?
  file_size       Int?
  mime_type       String?
  file_data       Bytes?
  is_featured     Boolean   @default(false)
  is_visible      Boolean   @default(true)
  is_deleted      Boolean   @default(false)
  display_order   Int       @default(0)
  created_by      String?
  updated_by      String?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  
  createdByUser   User?     @relation("PartnersCreatedBy", fields: [created_by], references: [id])
  updatedByUser   User?     @relation("PartnersUpdatedBy", fields: [updated_by], references: [id])
  
  @@index([is_deleted, is_visible, is_featured, created_at(sort: Desc)])
  @@index([created_at(sort: Desc)])
  @@map("partners")
}

// Media Library: Home Section Configuration
model home_sections {
  id                      String    @id @default(cuid())
  section_type            String    @unique
  is_visible              Boolean   @default(true)
  title_en                String?
  title_ar                String?
  display_order           Int       @default(0)
  partners_display_mode   String?   @default("all")
  partners_max_count      Int?
  created_at              DateTime  @default(now())
  updated_at              DateTime  @updatedAt
  
  @@map("home_sections")
}
```

### Step 1.2: Update User Model Relations

Find the `User` model in `schema.prisma` and add these relations:

```prisma
model User {
  // ... existing fields ...
  
  // Media Library relations
  photosCreated     photos[]    @relation("PhotosCreatedBy")
  photosUpdated     photos[]    @relation("PhotosUpdatedBy")
  videosCreated     videos[]    @relation("VideosCreatedBy")
  videosUpdated     videos[]    @relation("VideosUpdatedBy")
  partnersCreated   partners[]  @relation("PartnersCreatedBy")
  partnersUpdated   partners[]  @relation("PartnersUpdatedBy")
}
```

### Step 1.3: Generate and Run Migration

```bash
# Generate migration files
npx prisma migrate dev --name add_media_library_tables

# This will:
# 1. Create migration SQL in prisma/migrations/
# 2. Apply migration to local database
# 3. Regenerate Prisma Client types
```

**Expected output**:
```
✔ Generated migration files
✔ Applied migration: 20260330_add_media_library_tables
✔ Generated Prisma Client
```

### Step 1.4: Deploy to Production (Later)

```bash
# When ready for production deployment
npx prisma migrate deploy
```

---

## Phase 2: Seed Data & Utilities

### Step 2.1: Create Seed Script

**File**: `scripts/seed-media-library.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding media library...');

  // Initialize home section configurations
  const photosSection = await prisma.home_sections.upsert({
    where: { section_type: 'photos' },
    update: {},
    create: {
      section_type: 'photos',
      is_visible: true,
      display_order: 1,
    },
  });

  const videosSection = await prisma.home_sections.upsert({
    where: { section_type: 'videos' },
    update: {},
    create: {
      section_type: 'videos',
      is_visible: true,
      display_order: 2,
    },
  });

  const partnersSection = await prisma.home_sections.upsert({
    where: { section_type: 'partners' },
    update: {},
    create: {
      section_type: 'partners',
      is_visible: true,
      display_order: 3,
      partners_display_mode: 'all',
    },
  });

  console.log('✅ Home sections configured:', {
    photos: photosSection.id,
    videos: videosSection.id,
    partners: partnersSection.id,
  });

  // Optional: Create sample data for testing
  const samplePhoto = await prisma.photos.create({
    data: {
      title_en: 'Sample Photo',
      title_ar: 'صورة تجريبية',
      description_en: 'This is a sample photo for testing',
      description_ar: 'هذه صورة تجريبية للاختبار',
      image_url: 'https://via.placeholder.com/800x600',
      storage_type: 'blob',
      is_featured: true,
      is_visible: true,
      published_date: new Date(),
    },
  });

  const sampleVideo = await prisma.videos.create({
    data: {
      title_en: 'Sample Video',
      title_ar: 'فيديو تجريبي',
      description_en: 'This is a sample video for testing',
      description_ar: 'هذا فيديو تجريبي للاختبار',
      youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      video_id: 'dQw4w9WgXcQ',
      thumbnail_url: 'https://via.placeholder.com/640x360',
      storage_type: 'blob',
      is_featured: true,
      is_visible: true,
      published_date: new Date(),
    },
  });

  const samplePartner = await prisma.partners.create({
    data: {
      title_en: 'Partner Company',
      title_ar: 'شركة شريكة',
      url: 'https://example.com',
      image_url: 'https://via.placeholder.com/200x200',
      storage_type: 'blob',
      is_featured: true,
      is_visible: true,
    },
  });

  console.log('✅ Sample data created:', {
    photo: samplePhoto.id,
    video: sampleVideo.id,
    partner: samplePartner.id,
  });

  console.log('🎉 Media library seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Step 2.2: Run Seed Script

```bash
npx tsx scripts/seed-media-library.ts
```

### Step 2.3: Create Utility Functions

**File**: `lib/utils/youtube.ts`

```typescript
export function extractYouTubeVideoId(url: string): string | null {
  // Pattern 1: watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  
  // Pattern 2: youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  
  // Pattern 3: embed/VIDEO_ID
  const embedMatch = url.match(/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];
  
  return null;
}

export function validateYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
  ];
  return patterns.some(pattern => pattern.test(url));
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
}
```

**File**: `lib/utils/home-sections.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getHomeSectionConfig(
  sectionType: 'photos' | 'videos' | 'partners'
) {
  return await prisma.home_sections.findUnique({
    where: { section_type: sectionType },
  });
}

export async function getAllHomeSections() {
  return await prisma.home_sections.findMany({
    orderBy: { display_order: 'asc' },
  });
}

export const DEFAULT_SECTION_TITLES = {
  photos: { en: 'Photos', ar: 'الصور' },
  videos: { en: 'Videos', ar: 'الفيديوهات' },
  partners: { en: 'Our Partners', ar: 'شركاؤنا' },
};
```

---

## Phase 3: API Routes Implementation

### Step 3.1: Photos API Routes

**File**: `app/api/photos/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';

// GET /api/photos - List photos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const context = searchParams.get('context') || 'admin';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Single photo by ID
    if (id) {
      const photo = await prisma.photos.findUnique({
        where: { id },
        include: {
          createdByUser: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      if (!photo) {
        return NextResponse.json(
          { success: false, error: 'Photo not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: photo });
    }

    // List photos based on context
    let where: any = {};
    let orderBy: any = {};
    let take = limit;

    if (context === 'home') {
      where = {
        is_deleted: false,
        is_visible: true,
        published_date: { lte: new Date() },
      };
      orderBy = [
        { is_featured: 'desc' },
        { published_date: 'desc' },
      ];
      take = 5;
    } else if (context === 'gallery') {
      where = {
        is_deleted: false,
        is_visible: true,
        published_date: { lte: new Date() },
      };
      orderBy = { published_date: 'desc' };
    } else {
      // Admin context
      where = { is_deleted: false };
      orderBy = { created_at: 'desc' };
    }

    const [photos, total] = await Promise.all([
      prisma.photos.findMany({
        where,
        orderBy,
        take,
        skip: (page - 1) * take,
        include: {
          createdByUser: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      prisma.photos.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: photos,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Photos GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// POST /api/photos - Create photo
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const title_en = formData.get('title_en') as string;
    const title_ar = formData.get('title_ar') as string;
    const description_en = formData.get('description_en') as string | null;
    const description_ar = formData.get('description_ar') as string | null;
    const image = formData.get('image') as File | null;
    let image_url = formData.get('image_url') as string | null;
    const is_featured = formData.get('is_featured') === 'true';
    const is_visible = formData.get('is_visible') === 'true';
    const published_date = formData.get('published_date')
      ? new Date(formData.get('published_date') as string)
      : new Date();

    // Validation
    if (!title_en || !title_ar) {
      return NextResponse.json(
        { success: false, error: 'Titles (EN/AR) are required' },
        { status: 400 }
      );
    }

    // Upload image to Vercel Blob if file provided
    let file_name: string | null = null;
    let file_size: number | null = null;
    let mime_type: string | null = null;

    if (image) {
      // Validate file size (5MB)
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'File size exceeds 5MB limit' },
          { status: 400 }
        );
      }

      // Upload to Vercel Blob
      const blob = await put(`photos/${image.name}`, image, {
        access: 'public',
        addRandomSuffix: true,
      });

      image_url = blob.url;
      file_name = image.name;
      file_size = image.size;
      mime_type = image.type;
    }

    if (!image_url) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      );
    }

    // Create photo in database
    const photo = await prisma.photos.create({
      data: {
        title_en,
        title_ar,
        description_en,
        description_ar,
        image_url,
        storage_type: image ? 'blob' : 'url',
        file_name,
        file_size,
        mime_type,
        is_featured,
        is_visible,
        published_date,
        created_by: userId,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Photo created successfully', data: photo },
      { status: 201 }
    );
  } catch (error) {
    console.error('Photos POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create photo' },
      { status: 500 }
    );
  }
}
```

**File**: `app/api/photos/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';

// PUT /api/photos/:id - Update photo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const formData = await request.formData();

    const title_en = formData.get('title_en') as string;
    const title_ar = formData.get('title_ar') as string;
    const description_en = formData.get('description_en') as string | null;
    const description_ar = formData.get('description_ar') as string | null;
    const image = formData.get('image') as File | null;
    let image_url = formData.get('image_url') as string | null;
    const is_featured = formData.get('is_featured') === 'true';
    const is_visible = formData.get('is_visible') === 'true';
    const published_date = formData.get('published_date')
      ? new Date(formData.get('published_date') as string)
      : undefined;

    let updateData: any = {
      title_en,
      title_ar,
      description_en,
      description_ar,
      is_featured,
      is_visible,
      updated_by: userId,
    };

    if (published_date) {
      updateData.published_date = published_date;
    }

    // Upload new image if provided
    if (image) {
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'File size exceeds 5MB limit' },
          { status: 400 }
        );
      }

      const blob = await put(`photos/${image.name}`, image, {
        access: 'public',
        addRandomSuffix: true,
      });

      updateData.image_url = blob.url;
      updateData.storage_type = 'blob';
      updateData.file_name = image.name;
      updateData.file_size = image.size;
      updateData.mime_type = image.type;
    } else if (image_url) {
      updateData.image_url = image_url;
    }

    const photo = await prisma.photos.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Photo updated successfully',
      data: photo,
    });
  } catch (error) {
    console.error('Photos PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}

// DELETE /api/photos/:id - Soft delete photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const photo = await prisma.photos.update({
      where: { id },
      data: {
        is_deleted: true,
        updated_by: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
      data: { id: photo.id, is_deleted: true },
    });
  } catch (error) {
    console.error('Photos DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
```

### Step 3.2: Videos API Routes

**Similar structure to photos API, with YouTube URL handling**

**File**: `app/api/videos/route.ts` - Follow same pattern as photos with these changes:
- Use `youtube_url` and `video_id` fields
- Extract video ID using `extractYouTubeVideoId()` utility
- Use `thumbnail` field instead of `image`
- Take 6 items for home context instead of 5

### Step 3.3: Partners API Routes

**File**: `app/api/partners/route.ts` - Follow same pattern with these changes:
- Use `url` field for partner website (nullable)
- Check `home_sections` config for display mode/count
- Sort by `created_at` instead of `published_date`

### Step 3.4: Home Sections API Route

**File**: `app/api/home-sections/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section_type = searchParams.get('section_type');

    if (section_type) {
      const section = await prisma.home_sections.findUnique({
        where: { section_type },
      });

      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Section not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: section });
    }

    const sections = await prisma.home_sections.findMany({
      orderBy: { display_order: 'asc' },
    });

    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error('Home sections GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}
```

**File**: `app/api/home-sections/[section_type]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ section_type: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { section_type } = await params;
    const body = await request.json();

    const section = await prisma.home_sections.update({
      where: { section_type },
      data: body,
    });

    return NextResponse.json({
      success: true,
      message: 'Section updated successfully',
      data: section,
    });
  } catch (error) {
    console.error('Home sections PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update section' },
      { status: 500 }
    );
  }
}
```

---

## Phase 4: Frontend Components

### Step 4.1: Media Popup Component

**File**: `lib/components/MediaPopup.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaItem {
  id: string;
  title_en: string;
  title_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  image_url?: string;
}

interface MediaPopupProps {
  items: MediaItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  type: 'photo' | 'video';
  videoId?: string;
}

export function MediaPopup({
  items,
  currentIndex,
  onClose,
  onNavigate,
  type,
  videoId,
}: MediaPopupProps) {
  const { language, t } = useTranslation();
  const isRTL = language === 'ar';
  const currentItem = items[currentIndex];

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onNavigate(isRTL ? 'next' : 'prev');
          break;
        case 'ArrowRight':
          onNavigate(isRTL ? 'prev' : 'next');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyboard);
      document.body.style.overflow = 'unset';
    };
  }, [isRTL, onClose, onNavigate]);

  const title = isRTL ? currentItem.title_ar : currentItem.title_en;
  const description = isRTL
    ? currentItem.description_ar
    : currentItem.description_en;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      <div
        className="relative max-w-6xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
          aria-label="Close"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Navigation buttons */}
        <button
          onClick={() => onNavigate('prev')}
          className={`absolute top-1/2 -translate-y-1/2 ${
            isRTL ? 'right-4' : 'left-4'
          } z-10 text-white hover:text-gray-300`}
          aria-label={t('popup.previous')}
        >
          {isRTL ? (
            <ChevronRight className="w-12 h-12" />
          ) : (
            <ChevronLeft className="w-12 h-12" />
          )}
        </button>
        <button
          onClick={() => onNavigate('next')}
          className={`absolute top-1/2 -translate-y-1/2 ${
            isRTL ? 'left-4' : 'right-4'
          } z-10 text-white hover:text-gray-300`}
          aria-label={t('popup.next')}
        >
          {isRTL ? (
            <ChevronLeft className="w-12 h-12" />
          ) : (
            <ChevronRight className="w-12 h-12" />
          )}
        </button>

        {/* Media content */}
        <div className="bg-white rounded-lg overflow-hidden">
          {type === 'photo' && currentItem.image_url && (
            <Image
              src={currentItem.image_url}
              alt={title}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          )}

          {type === 'video' && videoId && (
            <div className="relative w-full aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          {/* Title and description */}
          <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            {description && <p className="text-gray-600">{description}</p>}
            <p className="text-sm text-gray-400 mt-4">
              {currentIndex + 1} / {items.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 4.2: Photos Section Component

**File**: `lib/components/home/PhotosSection.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import Image from 'next/image';
import Link from 'next/link';
import { MediaPopup } from '../MediaPopup';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  id: string;
  title_en: string;
  title_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  image_url: string;
}

interface PhotosSectionProps {
  photos: Photo[];
  title?: { en?: string; ar?: string };
}

export function PhotosSection({ photos, title }: PhotosSectionProps) {
  const { language, t } = useTranslation();
  const isRTL = language === 'ar';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);

  const sectionTitle =
    language === 'ar' ? title?.ar || 'الصور' : title?.en || 'Photos';

  const handlePhotoClick = (index: number) => {
    setPopupIndex(index);
    setShowPopup(true);
  };

  const handlePopupNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setPopupIndex((prev) => (prev + 1) % photos.length);
    } else {
      setPopupIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (photos.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{sectionTitle}</h2>
          <Link
            href="/photos"
            className="text-blue-600 hover:underline"
          >
            {t('viewAll')}
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(${isRTL ? '' : '-'}${currentSlide * 100}%)` }}
            >
              {photos.map((photo, index) => {
                const photoTitle =
                  language === 'ar' ? photo.title_ar : photo.title_en;
                return (
                  <div
                    key={photo.id}
                    className="min-w-full cursor-pointer"
                    onClick={() => handlePhotoClick(index)}
                  >
                    <Image
                      src={photo.image_url}
                      alt={photoTitle}
                      width={1200}
                      height={600}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                    <h3 className="text-xl font-semibold mt-4">{photoTitle}</h3>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slider controls */}
          <button
            onClick={prevSlide}
            className={`absolute top-1/2 -translate-y-1/2 ${
              isRTL ? 'right-4' : 'left-4'
            } bg-white p-2 rounded-full shadow-lg`}
            aria-label={t('slider.previous')}
          >
            {isRTL ? <ChevronRight /> : <ChevronLeft />}
          </button>
          <button
            onClick={nextSlide}
            className={`absolute top-1/2 -translate-y-1/2 ${
              isRTL ? 'left-4' : 'right-4'
            } bg-white p-2 rounded-full shadow-lg`}
            aria-label={t('slider.next')}
          >
            {isRTL ? <ChevronLeft /> : <ChevronRight />}
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <MediaPopup
          items={photos}
          currentIndex={popupIndex}
          onClose={() => setShowPopup(false)}
          onNavigate={handlePopupNavigate}
          type="photo"
        />
      )}
    </section>
  );
}
```

### Step 4.3: Videos Section Component

**File**: `lib/components/home/VideosSection.tsx` - Similar to PhotosSection with:
- Grid layout (2x3 for 6 videos)
- YouTube player in popup
- Thumbnail images for video cards

### Step 4.4: Partners Section Component

**File**: `lib/components/home/PartnersSection.tsx` - Similar to PhotosSection with:
- Partner logo rendering
- Clickable links if `url` provided
- Card-by-card slider

### Step 4.5: Update Home Page

**File**: `app/page.tsx`

```typescript
import { PhotosSection } from '@/lib/components/home/PhotosSection';
import { VideosSection } from '@/lib/components/home/VideosSection';
import { PartnersSection } from '@/lib/components/home/PartnersSection';
import { getAllHomeSections } from '@/lib/utils/home-sections';
import { prisma } from '@/lib/db';

async function getMediaSections() {
  const sections = await getAllHomeSections();
  
  const photosSection = sections.find(s => s.section_type === 'photos');
  const videosSection = sections.find(s => s.section_type === 'videos');
  const partnersSection = sections.find(s => s.section_type === 'partners');

  const photos = photosSection?.is_visible
    ? await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/photos?context=home`).then(r => r.json())
    : null;

  const videos = videosSection?.is_visible
    ? await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/videos?context=home`).then(r => r.json())
    : null;

  const partners = partnersSection?.is_visible
    ? await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/partners?context=home`).then(r => r.json())
    : null;

  return {
    photosSection,
    videosSection,
    partnersSection,
    photos: photos?.data || [],
    videos: videos?.data || [],
    partners: partners?.data || [],
  };
}

export default async function HomePage() {
  const {
    photosSection,
    videosSection,
    partnersSection,
    photos,
    videos,
    partners,
  } = await getMediaSections();

  return (
    <main>
      {/* Existing content */}
      
      {/* Media Library Sections */}
      {photosSection?.is_visible && (
        <PhotosSection
          photos={photos}
          title={{ en: photosSection.title_en, ar: photosSection.title_ar }}
        />
      )}

      {videosSection?.is_visible && (
        <VideosSection
          videos={videos}
          title={{ en: videosSection.title_en, ar: videosSection.title_ar }}
        />
      )}

      {partnersSection?.is_visible && (
        <PartnersSection
          partners={partners}
          title={{ en: partnersSection.title_en, ar: partnersSection.title_ar }}
        />
      )}
    </main>
  );
}
```

---

## Phase 5: Admin Panel

### Step 5.1: Admin Photos Management Page

**File**: `app/admin/photos/page.tsx` - Follow pattern from `app/admin/news/page.tsx`

### Step 5.2: Admin Videos Management Page

**File**: `app/admin/videos/page.tsx`

### Step 5.3: Admin Partners Management Page

**File**: `app/admin/partners/page.tsx`

### Step 5.4: Admin Home Sections Config

**File**: `app/admin/home-sections/page.tsx` - Manage visibility toggles for each section

### Step 5.5: Add Tabs to Admin Layout

**File**: `app/admin/layout.tsx` - Add tabs for photos, videos, partners, home-sections

---

## Phase 6: Testing & Validation

### Checklist

- [ ] Database migration successful
- [ ] Seed data created
- [ ] Photos API CRUD operations work
- [ ] Videos API CRUD operations work
- [ ] Partners API CRUD operations work
- [ ] Home sections API toggles work
- [ ] Photos appear on home page (5 items)
- [ ] Videos appear on home page (6 items)
- [ ] Partners appear on home page (configurable)
- [ ] Popup navigation works (prev/next arrows)
- [ ] Keyboard navigation works (Escape, Arrow keys)
- [ ] RTL mode reverses arrows correctly
- [ ] Gallery pages show all items
- [ ] Admin panels allow CRUD
- [ ] File uploads work (Vercel Blob)
- [ ] Featured items appear first
- [ ] visibility toggles hide sections

---

## Deployment Checklist

- [ ] Run `npx prisma migrate deploy` in production
- [ ] Run seed script to initialize home sections
- [ ] Verify environment variables (Clerk, Neon, Vercel Blob)
- [ ] Test in production environment
- [ ] Monitor error logs

---

## Estimated Timeline

| Phase | Time | Tasks |
|-------|------|-------|
| Phase 1 | 30 min | Database migration |
| Phase 2 | 30 min | Seed data & utilities |
| Phase 3 | 3-4 hrs | API routes (4 endpoints × ~1 hr each) |
| Phase 4 | 4-5 hrs | Frontend components (popup, 3 sections, home page) |
| Phase 5 | 2-3 hrs | Admin panels (3 management pages + home config) |
| Phase 6 | 1-2 hrs | Testing & validation |
| **Total** | **11-15 hrs** | Complete implementation |

---

## Next Steps

After completing this quickstart:

1. **Generate tasks**: Run `/speckit.tasks` to create detailed task breakdown
2. **Implement features**: Follow task sequence for systematic development
3. **Test thoroughly**: Validate all acceptance criteria from spec.md
4. **Deploy**: Push to production and monitor

**Questions?** Refer to:
- [spec.md](./spec.md) - Complete feature specification
- [data-model.md](./data-model.md) - Database schema details
- [contracts/](./contracts/) - API endpoint specifications
- [research.md](./research.md) - Technology decisions
