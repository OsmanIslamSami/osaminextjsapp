# Data Model: Media Library Home Sections

**Feature**: 005-media-library-home  
**Database**: Neon PostgreSQL via Prisma ORM  
**Schema Version**: Initial  

## Overview

Four new tables to support Photos, Videos, and Partners sections on home page:
- **photos**: Media gallery items with images
- **videos**: YouTube video embeds with metadata
- **partners**: Partner organizations with logos and links
- **home_sections**: Global visibility configuration for each section type

## Entity Definitions

### 1. Photos Table

**Purpose**: Store photo gallery items displayed in slider on home page and full gallery page.

**Prisma Schema**:
```prisma
model photos {
  id              String    @id @default(cuid())
  
  // Content fields
  title_en        String
  title_ar        String
  description_en  String?   @db.Text
  description_ar  String?   @db.Text
  
  // Media storage
  image_url       String
  storage_type    String    @default("blob")  // 'blob' or 'local'
  file_name       String?
  file_size       Int?      // Bytes
  mime_type       String?   // image/jpeg, image/png, etc.
  file_data       Bytes?    // Optional local storage
  
  // Display control
  is_featured     Boolean   @default(false)
  is_visible      Boolean   @default(true)
  is_deleted      Boolean   @default(false)
  display_order   Int       @default(0)
  published_date  DateTime  @default(now())
  
  // Audit trail
  created_by      String?
  updated_by      String?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  
  // Relations
  createdByUser   User?     @relation("PhotosCreatedBy", fields: [created_by], references: [id])
  updatedByUser   User?     @relation("PhotosUpdatedBy", fields: [updated_by], references: [id])
  
  @@index([is_deleted, is_visible, is_featured, published_date(sort: Desc)])
  @@index([published_date(sort: Desc)])
  @@index([created_at])
  @@map("photos")
}
```

**Field Descriptions**:
- `id`: UUID primary key using CUID
- `title_en/ar`: Required bilingual titles for photo caption
- `description_en/ar`: Optional detailed descriptions for popup view
- `image_url`: Public URL to image file (Vercel Blob or local path)
- `storage_type`: Discriminator for storage backend ('blob' for Vercel Blob, 'local' for file system)
- `file_name`: Original filename from upload for download feature
- `file_size`: File size in bytes for validation and display
- `mime_type`: MIME type for content-type headers and validation
- `file_data`: Binary storage field for local file storage (alternative to Vercel Blob)
- `is_featured`: Flag for priority display (featured items shown first)
- `is_visible`: Soft visibility toggle without deletion
- `is_deleted`: Soft delete flag (never hard delete for audit trail)
- `display_order`: Manual ordering field (future enhancement, currently unused)
- `published_date`: Scheduled publish date (items hidden until this date)
- `created_by/updated_by`: User IDs for audit trail (nullable for system-created items)

**Validation Rules**:
- `title_en` and `title_ar` must not be empty strings
- `image_url` must be valid URL or relative path
- `file_size` must not exceed 5MB (5,242,880 bytes) for uploads
- `mime_type` must be in: image/jpeg, image/png, image/gif, image/webp
- `published_date` can be future date (item remains hidden)
- At least one of `image_url` or `file_data` must be set

**State Transitions**:
```
[Draft] --> (publish) --> [Published, Visible]
[Published] --> (hide) --> [Published, Hidden]
[Published] --> (delete) --> [Deleted]
[Deleted] --> (restore) --> [Published, Visible]
```

---

### 2. Videos Table

**Purpose**: Store YouTube video embeds with background images and metadata for home page and gallery.

**Prisma Schema**:
```prisma
model videos {
  id              String    @id @default(cuid())
  
  // Content fields
  title_en        String
  title_ar        String
  description_en  String?   @db.Text
  description_ar  String?   @db.Text
  
  // Video source
  youtube_url     String
  video_id        String?   // Extracted YouTube video ID for embed
  
  // Thumbnail/background
  thumbnail_url   String?
  storage_type    String    @default("blob")
  file_name       String?
  file_size       Int?
  mime_type       String?
  
  // Display control
  is_featured     Boolean   @default(false)
  is_visible      Boolean   @default(true)
  is_deleted      Boolean   @default(false)
  display_order   Int       @default(0)
  published_date  DateTime  @default(now())
  
  // Audit trail
  created_by      String?
  updated_by      String?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  
  // Relations
  createdByUser   User?     @relation("VideosCreatedBy", fields: [created_by], references: [id])
  updatedByUser   User?     @relation("VideosUpdatedBy", fields: [updated_by], references: [id])
  
  @@index([is_deleted, is_visible, is_featured, published_date(sort: Desc)])
  @@index([published_date(sort: Desc)])
  @@index([video_id])
  @@map("videos")
}
```

