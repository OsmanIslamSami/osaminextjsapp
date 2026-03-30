# API Contract: Photos Endpoint

**Base URL**: `/api/photos`  
**Authentication**: Required (Clerk session)  
**Authorization**: Admin role required for write operations  

---

## GET /api/photos

**Purpose**: Retrieve photos list or single photo by ID.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string (CUID) | No | - | Fetch single photo by ID |
| `context` | enum | No | `admin` | Context: `home`, `gallery`, `admin` |
| `page` | number | No | 1 | Page number for pagination (gallery/admin) |
| `limit` | number | No | 20 | Items per page (gallery: 20, admin: 50) |
| `includeHidden` | boolean | No | false | Include is_visible=false (admin only) |
| `includeDeleted` | boolean | No | false | Include is_deleted=true (admin only) |

### Context Behavior

**`context=home`** (Public home page - 5 items):
```typescript
{
  where: {
    is_deleted: false,
    is_visible: true,
    published_date: { lte: new Date() }
  },
  orderBy: [
    { is_featured: 'desc' },
    { published_date: 'desc' }
  ],
  take: 5
}
```

**`context=gallery`** (Public gallery page - paginated):
```typescript
{
  where: {
    is_deleted: false,
    is_visible: true,
    published_date: { lte: new Date() }
  },
  orderBy: { published_date: 'desc' },
  take: 20,
  skip: (page - 1) * 20
}
```

**`context=admin`** (Admin panel - all photos):
```typescript
{
  where: {
    is_deleted: includeDeleted ? undefined : false
  },
  orderBy: { created_at: 'desc' },
  take: 50,
  skip: (page - 1) * 50
}
```

### Response Schema

