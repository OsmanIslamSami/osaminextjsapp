# API Contract: Videos Endpoint

**Base URL**: `/api/videos`  
**Authentication**: Required (Clerk session)  
**Authorization**: Admin role required for write operations  

---

## GET /api/videos

**Purpose**: Retrieve videos list or single video by ID.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string (CUID) | No | - | Fetch single video by ID |
| `context` | enum | No | `admin` | Context: `home`, `gallery`, `admin` |
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 20 | Items per page |
| `includeHidden` | boolean | No | false | Include is_visible=false (admin only) |
| `includeDeleted` | boolean | No | false | Include is_deleted=true (admin only) |

### Context Behavior

**`context=home`** (Public home page - 6 items):
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
  take: 6
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

**`context=admin`** (Admin panel):
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
      "id": "clx9876543210",
      "title_en": "Product Launch Video",
      "title_ar": "فيديو إطلاق المنتج",
      "description_en": "Watch our latest product launch",
      "description_ar": "شاهد إطلاق منتجنا الأخير",
      "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "video_id": "dQw4w9WgXcQ",
      "thumbnail_url": "https://blob.vercel-storage.com/thumb-xyz789.jpg",
      "storage_type": "blob",
      "file_name": "thumbnail.jpg",
      "file_size": 245000,
      "mime_type": "image/jpeg",
      "is_featured": true,
      "is_visible": true,
      "is_deleted": false,
      "display_order": 0,
      "published_date": "2026-03-25T14:00:00.000Z",
      "created_by": "user_abc",
      "updated_by": "user_abc",
      "created_at": "2026-03-20T10:00:00.000Z",
      "updated_at": "2026-03-25T13:30:00.000Z",
      "createdByUser": {
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 32,
    "totalPages": 2
  }
}
```

**Single Video Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "clx9876543210",
    // ... same fields as list item ...
  }
}
```

**Error Responses**:
- `404 Not Found`: Video ID not found
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Insufficient permissions

---

## POST /api/videos

**Purpose**: Create new video entry.

**Authorization**: Admin role required.

### Request Body

**Content-Type**: `multipart/form-data` (with thumbnail) OR `application/json` (URL only)

**Multipart Form Fields**:
```typescript
{
  title_en: string;            // Required, max 255 chars
  title_ar: string;            // Required, max 255 chars
  description_en?: string;     // Optional, max 5000 chars
  description_ar?: string;     // Optional, max 5000 chars
  youtube_url: string;         // Required, must be valid YouTube URL
  thumbnail?: File;            // Optional, custom thumbnail image
  thumbnail_url?: string;      // Optional, external thumbnail URL
  is_featured?: boolean;       // Optional, default false
  is_visible?: boolean;        // Optional, default true
  published_date?: string;     // Optional, ISO 8601, default now
}
```

**JSON Body** (without custom thumbnail):
```json
{
  "title_en": "Product Launch Video",
  "title_ar": "فيديو إطلاق المنتج",
  "description_en": "Watch our latest product launch",
  "description_ar": "شاهد إطلاق منتجنا الأخير",
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "is_featured": true,
  "is_visible": true,
  "published_date": "2026-03-30T14:00:00Z"
}
```

### Validation Rules

1. **Title validation**:
   - `title_en` and `title_ar` required, non-empty
   - Max length: 255 characters each
   
2. **YouTube URL validation**:
   - Must match YouTube URL patterns:
     - `https://www.youtube.com/watch?v={VIDEO_ID}`
     - `https://youtu.be/{VIDEO_ID}`
     - `https://www.youtube.com/embed/{VIDEO_ID}`
   - Video ID extracted and validated (11 characters, alphanumeric + `-_`)
   - Server validates YouTube video exists (optional check)

3. **Thumbnail validation** (if provided):
   - File size: max 5MB
   - MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
   - If thumbnail not provided, can use YouTube default thumbnail

4. **Published date**:
   - Must be valid ISO 8601 date
   - Can be future date (video hidden until then)

### YouTube URL Processing

Server extracts video ID from any valid YouTube URL format:

```typescript
function extractYouTubeVideoId(url: string): string | null {
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
```

### Response Schema

