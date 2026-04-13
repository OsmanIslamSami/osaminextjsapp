# Data Model: FAQ and Magazine Sections

**Feature**: 006-faq-magazine-sections  
**Phase**: 1 (Design & Contracts)  
**Date**: April 13, 2026

## Overview

This document defines the database schema, entity relationships, and data validation rules for FAQ and Magazine features.

## Architecture Decisions

- **ORM**: Prisma with PostgreSQL (Neon serverless)
- **ID Strategy**: CUID for primary keys (existing project standard)
- **Timestamps**: Automatic via Prisma `@default(now())` and `@updatedAt`
- **Soft Deletes**: Boolean `is_deleted` flag (never hard delete)
- **Audit Trail**: `created_by` and `updated_by` track User references
- **Bilingual Content**: Separate `_en` and `_ar` columns for all text fields

## Entity Definitions

### FAQ Entity

Represents a frequently asked question with bilingual question and answer text.

**Table Name**: `faq`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `question_en` | String | NOT NULL, VARCHAR(500) | English question text |
| `question_ar` | String | NOT NULL, VARCHAR(500) | Arabic question text |
| `answer_en` | String | NOT NULL, TEXT | English answer text (supports long content) |
| `answer_ar` | String | NOT NULL, TEXT | Arabic answer text (supports long content) |
| `is_favorite` | Boolean | NOT NULL, DEFAULT false | Flag for prioritized display on home page |
| `display_order` | Int | NOT NULL, DEFAULT 0 | Manual ordering field (future enhancement) |
| `is_deleted` | Boolean | NOT NULL, DEFAULT false | Soft delete flag |
| `created_by` | String | NOT NULL, FK → User.id | User who created this FAQ |
| `updated_by` | String | NOT NULL, FK → User.id | User who last updated this FAQ |
| `created_at` | DateTime | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | DateTime | NOT NULL, AUTO UPDATE | Last modification timestamp |

**Indexes**:
- `[is_deleted, is_favorite, created_at]` - Optimizes home page query (favorites first, then recent)
- `[created_by]` - FK index (auto-created by Prisma)
- `[updated_by]` - FK index (auto-created by Prisma)

**Relationships**:
- Many-to-one with `User` (created_by)
- Many-to-one with `User` (updated_by)

**Validation Rules**:
- `question_en` and `question_ar`: Required, max 500 characters
- `answer_en` and `answer_ar`: Required, no length limit (TEXT)
- `is_favorite`: Boolean only (true/false)
- `created_by` and `updated_by`: Must reference valid User.id

---

### Magazine Entity

Represents a downloadable magazine/publication with bilingual metadata, cover image, and PDF download link.

**Table Name**: `magazines`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `title_en` | String | NOT NULL, VARCHAR(500) | English magazine title |
| `title_ar` | String | NOT NULL, VARCHAR(500) | Arabic magazine title |
| `description_en` | String | NOT NULL, TEXT | English description |
| `description_ar` | String | NOT NULL, TEXT | Arabic description |
| `image_url` | String | NOT NULL | Cover image URL (Blob) or identifier (local) |
| `storage_type` | String | NOT NULL, DEFAULT 'blob' | Storage backend: 'blob' or 'local' |
| `file_data` | Bytes | NULL | Base64 image data (only for local storage) |
| `file_name` | String | NULL | Original filename (only for local storage) |
| `file_size` | Int | NULL | File size in bytes |
| `mime_type` | String | NULL | Image MIME type (e.g., 'image/jpeg') |
| `download_link` | String | NOT NULL | PDF download URL (Vercel Blob) |
| `published_date` | DateTime | NOT NULL, TIMESTAMP(6) | Magazine publication date |
| `is_deleted` | Boolean | NOT NULL, DEFAULT false | Soft delete flag |
| `created_by` | String | NOT NULL, FK → User.id | User who created this Magazine |
| `updated_by` | String | NOT NULL, FK → User.id | User who last updated this Magazine |
| `created_at` | DateTime | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | DateTime | NOT NULL, AUTO UPDATE | Last modification timestamp |

