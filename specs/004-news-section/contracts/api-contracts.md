# API Contracts: News Section

**Feature**: News Section | **Date**: March 29, 2026  
**Version**: 1.0

## Overview

This document defines the API contracts for all news-related endpoints. The News Section exposes public endpoints for reading news and admin-protected endpoints for CRUD operations.

---

## Authentication & Authorization

**Public Endpoints** (no auth required):
- `GET /api/news` - List visible news (paginated)
- `GET /api/news/media/[id]` - Serve locally-stored images

**Admin-Only Endpoints** (requires Clerk auth + admin role):
- `GET /api/news/admin` - List all news (including hidden/deleted)
- `POST /api/news` - Create news item
- `PUT /api/news/[id]` - Update news item
- `DELETE /api/news/[id]` - Soft delete news item
- `POST /api/news/upload` - Upload image to local storage

**Authorization Check** (reuse from existing code):
```typescript
import { auth } from '@clerk/nextjs/server';
import { hasPermission } from '@/lib/auth/permissions';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId || !hasPermission(userId, 'news:write')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... proceed
}
```

---

## Endpoint: `GET /api/news`

**Purpose**: Fetch visible news items for public display (home page, news listing page)

### Request

**Method**: `GET`  
**URL**: `/api/news?page=1&limit=12`  
**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed) |
| `limit` | number | No | 12 | Items per page (max: 50) |

**Example**:
```http
GET /api/news?page=2&limit=6
```

### Response

**Status**: `200 OK`  
**Content-Type**: `application/json`

**Schema**:
```typescript
{
  news: Array<{
    id: string;
    title_en: string | null;
    title_ar: string | null;
    image_url: string;
    storage_type: 'blob' | 'local';
    published_date: string; // ISO 8601
    created_at: string;
    updated_at: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Example Response**:
```json
{
  "news": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
      "title_en": "New Feature Release",
      "title_ar": "إصدار ميزة جديدة",
      "image_url": "https://example.blob.vercel-storage.com/news/img.jpg",
      "storage_type": "blob",
      "published_date": "2026-03-29T10:00:00.000Z",
      "created_at": "2026-03-29T09:00:00.000Z",
      "updated_at": "2026-03-29T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 42,
    "totalPages": 4
  }
}
```

**Filtering Logic**:
```typescript
const news = await prisma.news.findMany({
  where: {
    is_deleted: false,
    is_visible: true,
    published_date: {
      lte: new Date(), // Only show published news
    },
  },
  orderBy: { published_date: 'desc' },
  take: limit,
  skip: (page - 1) * limit,
  select: {
    id: true,
    title_en: true,
    title_ar: true,
    image_url: true,
    storage_type: true,
    published_date: true,
    created_at: true,
    updated_at: true,
    // Exclude: file_data, file_name, file_size, mime_type
  },
});
```

**Error Responses**:
```json
// Invalid page number
{
  "error": "Invalid page number",
  "status": 400
}