**Success** (201 Created):
```json
{
  "success": true,
  "message": "Video created successfully",
  "data": {
    "id": "clx9876543210",
    "title_en": "Product Launch Video",
    "title_ar": "فيديو إطلاق المنتج",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "video_id": "dQw4w9WgXcQ",
    "thumbnail_url": "https://blob.vercel-storage.com/thumb-xyz789.jpg",
    "storage_type": "blob",
    "is_featured": true,
    "is_visible": true,
    "published_date": "2026-03-30T14:00:00.000Z",
    "created_at": "2026-03-30T12:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid YouTube URL, validation errors
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Non-admin user
- `404 Not Found`: YouTube video not found (if validation enabled)
- `500 Internal Server Error`: Upload failed, database error

---

## PUT /api/videos/:id

**Purpose**: Update existing video.

**Authorization**: Admin role required.

### URL Parameters

- `id` (string, CUID): Video ID to update

### Request Body

**Content-Type**: `multipart/form-data` OR `application/json`

**Fields** (all optional except titles):
```typescript
{
  title_en: string;            // Required
  title_ar: string;            // Required
  description_en?: string;
  description_ar?: string;
  youtube_url?: string;        // Optional, replaces video
  thumbnail?: File;            // Optional, replaces thumbnail
  thumbnail_url?: string;      // Optional, replaces thumbnail URL
  is_featured?: boolean;
  is_visible?: boolean;
  published_date?: string;
}
```

### Response Schema

**Success** (200 OK):
```json
{
  "success": true,
  "message": "Video updated successfully",
  "data": {
    "id": "clx9876543210",
    // ... updated video fields ...
    "updated_at": "2026-03-30T15:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid YouTube URL, validation errors
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Non-admin user
- `404 Not Found`: Video ID not found
- `500 Internal Server Error`: Update failed

---

## DELETE /api/videos/:id

**Purpose**: Soft delete video (set is_deleted = true).

**Authorization**: Admin role required.

### URL Parameters

- `id` (string, CUID): Video ID to delete

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `permanent` | boolean | No | false | Hard delete (use cautiously) |

### Response Schema

**Success** (200 OK):
```json
{
  "success": true,
  "message": "Video deleted successfully",
  "data": {
    "id": "clx9876543210",
    "is_deleted": true
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Non-admin user
- `404 Not Found`: Video ID not found

---

## PATCH /api/videos/:id/restore

**Purpose**: Restore soft-deleted video (set is_deleted = false).

**Authorization**: Admin role required.

### Response Schema

**Success** (200 OK):
```json
{
  "success": true,
  "message": "Video restored successfully",
  "data": {
    "id": "clx9876543210",
    "is_deleted": false
  }
}
```

---

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid YouTube URL",
    "details": [
      {
        "field": "youtube_url",
        "message": "URL must be a valid YouTube video link"
      }
    ]
  }
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid input data
- `INVALID_YOUTUBE_URL`: YouTube URL format invalid or video not found
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `UPLOAD_FAILED`: Thumbnail upload error
- `DATABASE_ERROR`: Database operation failed

---

## YouTube Embed URL Generation

Frontend uses video_id to generate embed iframe:

```typescript
// Client-side component
const YouTubeEmbed = ({ videoId }: { videoId: string }) => (
  <iframe
    src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
    title="YouTube video player"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    className="w-full aspect-video"
    loading="lazy"
  />
);
```

---

## Examples

### Example 1: Fetch Home Page Videos
```bash
curl -X GET "https://example.com/api/videos?context=home" \
  -H "Content-Type: application/json"
```

### Example 2: Create Video with YouTube URL
```bash
curl -X POST "https://example.com/api/videos" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title_en": "Product Launch Video",
    "title_ar": "فيديو إطلاق المنتج",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "is_featured": true
  }'
```

### Example 3: Create Video with Custom Thumbnail
```bash
curl -X POST "https://example.com/api/videos" \
  -H "Authorization: Bearer <clerk_token>" \
  -F "title_en=Product Launch Video" \
  -F "title_ar=فيديو إطلاق المنتج" \
  -F "youtube_url=https://www.youtube.com/watch?v=dQw4w9WgXcQ" \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "is_featured=true"
```

### Example 4: Update Video Visibility
```bash
curl -X PUT "https://example.com/api/videos/clx9876543210" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title_en": "Product Launch Video",
    "title_ar": "فيديو إطلاق المنتج",
    "is_visible": false
  }'
```
