# API Endpoints: FAQ and Magazine Sections

**Feature**: 006-faq-magazine-sections  
**Phase**: 1 (Design & Contracts)  
**Date**: April 13, 2026

## Overview

This document specifies all REST API endpoints for FAQ and Magazine CRUD operations, including request/response formats, validation rules, and error handling.

## Base URLs

- **FAQ API**: `/api/faq`
- **Magazine API**: `/api/magazines`

## Authentication

All endpoints require Clerk authentication:
- Use `auth()` from `@clerk/nextjs` to get `userId`
- Admin-only endpoints check `user.role === 'admin'` from database
- Return `401 Unauthorized` if not authenticated
- Return `403 Forbidden` if not admin

## Common Response Formats

### Success Response (Single Entity)
```json
{
  "data": { /* entity object */ }
}
```

### Success Response (List/Paginated)
```json
{
  "data": [ /* array of entities */ ],
  "totalCount": 42,
  "totalPages": 5,
  "currentPage": 1,
  "limit": 10
}
```

### Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## FAQ Endpoints

### GET /api/faq

List FAQs with optional pagination and filtering.

**Auth**: Required (any authenticated user)

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed) |
| `limit` | number | No | 10 | Items per page (10, 20, 50, 100, 500) |
| `favorites_only` | boolean | No | false | Return only favorite FAQs |
| `home_page` | boolean | No | false | Return home page FAQs (limit 10, favorites first) |

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "clx123abc",
      "question_en": "What is this product?",
      "question_ar": "ما هو هذا المنتج؟",
      "answer_en": "This product is...",
      "answer_ar": "هذا المنتج هو...",
      "is_favorite": true,
      "display_order": 0,
      "created_at": "2026-04-10T12:00:00Z",
      "updated_at": "2026-04-12T15:30:00Z"
    }
  ],
  "totalCount": 15,
  "totalPages": 2,
  "currentPage": 1,
  "limit": 10
}
```

**Query Behavior**:
- **Default**: All non-deleted FAQs, ordered by `created_at DESC`, paginated
- **`home_page=true`**: Max 10 items, ordered by `is_favorite DESC, created_at DESC`
- **`favorites_only=true`**: Only FAQs where `is_favorite = true`

**Error Responses**:
- `401`: Not authenticated
- `400`: Invalid query parameters (e.g., limit not in allowed values)

---

### POST /api/faq

Create a new FAQ.

**Auth**: Admin only

**Request Body**:
```json
{
  "question_en": "What is this product?",
  "question_ar": "ما هو هذا المنتج؟",
  "answer_en": "This product is a comprehensive solution...",
  "answer_ar": "هذا المنتج هو حل شامل...",
  "is_favorite": false
}
```

**Validation Rules**:
- `question_en`: Required, max 500 characters
- `question_ar`: Required, max 500 characters
- `answer_en`: Required, no max length
- `answer_ar`: Required, no max length
-  `is_favorite`: Optional, boolean (default: false)

**Success Response** (201):
```json
{
  "data": {
    "id": "clx123abc",
    "question_en": "What is this product?",
    "question_ar": "ما هو هذا المنتج؟",
    "answer_en": "This product is a comprehensive solution...",
    "answer_ar": "هذا المنتج هو حل شامل...",
    "is_favorite": false,
    "display_order": 0,
    "created_by": "user_abc123",
    "updated_by": "user_abc123",
    "created_at": "2026-04-13T10:00:00Z",
    "updated_at": "2026-04-13T10:00:00Z"
  }
}
```

**Error Responses**:
- `401`: Not authenticated
- `403`: Not admin user
- `400`: Validation error (missing required fields, exceeds length limits)

---

### GET /api/faq/[id]

Get a single FAQ by ID.

**Auth**: Required (any authenticated user)

**URL Parameters**:
- `id`: FAQ CUID

**Success Response** (200):
```json
{
  "data": {
    "id": "clx123abc",
    "question_en": "What is this product?",
    "question_ar": "ما هو هذا المنتج؟",
    "answer_en": "This product is...",
    "answer_ar": "هذا المنتج هو...",
    "is_favorite": true,
    "display_order": 0,
    "created_at": "2026-04-10T12:00:00Z",
    "updated_at": "2026-04-12T15:30:00Z"
  }
}
```

**Error Responses**:
- `401`: Not authenticated
- `404`: FAQ not found or deleted

---

### PUT /api/faq/[id]

Update an existing FAQ.

**Auth**: Admin only

**URL Parameters**:
- `id`: FAQ CUID

**Request Body** (partial updates supported):
```json
{
  "question_en": "Updated question?",
  "question_ar": "سؤال محدث؟",
  "answer_en": "Updated answer...",
  "answer_ar": "إجابة محدثة...",
  "is_favorite": true
}
```

**Validation Rules** (same as POST):
- All text fields max 500 characters (questions) or unlimited (answers)
- `is_favorite`: Boolean if provided

**Success Response** (200):
```json
{
  "data": {
    "id": "clx123abc",
    "question_en": "Updated question?",
    "question_ar": "سؤال محدث؟",
    "answer_en": "Updated answer...",
    "answer_ar": "إجابة محدثة...",
    "is_favorite": true,
    "updated_by": "user_abc123",
    "updated_at": "2026-04-13T14:20:00Z"
  }
}
```

**Error Responses**:
- `401`: Not authenticated
- `403`: Not admin user
- `404`: FAQ not found or deleted
- `400`: Validation error

---

### DELETE /api/faq/[id]

Soft-delete an FAQ (sets `is_deleted = true`).

**Auth**: Admin only

**URL Parameters**:
- `id`: FAQ CUID

**Success Response** (200):
```json
{
  "data": {
    "message": "FAQ deleted successfully",
    "id": "clx123abc"
  }
}
```

**Error Responses**:
- `401`: Not authenticated
- `403`: Not admin user
- `404`: FAQ not found or already deleted

---

## Magazine Endpoints

### GET /api/magazines

List Magazines with optional pagination and filtering.

**Auth**: Required (any authenticated user)

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed) |
| `limit` | number | No | 10 | Items per page (10, 20, 50, 100, 500) |
| `home_page` | boolean | No | false | Return home page Magazines (limit 8, recent first) |

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "clx456def",
      "title_en": "Spring 2026 Edition",
      "title_ar": "إصدار ربيع 2026",
      "description_en": "Our latest quarterly magazine...",
      "description_ar": "أحدث مجلتنا الفصلية...",
      "image_url": "https://blob.vercel-storage.com/cover.jpg",
      "storage_type": "blob",
      "download_link": "https://blob.vercel-storage.com/magazine.pdf",
      "published_date": "2026-04-01T00:00:00Z",
      "created_at": "2026-03-28T10:00:00Z",
      "updated_at": "2026-03-28T10:00:00Z"
    }
  ],
  "totalCount": 25,
  "totalPages": 3,
  "currentPage": 1,
  "limit": 10
}
```