// Limit exceeds maximum
{
  "error": "Limit cannot exceed 50",
  "status": 400
}
```

---

## Endpoint: `GET /api/news/admin`

**Purpose**: Fetch all news items for admin management (including hidden/deleted)

### Request

**Method**: `GET`  
**URL**: `/api/news/admin?page=1&limit=20&filter=all`  
**Authentication**: Required (Clerk)  
**Authorization**: `news:read` permission

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 20 | Items per page (max: 100) |
| `filter` | string | No | 'all' | Filter: 'all', 'visible', 'hidden', 'deleted' |

### Response

**Status**: `200 OK`

**Schema**:
```typescript
{
  news: Array<{
    id: string;
    title_en: string | null;
    title_ar: string | null;
    image_url: string;
    storage_type: 'blob' | 'local';
    file_name: string | null;
    file_size: number | null;
    mime_type: string | null;
    published_date: string;
    is_visible: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Filtering Logic**:
```typescript
const whereClause = {
  all: {},
  visible: { is_deleted: false, is_visible: true },
  hidden: { is_deleted: false, is_visible: false },
  deleted: { is_deleted: true },
}[filter] || {};
```

---

## Endpoint: `POST /api/news`

**Purpose**: Create a new news item

### Request

**Method**: `POST`  
**URL**: `/api/news`  
**Authentication**: Required  
**Authorization**: `news:write`  
**Content-Type**: `application/json`

**Schema**:
```typescript
{
  title_en?: string | null;
  title_ar?: string | null;
  image_url: string; // Blob URL or from upload endpoint
  storage_type: 'blob' | 'local';
  published_date: string; // ISO 8601
  is_visible?: boolean;
}
```

**Validation Rules**:
- At least one title (English or Arabic) required
- `image_url` must be valid HTTPS URL or `/api/news/media/{id}`
- `published_date` cannot be >1 year in future

**Example**:
```json
{
  "title_en": "Breaking News",
  "title_ar": "أخبار عاجلة",
  "image_url": "https://example.blob.vercel-storage.com/news/img.jpg",
  "storage_type": "blob",
  "published_date": "2026-03-30T08:00:00.000Z",
  "is_visible": true
}
```

### Response

**Status**: `201 Created`

**Schema**:
```typescript
{
  id: string;
  title_en: string | null;
  title_ar: string | null;
  image_url: string;
  storage_type: 'blob' | 'local';
  published_date: string;
  is_visible: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
```

**Error Responses**:
```json
// Missing title
{
  "error": "At least one title (English or Arabic) is required",
  "status": 400
}

// Invalid image URL
{
  "error": "Invalid image_url format",
  "status": 400
}

// Unauthorized
{
  "error": "Unauthorized",
  "status": 401
}
```

---

## Endpoint: `PUT /api/news/[id]`

**Purpose**: Update an existing news item

### Request

**Method**: `PUT`  
**URL**: `/api/news/{id}`  
**Authentication**: Required  
**Authorization**: `news:write`  
**Content-Type**: `application/json`

**Schema** (all fields optional):
```typescript
{
  title_en?: string | null;
  title_ar?: string | null;
  image_url?: string;
  published_date?: string;
  is_visible?: boolean;
}
```

**Note**: `storage_type`, `file_data`, and related fields are **immutable** after creation.

**Example**:
```json
{
  "title_en": "Updated News Title",
  "is_visible": false
}
```

### Response

**Status**: `200 OK`

**Schema**: Same as POST response

**Error Responses**:
```json
// News not found
{
  "error": "News not found",
  "status": 404
}

// Attempt to modify immutable field
{
  "error": "storage_type cannot be modified after creation",
  "status": 400
}
```

---

## Endpoint: `DELETE /api/news/[id]`

**Purpose**: Soft delete a news item (set `is_deleted: true`)

### Request

**Method**: `DELETE`  
**URL**: `/api/news/{id}`  
**Authentication**: Required  
**Authorization**: `news:delete`

### Response

**Status**: `200 OK`

**Schema**:
```typescript
{
  success: true;
  message: string;
}
```

**Example**:
```json
{
  "success": true,
  "message": "News item deleted successfully"
}
```

**Error Responses**:
```json
// News not found
{
  "error": "News not found",
  "status": 404
}

// Already deleted
{
  "error": "News item is already deleted",
  "status": 400
}
```

**Note**: To restore, use `PUT /api/news/[id]` with `{ "is_deleted": false }`

---

## Endpoint: `POST /api/news/upload`

**Purpose**: Upload image to local database storage

### Request

**Method**: `POST`  
**URL**: `/api/news/upload`  
**Authentication**: Required  
**Authorization**: `news:write`  
**Content-Type**: `multipart/form-data`

**Form Data**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Image file (JPEG, PNG, GIF) |

**Constraints**:
- Max file size: 10MB
- Allowed types: image/jpeg, image/png, image/gif

**Example** (using FormData):
```typescript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('/api/news/upload', {
  method: 'POST',
  body: formData,
});
```

### Response

**Status**: `201 Created`

**Schema**:
```typescript
{
  id: string; // News record ID
  url: string; // '/api/news/media/{id}'
  fileName: string;
  fileSize: number;
  mimeType: string;
}
```

**Example**:
```json
{
  "id": "clx2b3c4d5e6f7g8h9i0j1k2l",
  "url": "/api/news/media/clx2b3c4d5e6f7g8h9i0j1k2l",
  "fileName": "company-event.jpg",
  "fileSize": 245678,
  "mimeType": "image/jpeg"
}
```

**Error Responses**:
```json
// File too large
{
  "error": "File size exceeds 10MB limit",
  "status": 413
}

// Invalid file type
{
  "error": "Only JPEG, PNG, and GIF images are allowed",
  "status": 400
}

// No file provided
{
  "error": "No file provided",
  "status": 400
}
```

**Implementation Pattern** (from slider):
```typescript
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const news = await prisma.news.create({
    data: {
      title_en: null, // Set later via PUT
      title_ar: null,
      image_url: '', // Placeholder
      storage_type: 'local',
      file_data: buffer,
      file_name: file.name,
      file_size: buffer.length,
      mime_type: file.type,
      published_date: new Date(),
    },
  });
  
  // Update with correct URL
  await prisma.news.update({
    where: { id: news.id },
    data: { image_url: `/api/news/media/${news.id}` },
  });
  
  return Response.json({
    id: news.id,
    url: `/api/news/media/${news.id}`,
    fileName: file.name,
    fileSize: buffer.length,
    mimeType: file.type,
  }, { status: 201 });
}
```

---

## Endpoint: `GET /api/news/media/[id]`

**Purpose**: Serve locally-stored image files

### Request

**Method**: `GET`  
**URL**: `/api/news/media/{id}`  
**Authentication**: Not required (public)

**Example**:
```http
GET /api/news/media/clx2b3c4d5e6f7g8h9i0j1k2l
```

### Response

**Status**: `200 OK`  
**Content-Type**: `image/jpeg` | `image/png` | `image/gif`  
**Headers**:
```
Content-Type: {mime_type}
Cache-Control: public, max-age=31536000, immutable
Content-Length: {file_size}
```

**Body**: Binary image data

**Error Responses**:
```json
// News not found
{
  "error": "Media not found",
  "status": 404
}

// Storage type is blob (not local)
{
  "error": "Media is stored externally",
  "status": 400
}
```

**Implementation**:
```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const news = await prisma.news.findUnique({
    where: { id: params.id },
    select: {
      file_data: true,
      mime_type: true,
      file_name: true,
      storage_type: true,
    },
  });
  
  if (!news || news.storage_type !== 'local') {
    return Response.json({ error: 'Media not found' }, { status: 404 });
  }
  
  return new Response(news.file_data, {
    headers: {
      'Content-Type': news.mime_type || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
```

---

## TypeScript Type Definitions

**File**: `lib/types.ts`

```typescript
// News entity (matches Prisma schema)
export interface News {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  image_url: string;
  storage_type: 'blob' | 'local';
  file_data: Buffer | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  published_date: Date;
  is_visible: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

// Public news (safe for frontend)
export interface NewsPublic {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  image_url: string;
  storage_type: 'blob' | 'local';
  published_date: string;
  created_at: string;
  updated_at: string;
}

// Admin news (includes metadata)
export interface NewsAdmin extends NewsPublic {
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  is_visible: boolean;
  is_deleted: boolean;
}

// Create news request
export interface CreateNewsRequest {
  title_en?: string | null;
  title_ar?: string | null;
  image_url: string;
  storage_type: 'blob' | 'local';
  published_date: string;
  is_visible?: boolean;
}

// Update news request
export interface UpdateNewsRequest {
  title_en?: string | null;
  title_ar?: string | null;
  image_url?: string;
  published_date?: string;
  is_visible?: boolean;
}

// Pagination response
export interface PaginatedResponse<T> {
  news: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Upload response
export interface UploadResponse {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}
```

---

## Error Handling Standards

All endpoints follow consistent error response format:

```typescript
{
  error: string; // Human-readable message
  status: number; // HTTP status code
  details?: string; // Optional technical details
}
```

**Common HTTP Status Codes**:
- `200` - Success (read, update, delete)
- `201` - Created (create, upload)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `413` - Payload Too Large (file upload)
- `500` - Internal Server Error

---

## Rate Limiting

**Public Endpoints**:
- 100 requests/minute per IP for `GET /api/news`
- 50 requests/minute per IP for `GET /api/news/media/[id]`

**Admin Endpoints**:
- 200 requests/minute per user for read operations
- 50 requests/minute per user for write operations
- 10 uploads/minute per user for `/api/news/upload`

**Implementation**: Use Vercel Edge Config or Redis (future enhancement)

---

## Testing Contracts

**Sample Test Cases**:

```typescript
// Test: Create news with both titles
describe('POST /api/news', () => {
  it('should create news with both titles', async () => {
    const response = await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title_en: 'Test News',
        title_ar: 'اختبار الأخبار',
        image_url: 'https://example.com/image.jpg',
        storage_type: 'blob',
        published_date: new Date().toISOString(),
      }),
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.title_en).toBe('Test News');
  });
});

// Test: Pagination
describe('GET /api/news', () => {
  it('should return paginated results', async () => {
    const response = await fetch('/api/news?page=1&limit=5');
    const data = await response.json();
    
    expect(data.news).toHaveLength(5);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(5);
  });
});
```

---

## Summary

This contract defines 6 endpoints following REST conventions, consistent with existing API patterns in the codebase (slider, clients, orders). All endpoints support bilingual content and dual-storage images. Public endpoints are cacheable, admin endpoints are protected by Clerk authentication.

**Next Step**: Create quickstart guide for local development and testing.