**Indexes**:
- `[is_deleted, published_date DESC]` - Optimizes home page query (most recent first, excluding deleted)
- `[created_by]` - FK index (auto-created by Prisma)
- `[updated_by]` - FK index (auto-created by Prisma)

**Relationships**:
- Many-to-one with `User` (created_by)
- Many-to-one with `User` (updated_by)

**Validation Rules**:
- `title_en` and `title_ar`: Required, max 500 characters
- `description_en` and `description_ar`: Required, no length limit (TEXT)
- `image_url`: Required, must be valid URL or file identifier
- `storage_type`: Must be 'blob' or 'local'
- `file_data`: Required only when `storage_type = 'local'`
- `file_name`, `file_size`, `mime_type`: Required only when `storage_type = 'local'`
- `download_link`: Required, must be valid Vercel Blob URL for PDF
- `published_date`: Required, must be valid timestamp
- **Image format validation** (application-level): JPEG, PNG, WebP, GIF only
- **PDF format validation** (application-level): PDF only
- **Image size limit** (application-level): Max 10MB
- **PDF size limit** (application-level): Max 50MB

---

## Entity Relationships

```text
User (existing)
  ├──→ FAQ (created_by)       [1:N]
  ├──→ FAQ (updated_by)       [1:N]
  ├──→ Magazine (created_by)  [1:N]
  └──→ Magazine (updated_by)  [1:N]
```

**Notes**:
- FAQ and Magazine are independent entities (no relationship between them)
- Both entities link to User for audit trail purposes
- No cascading deletes (User deletion should not automatically delete FAQ/Magazine)
- Use soft deletes for data retention and audit purposes

---

## Prisma Schema (Complete)

```prisma
// Add to prisma/schema.prisma

model FAQ {
  id            String   @id @default(cuid())
  question_en   String   @db.VarChar(500)
  question_ar   String   @db.VarChar(500)
  answer_en     String   @db.Text
  answer_ar     String   @db.Text
  is_favorite   Boolean  @default(false)
  display_order Int      @default(0)
  is_deleted    Boolean  @default(false)
  created_by    String
  updated_by    String
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  creator       User     @relation("FAQCreatedBy", fields: [created_by], references: [id])
  updater       User     @relation("FAQUpdatedBy", fields: [updated_by], references: [id])

  @@index([is_deleted, is_favorite, created_at])
  @@map("faq")
}

model Magazine {
  id              String   @id @default(cuid())
  title_en        String   @db.VarChar(500)
  title_ar        String   @db.VarChar(500)
  description_en  String   @db.Text
  description_ar  String   @db.Text
  image_url       String
  storage_type    String   @default("blob")
  file_data       Bytes?
  file_name       String?
  file_size       Int?
  mime_type       String?
  download_link   String
  published_date  DateTime @db.Timestamp(6)
  is_deleted      Boolean  @default(false)
  created_by      String
  updated_by      String
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  creator         User     @relation("MagazineCreatedBy", fields: [created_by], references: [id])
  updater         User     @relation("MagazineUpdatedBy", fields: [updated_by], references: [id])

  @@index([is_deleted, published_date(sort: Desc)])
  @@map("magazines")
}

// Update User model to include FAQ and Magazine relations
model User {
  // ... existing fields ...

  // Add these relations
  faqCreated       FAQ[]       @relation("FAQCreatedBy")
  faqUpdated       FAQ[]       @relation("FAQUpdatedBy")
  magazinesCreated Magazine[]  @relation("MagazineCreatedBy")
  magazinesUpdated Magazine[]  @relation("MagazineUpdatedBy")
}
```

---

## TypeScript Type Definitions