**Field Descriptions**:
- `id`: UUID primary key using CUID
- `title_en/ar`: Required bilingual titles for video caption
- `description_en/ar`: Optional detailed descriptions for popup/gallery view
- `youtube_url`: Full YouTube URL (watch?v=, youtu.be/, or embed format)
- `video_id`: Extracted YouTube video ID (e.g., "dQw4w9WgXcQ") for embed iframe
- `thumbnail_url`: Background image URL displayed before clicking (optional, can use YouTube default)
- `storage_type`: Storage backend for thumbnail image ('blob' or 'local')
- `file_name/size/mime_type`: Thumbnail image metadata
- `is_featured`: Flag for priority display
- `is_visible`: Soft visibility toggle
- `is_deleted`: Soft delete flag
- `display_order`: Manual ordering field (future enhancement)
- `published_date`: Scheduled publish date

**Validation Rules**:
- `youtube_url` must match YouTube URL patterns (watch, short, embed)
- `video_id` extracted and validated on save
- Thumbnail `mime_type` must be image/* if provided
- Thumbnail `file_size` must not exceed 5MB if uploaded
- `published_date` can be future date

**State Transitions**: Same as photos table

---

### 3. Partners Table

**Purpose**: Store partner organization logos and links for home page slider and partners gallery.

**Prisma Schema**:
```prisma
model partners {
  id              String    @id @default(cuid())
  
  // Content fields
  title_en        String
  title_ar        String
  url             String?   // Partner website URL (clickable link)
  
  // Logo/image storage
  image_url       String
  storage_type    String    @default("blob")
  file_name       String?
  file_size       Int?
  mime_type       String?
  file_data       Bytes?
  
  // Display control
  is_featured     Boolean   @default(false)
  is_visible      Boolean   @default(true)
  is_deleted      Boolean   @default(false)
  display_order   Int       @default(0)
  
  // Audit trail
  created_by      String?
  updated_by      String?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  
  // Relations
  createdByUser   User?     @relation("PartnersCreatedBy", fields: [created_by], references: [id])
  updatedByUser   User?     @relation("PartnersUpdatedBy", fields: [updated_by], references: [id])
  
  @@index([is_deleted, is_visible, is_featured, created_at(sort: Desc)])
  @@index([created_at(sort: Desc)])
  @@map("partners")
}
```

**Field Descriptions**:
- `id`: UUID primary key using CUID
- `title_en/ar`: Required bilingual partner organization names
- `url`: Optional website URL (if provided, logo becomes clickable link)
- `image_url`: Public URL to partner logo image
- `storage_type`: Storage backend discriminator
- `file_name/size/mime_type/file_data`: Image metadata and optional local storage
- `is_featured`: Flag for priority display in slider
- `is_visible`: Soft visibility toggle
- `is_deleted`: Soft delete flag
- `display_order`: Manual ordering field (currently unused, sorted by featured + created_at)
- `created_at/updated_at`: Automatic timestamps (partners use created_at for sorting, not published_date)

**Validation Rules**:
- `title_en` and `title_ar` must not be empty
- `url` must be valid URL if provided (http/https)
- `image_url` required (partner logo)
- `file_size` must not exceed 5MB
- `mime_type` must be image/*

**State Transitions**: Same as photos table

---

### 4. HomeSection Table

**Purpose**: Global configuration for home page section visibility and display preferences.

**Prisma Schema**:
```prisma
model home_sections {
  id                      String    @id @default(cuid())
  
  // Section identification
  section_type            String    @unique  // 'photos', 'videos', 'partners'
  
  // Display configuration
  is_visible              Boolean   @default(true)
  title_en                String?
  title_ar                String?
  display_order           Int       @default(0)
  
  // Partners-specific configuration
  partners_display_mode   String?   @default("all")  // 'all' or 'limit'
  partners_max_count      Int?      // Only used when mode = 'limit'
  
  // Audit trail
  created_at              DateTime  @default(now())
  updated_at              DateTime  @updatedAt
  
  @@map("home_sections")
}
```

**Field Descriptions**:
- `id`: UUID primary key using CUID
- `section_type`: Section identifier (photos, videos, partners) - unique constraint ensures one config per section
- `is_visible`: Master visibility toggle for entire section on home page
- `title_en/ar`: Optional custom section titles (override defaults)
- `display_order`: Order of sections on home page (lower = higher on page)
- `partners_display_mode`: Partners-specific - 'all' shows all visible partners, 'limit' uses max_count
- `partners_max_count`: Maximum partners to show on home when mode='limit' (NULL = show all)

**Validation Rules**:
- `section_type` must be one of: 'photos', 'videos', 'partners'
- Only one row per `section_type` (unique constraint)
- `partners_max_count` must be positive integer if mode = 'limit'
- `partners_max_count` only relevant when `section_type` = 'partners'

**Default Records**:
```sql
INSERT INTO home_sections (section_type, is_visible, display_order, partners_display_mode) VALUES
  ('photos', true, 1, NULL),
  ('videos', true, 2, NULL),
  ('partners', true, 3, 'all');
```

---

## Relationships

### User Relations
All media tables have soft foreign keys to User table for audit trail:
- `photos.created_by` → `User.id` (PhotosCreatedBy relation)
- `photos.updated_by` → `User.id` (PhotosUpdatedBy relation)
- `videos.created_by` → `User.id` (VideosCreatedBy relation)
- `videos.updated_by` → `User.id` (VideosUpdatedBy relation)
- `partners.created_by` → `User.id` (PartnersCreatedBy relation)
- `partners.updated_by` → `User.id` (PartnersUpdatedBy relation)

**Note**: Relations are nullable to support:
- System-generated content (created_by = NULL)
- Migration of existing data
- Clerk user deletion (user deleted, content preserved)

### User Model Updates
Add reverse relations to existing `User` model:
```prisma
model User {
  // ... existing fields ...
  
  photosCreated     photos[]    @relation("PhotosCreatedBy")
  photosUpdated     photos[]    @relation("PhotosUpdatedBy")
  videosCreated     videos[]    @relation("VideosCreatedBy")
  videosUpdated     videos[]    @relation("VideosUpdatedBy")
  partnersCreated   partners[]  @relation("PartnersCreatedBy")
  partnersUpdated   partners[]  @relation("PartnersUpdatedBy")
}
```

---

## Indexes

### Performance Indexes

**photos table**:
1. `@@index([is_deleted, is_visible, is_featured, published_date(sort: Desc)])` - Home page query (5 items)
2. `@@index([published_date(sort: Desc)])` - Gallery page pagination
3. `@@index([created_at])` - Admin list view

**videos table**:
1. `@@index([is_deleted, is_visible, is_featured, published_date(sort: Desc)])` - Home page query (6 items)
2. `@@index([published_date(sort: Desc)])` - Gallery page pagination
3. `@@index([video_id])` - Lookup by YouTube video ID

**partners table**:
1. `@@index([is_deleted, is_visible, is_featured, created_at(sort: Desc)])` - Home page query (all or limited)
2. `@@index([created_at(sort: Desc)])` - Gallery page pagination

**home_sections table**:
- Primary key on `id` + unique constraint on `section_type` sufficient (small table, 3 rows)

### Query Patterns

**Home page photos (5 items)**:
```sql
SELECT * FROM photos
WHERE is_deleted = false 
  AND is_visible = true
  AND published_date <= NOW()
ORDER BY is_featured DESC, published_date DESC
LIMIT 5;
```
Uses index: `is_deleted, is_visible, is_featured, published_date DESC`

**Gallery page photos (paginated)**:
```sql
SELECT * FROM photos
WHERE is_deleted = false 
  AND is_visible = true
  AND published_date <= NOW()
ORDER BY published_date DESC
LIMIT 20 OFFSET 0;
```
Uses index: `published_date DESC` (is_deleted/is_visible filters still benefit from composite index)

---

## Migration Strategy

### Phase 1: Create Tables
```bash
# Generate migration
npx prisma migrate dev --name add_media_library_tables

# Apply to production (Neon)
npx prisma migrate deploy
```

### Phase 2: Seed Default Data
```typescript
// scripts/seed-media-library.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create home section configurations
  await prisma.home_sections.upsert({
    where: { section_type: 'photos' },
    update: {},
    create: {
      section_type: 'photos',
      is_visible: true,
      display_order: 1,
    },
  });

  await prisma.home_sections.upsert({
    where: { section_type: 'videos' },
    update: {},
    create: {
      section_type: 'videos',
      is_visible: true,
      display_order: 2,
    },
  });

  await prisma.home_sections.upsert({
    where: { section_type: 'partners' },
    update: {},
    create: {
      section_type: 'partners',
      is_visible: true,
      display_order: 3,
      partners_display_mode: 'all',
    },
  });

  console.log('✅ Media library home sections seeded');
}

main()
  .catch((e) => { throw e; })
  .finally(async () => { await prisma.$disconnect(); });
```

### Phase 3: Update Prisma Client
```bash
npx prisma generate
```

---

## Data Flow Examples

### Example 1: Create New Photo
```typescript
// API route: POST /api/photos
const newPhoto = await prisma.photos.create({
  data: {
    title_en: "Grand Opening Ceremony",
    title_ar: "حفل الافتتاح الكبير",
    description_en: "Opening ceremony of our new branch",
    description_ar: "حفل افتتاح فرعنا الجديد",
    image_url: "https://blob.vercel-storage.com/...",
    storage_type: "blob",
    file_name: "opening-ceremony.jpg",
    file_size: 1548000,
    mime_type: "image/jpeg",
    is_featured: true,
    published_date: new Date(),
    created_by: userId,
  },
});
```

### Example 2: Fetch Home Page Photos
```typescript
// API route: GET /api/photos?context=home
const photos = await prisma.photos.findMany({
  where: {
    is_deleted: false,
    is_visible: true,
    published_date: { lte: new Date() },
  },
  orderBy: [
    { is_featured: 'desc' },
    { published_date: 'desc' },
  ],
  take: 5,
  include: {
    createdByUser: {
      select: { firstName: true, lastName: true },
    },
  },
});
```

### Example 3: Toggle Section Visibility
```typescript
// API route: PATCH /api/home-sections/:type
await prisma.home_sections.update({
  where: { section_type: 'videos' },
  data: { is_visible: false },
});
```

---

## Constraints & Business Rules

### Global Constraints
1. **Soft deletes only**: Never hard delete photos, videos, or partners (audit trail requirement)
2. **Bilingual required**: All title_en and title_ar fields mandatory (UI requirement)
3. **Published date validation**: Items with future published_date hidden from public views
4. **File size limits**: 5MB maximum for all uploaded files
5. **URL validation**: YouTube URLs must match allowed patterns, partner URLs must be valid HTTP(S)

### Display Logic Constraints
1. **Featured items**: Featured flag takes precedence in sorting (featured first, then date)
2. **Visibility cascade**: If home_sections.is_visible = false, entire section hidden regardless of item visibility
3. **Partners count**: When partners_display_mode = 'limit', enforce partners_max_count (default: show all)
4. **Circular navigation**: Gallery popup wraps from last item to first (and vice versa)

### Audit Trail Requirements
1. **User tracking**: Capture created_by and updated_by for all modifications
2. **Timestamp precision**: created_at and updated_at auto-managed by Prisma
3. **Nullable creators**: Allow NULL for system-generated or migrated content

---

## Rollback Plan

If migration fails or needs rollback:

```sql
-- Rollback script (emergency use only)
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS partners;
DROP TABLE IF EXISTS home_sections;

-- Remove relations from User table via Prisma migration
```

For production rollback, use Prisma migrate:
```bash
# Revert to previous migration
npx prisma migrate resolve --rolled-back <migration_name>
```

---

## Summary

**Total Tables**: 4 (photos, videos, partners, home_sections)  
**Total Indexes**: 7 performance indexes across 3 media tables  
**Relations**: 6 soft foreign keys to User table for audit trail  
**Migration Size**: ~200 lines of SQL (table creation + indexes)  
**Estimated Rows**: 
- photos: 50-500 (moderate growth)
- videos: 20-200 (slower growth)
- partners: 10-100 (stable)
- home_sections: 3 (fixed)

All tables follow existing project patterns (bilingual content, soft deletes, audit trails, featured flags).