**Query Behavior**:
- **Default**: All non-deleted Magazines, ordered by `published_date DESC`, paginated
- **`home_page=true`**: Max 8 items, ordered by `published_date DESC`

**Error Responses**:
- `401`: Not authenticated
- `400`: Invalid query parameters

---

### POST /api/magazines

Create a new Magazine with image and PDF uploads.

**Auth**: Admin only

**Content-Type**: `multipart/form-data`

**Form Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title_en` | string | Yes | English title (max 500 chars) |
| `title_ar` | string | Yes | Arabic title (max 500 chars) |
| `description_en` | string | Yes | English description |
| `description_ar` | string | Yes | Arabic description |
| `published_date` | string | Yes | ISO date string (e.g., "2026-04-01") |
| `cover_image` | File | Yes | Cover image (JPEG/PNG/WebP/GIF, max 10MB) |
| `pdf_file` | File | Yes | PDF download file (PDF only, max 50MB) |

**Validation Rules**:
- **Title fields**: Required, max 500 characters
- **Description fields**: Required
- **published_date**: Valid ISO date string
- **cover_image**: 
  - Formats: JPEG, PNG, WebP, GIF only
  - Max size: 10MB
  - Must be a valid image file
- **pdf_file**: 
  - Format: PDF only
  - Max size: 50MB
  - Must be a valid PDF file

**Success Response** (201):
```json
{
  "data": {
    "id": "clx456def",
    "title_en": "Spring 2026 Edition",
    "title_ar": "إصدار ربيع 2026",
    "description_en": "Our latest quarterly magazine...",
    "description_ar": "أحدث مجلتنا الفصلية...",
    "image_url": "https://blob.vercel-storage.com/cover-abc123.jpg",
    "storage_type": "blob",
    "download_link": "https://blob.vercel-storage.com/magazine-abc123.pdf",
    "published_date": "2026-04-01T00:00:00Z",
    "created_by": "user_abc123",
    "updated_by": "user_abc123",
    "created_at": "2026-04-13T10:00:00Z",
    "updated_at": "2026-04-13T10:00:00Z"
  }
}
```

**Error Responses**:
- `401`: Not authenticated
- `403`: Not admin user
- `400`: Validation error (missing fields, invalid file format, file too large)
- `500`: File upload failed (Blob storage error)

---

### GET /api/magazines/[id]

Get a single Magazine by ID.

**Auth**: Required (any authenticated user)

**URL Parameters**:
- `id`: Magazine CUID

**Success Response** (200):
```json
{
  "data": {
    "id": "clx456def",
    "title_en": "Spring 2026 Edition",
    "title_ar": "إصدار ربيع 2026",
    "description_en": "Our latest quarterly magazine...",
    "description_ar": "أحدث مجلتنا الفصلية...",
    "image_url": "https://blob.vercel-storage.com/cover.jpg",
    "storage_type": "blob",
    "download_link": "https://blob.vercel-storage.com/magazine.pdf",
    "published_date": "2026-04-01T00:00:00Z",
    "created_at": "2026-03-28T10:00:00Z",
    "updated_at": "2026-03-28T10:00:00Z"
  }
}
```

**Error Responses**:
- `401`: Not authenticated
- `404`: Magazine not found or deleted

---

### PUT /api/magazines/[id]

Update an existing Magazine (text fields and/or files).

**Auth**: Admin only

**Content-Type**: `multipart/form-data`

**URL Parameters**:
- `id`: Magazine CUID

**Form Fields** (all optional for partial updates):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title_en` | string | No | English title (max 500 chars) |
| `title_ar` | string | No | Arabic title (max 500 chars) |
| `description_en` | string | No | English description |
| `description_ar` | string | No | Arabic description |
| `published_date` | string | No | ISO date string |
| `cover_image` | File | No | New cover image (replaces existing) |
| `pdf_file` | File | No | New PDF file (replaces existing) |