```typescript
// Add to lib/types.ts

export interface FAQ {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  is_favorite: boolean;
  display_order: number;
  is_deleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface FAQFormData {
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  is_favorite?: boolean;
}

export interface Magazine {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image_url: string;
  storage_type: 'blob' | 'local';
  file_data?: Buffer;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  download_link: string;
  published_date: Date;
  is_deleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface MagazineFormData {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  published_date: string; // ISO date string
  cover_image: File;      // For upload
  pdf_file: File;         // For upload
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}
```

---

## Query Patterns

### FAQ Queries

**Home Page Display** (limit 10, favorites first):
```typescript
const homeFAQs = await prisma.fAQ.findMany({
  where: { is_deleted: false },
  orderBy: [
    { is_favorite: 'desc' },  // Favorites first
    { created_at: 'desc' }    // Then most recent
  ],
  take: 10
});
```

**Admin List** (paginated, all FAQs):
```typescript
const skip = (page - 1) * limit;
const [faqs, totalCount] = await Promise.all([
  prisma.fAQ.findMany({
    where: { is_deleted: false },
    skip,
    take: limit,
    orderBy: { created_at: 'desc' }
  }),
  prisma.fAQ.count({ where: { is_deleted: false } })
]);
```

**Toggle Favorite**:
```typescript
await prisma.fAQ.update({
  where: { id },
  data: { 
    is_favorite: !currentFavoriteStatus,
    updated_by: userId,
    updated_at: new Date()
  }
});
```

### Magazine Queries

**Home Page Display** (limit 8, most recent first):
```typescript
const homeMagazines = await prisma.magazine.findMany({
  where: { is_deleted: false },
  orderBy: { published_date: 'desc' },
  take: 8
});
```

**Admin List** (paginated, all Magazines):
```typescript
const skip = (page - 1) * limit;
const [magazines, totalCount] = await Promise.all([
  prisma.magazine.findMany({
    where: { is_deleted: false },
    skip,
    take: limit,
    orderBy: { published_date: 'desc' }
  }),
  prisma.magazine.count({ where: { is_deleted: false } })
]);
```

**Create with Blob Upload**:
```typescript
// 1. Upload cover image to Vercel Blob
const coverBlob = await put(`magazines/cover-${Date.now()}.jpg`, coverImageFile, {
  access: 'public'
});

// 2. Upload PDF to Vercel Blob
const pdfBlob = await put(`magazines/pdf-${Date.now()}.pdf`, pdfFile, {
  access: 'public'
});

// 3. Create Magazine record
const magazine = await prisma.magazine.create({
  data: {
    ...formData,
    image_url: coverBlob.url,
    storage_type: 'blob',
    download_link: pdfBlob.url,
    created_by: userId,
    updated_by: userId
  }
});
```

---

## Migration Strategy

1. **Create migration**:
   ```bash
   npx prisma migrate dev --name add_faq_magazines
   ```

2. **Migration file** will contain:
   - CREATE TABLE statements for `faq` and `magazines`
   - Index creation statements
   - ALTER TABLE statement to add FAQ/Magazine relations to `users` (if needed)

3. **Testing**:
   - Run migration in development first
   - Verify schema with `npx prisma db pull` (reverse check)
   - Seed test data for FAQ and Magazine

4. **Rollback plan** (if needed):
   ```sql
   DROP TABLE IF EXISTS "magazines";
   DROP TABLE IF EXISTS "faq";
   -- Note: User table relations are non-breaking (just FK fields)
   ```

---

## Data Integrity Rules

1. **Soft Deletes**: Always query with `where: { is_deleted: false }`
2. **Audit Trail**: Never allow `created_by` or `updated_by` to be NULL
3. **Bilingual Completeness**: Both `_en` and `_ar` fields must be provided (no partial translations)
4. **Storage Type Consistency**: If `storage_type = 'local'`, ensure `file_data`, `file_name`, `file_size`, `mime_type` are populated
5. **Published Date**: Magazines can have future published dates (pre-scheduling)

---

## Next Steps

1. ✅ Data model defined
2. Move to API contract definitions (`contracts/api-endpoints.md`)
3. Create implementation quickstart guide