**List Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "title_en": "Grand Opening",
      "title_ar": "الافتتاح الكبير",
      "description_en": "Opening ceremony description",
      "description_ar": "وصف حفل الافتتاح",
      "image_url": "https://blob.vercel-storage.com/photo-abc123.jpg",
      "storage_type": "blob",
      "file_name": "opening.jpg",
      "file_size": 1548000,
      "mime_type": "image/jpeg",
      "is_featured": true,
      "is_visible": true,
      "is_deleted": false,
      "display_order": 0,
      "published_date": "2026-03-25T10:30:00.000Z",
      "created_by": "user_xyz",
      "updated_by": "user_xyz",
      "created_at": "2026-03-20T08:00:00.000Z",
      "updated_at": "2026-03-25T09:00:00.000Z",
      "createdByUser": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Single Photo Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    // ... same fields as list item ...
  }
}
```

**Error Responses**:
- `404 Not Found`: Photo ID not found
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Insufficient permissions (hidden/deleted without admin role)

---

## POST /api/photos

**Purpose**: Create new photo entry.

**Authorization**: Admin role required.

### Request Body

**Content-Type**: `multipart/form-data` (for file upload) OR `application/json` (for URL-only)

**Multipart Form Fields**:
```typescript
{
  title_en: string;          // Required, max 255 chars
  title_ar: string;          // Required, max 255 chars
  description_en?: string;   // Optional, max 5000 chars
  description_ar?: string;   // Optional, max 5000 chars
  image: File;               // Required if image_url not provided
  image_url?: string;        // Required if image not provided
  is_featured?: boolean;     // Optional, default false
  is_visible?: boolean;      // Optional, default true
  published_date?: string;   // Optional, ISO 8601, default now
}
```

**JSON Body** (when providing URL):
```json
{
  "title_en": "Grand Opening",
  "title_ar": "الافتتاح الكبير",
  "description_en": "Opening ceremony description",
  "description_ar": "وصف حفل الافتتاح",
  "image_url": "https://example.com/image.jpg",
  "is_featured": true,
  "is_visible": true,
  "published_date": "2026-03-30T10:00:00Z"
}
```

### Validation Rules

1. **Title validation**:
   - `title_en` and `title_ar` required, non-empty
   - Max length: 255 characters each
   
2. **Image validation**:
   - File size: max 5MB (5,242,880 bytes)
   - MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
   - Either `image` file OR `image_url` must be provided
   
3. **Published date**:
   - Must be valid ISO 8601 date
   - Can be future date (photo hidden until then)

### Response Schema

**Success** (201 Created):
```json
{
  "success": true,
  "message": "Photo created successfully",
  "data": {
    "id": "clx1234567890",
    "title_en": "Grand Opening",
    "title_ar": "الافتتاح الكبير",
    "image_url": "https://blob.vercel-storage.com/photo-abc123.jpg",
    "storage_type": "blob",
    "file_name": "opening.jpg",
    "file_size": 1548000,
    "mime_type": "image/jpeg",
    "is_featured": true,
    "is_visible": true,
    "published_date": "2026-03-30T10:00:00.000Z",
    "created_at": "2026-03-30T08:30:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors (missing fields, invalid file type, file too large)
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Non-admin user
- `500 Internal Server Error`: Upload failed, database error

---

## PUT /api/photos/:id

**Purpose**: Update existing photo.

**Authorization**: Admin role required.

### URL Parameters

- `id` (string, CUID): Photo ID to update

### Request Body

**Content-Type**: `multipart/form-data` OR `application/json`

**Fields** (all optional except title_en/title_ar):
```typescript
{
  title_en: string;          // Required
  title_ar: string;          // Required
  description_en?: string;
  description_ar?: string;
  image?: File;              // Optional, replaces existing image
  image_url?: string;        // Optional, replaces existing URL
  is_featured?: boolean;
  is_visible?: boolean;
  published_date?: string;   // ISO 8601
}
```

### Response Schema

**Success** (200 OK):
```json
{
  "success": true,
  "message": "Photo updated successfully",
  "data": {
    "id": "clx1234567890",
    // ... updated photo fields ...
    "updated_at": "2026-03-30T12:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Non-admin user
- `404 Not Found`: Photo ID not found
- `500 Internal Server Error`: Update failed

---

## DELETE /api/photos/:id

**Purpose**: Soft delete photo (set is_deleted = true).

**Authorization**: Admin role required.

### URL Parameters

- `id` (string, CUID): Photo ID to delete

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `permanent` | boolean | No | false | Hard delete (use cautiously) |

### Response Schema

**Success** (200 OK):
```json
{
  "success": true,
  "message": "Photo deleted successfully",
  "data": {
    "id": "clx1234567890",
    "is_deleted": true
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Non-admin user
- `404 Not Found`: Photo ID not found
- `500 Internal Server Error`: Delete failed

---

## PATCH /api/photos/:id/restore

**Purpose**: Restore soft-deleted photo (set is_deleted = false).

**Authorization**: Admin role required.

### Response Schema

**Success** (200 OK):
```json
{
  "success": true,
  "message": "Photo restored successfully",
  "data": {
    "id": "clx1234567890",
    "is_deleted": false
  }
}
```

---

## Error Response Format

All error responses follow this schema:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "title_en",
        "message": "Title (English) is required"
      },
      {
        "field": "image",
        "message": "File size exceeds 5MB limit"
      }
    ]
  }
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid input data
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `UPLOAD_FAILED`: File upload error
- `DATABASE_ERROR`: Database operation failed
- `INTERNAL_ERROR`: Unexpected server error

---

## Rate Limiting

- **Public endpoints** (context=home, context=gallery): 100 requests/minute per IP
- **Admin endpoints** (POST, PUT, DELETE): 60 requests/minute per user

---

## Examples

### Example 1: Fetch Home Page Photos
```bash
curl -X GET "https://example.com/api/photos?context=home" \
  -H "Content-Type: application/json"
```

### Example 2: Create Photo with File Upload
```bash
curl -X POST "https://example.com/api/photos" \
  -H "Authorization: Bearer <clerk_token>" \
  -F "title_en=Grand Opening" \
  -F "title_ar=الافتتاح الكبير" \
  -F "image=@/path/to/photo.jpg" \
  -F "is_featured=true"
```

### Example 3: Update Photo Visibility
```bash
curl -X PUT "https://example.com/api/photos/clx1234567890" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title_en": "Grand Opening",
    "title_ar": "الافتتاح الكبير",
    "is_visible": false
  }'
```

### Example 4: Soft Delete Photo
```bash
curl -X DELETE "https://example.com/api/photos/clx1234567890" \
  -H "Authorization: Bearer <clerk_token>"
```