**Validation Rules** (same as POST for provided fields)

**Success Response** (200):
```json
{
  "data": {
    "id": "clx456def",
    "title_en": "Spring 2026 Edition (Updated)",
    // ... updated fields ...
    "updated_by": "user_abc123",
    "updated_at": "2026-04-13T14:20:00Z"
  }
}
```

**Error Responses**:
- `401`: Not authenticated
- `403`: Not admin user
- `404`: Magazine not found or deleted
- `400`: Validation error
- `500`: File upload failed

---

### DELETE /api/magazines/[id]

Soft-delete a Magazine (sets `is_deleted = true`).

**Auth**: Admin only

**URL Parameters**:
- `id`: Magazine CUID

**Success Response** (200):
```json
{
  "data": {
    "message": "Magazine deleted successfully",
    "id": "clx456def"
  }
}
```

**Error Responses**:
- `401`: Not authenticated
- `403`: Not admin user
- `404`: Magazine not found or already deleted

---

## Error Handling Patterns

### Validation Errors (400)
```json
{
  "error": "Validation failed: question_en is required"
}
```

### Authentication Errors (401)
```json
{
  "error": "Unauthorized"
}
```

### Authorization Errors (403)
```json
{
  "error": "Forbidden: Admin access required"
}
```

### Not Found Errors (404)
```json
{
  "error": "FAQ not found"
}
```

### Server Errors (500)
```json
{
  "error": "Failed to upload file to blob storage"
}
```

---

## File Upload Implementation Notes

### Vercel Blob Upload Pattern
```typescript
import { put } from '@vercel/blob';

// Upload cover image
const coverBlob = await put(
  `magazines/cover-${Date.now()}.${ext}`, 
  coverImageFile,
  { access: 'public' }
);

// Upload PDF
const pdfBlob = await put(
  `magazines/pdf-${Date.now()}.pdf`, 
  pdfFile,
  { access: 'public' }
);
```

### Local Storage Fallback (Cover Image Only)
```typescript
// If BLOB_READ_WRITE_TOKEN not available
const fileBuffer = await coverImageFile.arrayBuffer();
const base64Data = Buffer.from(fileBuffer).toString('base64');

// Store in database
data: {
  storage_type: 'local',
  image_url: `magazine-cover-${id}`,  // Identifier only
  file_data: Buffer.from(fileBuffer),
  file_name: coverImageFile.name,
  file_size: coverImageFile.size,
  mime_type: coverImageFile.type
}
```

**Note**: PDF downloads are Blob-only (no local fallback)

---

## Testing Checklist

### FAQ Endpoints
- [ ] GET /api/faq - List all FAQs
- [ ] GET /api/faq?home_page=true - Home page FAQs (max 10, favorites first)
- [ ] GET /api/faq?favorites_only=true - Favorite FAQs only
- [ ] POST /api/faq - Create FAQ (valid data)
- [ ] POST /api/faq - Validation errors (missing fields, exceeds length)
- [ ] GET /api/faq/[id] - Get single FAQ
- [ ] PUT /api/faq/[id] - Update FAQ
- [ ] DELETE /api/faq/[id] - Soft-delete FAQ
- [ ] Auth checks: 401 and 403 responses

### Magazine Endpoints
- [ ] GET /api/magazines - List all Magazines
- [ ] GET /api/magazines?home_page=true - Home page Magazines (max 8, recent first)
- [ ] POST /api/magazines - Create with cover image + PDF upload
- [ ] POST /api/magazines - Validation errors (invalid file format, file too large)
- [ ] GET /api/magazines/[id] - Get single Magazine
- [ ] PUT /api/magazines/[id] - Update Magazine (text + files)
- [ ] DELETE /api/magazines/[id] - Soft-delete Magazine
- [ ] File upload: Blob storage success
- [ ] File upload: Local storage fallback (cover image only)
- [ ] Auth checks: 401 and 403 responses

---

## Next Steps

1. ✅ API contracts defined
2. Move to implementation quickstart guide
3. Implement API routes following these contracts
