# API Contract: Partners Endpoint

**Base URL**: `/api/partners`  
**Authentication**: Required (Clerk session)  
**Authorization**: Admin role required for write operations  

---

## GET /api/partners

**Purpose**: Retrieve partners list or single partner by ID.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string (CUID) | No | - | Fetch single partner by ID |
| `context` | enum | No | `admin` | Context: `home`, `gallery`, `admin` |
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 20 | Items per page |
| `includeHidden` | boolean | No | false | Include is_visible=false (admin only) |
| `includeDeleted` | boolean | No | false | Include is_deleted=true (admin only) |

### Context Behavior

**`context=home`** (Public home page - configurable count):
```typescript
// First fetch home section config
const sectionConfig = await prisma.home_sections.findUnique({
  where: { section_type: 'partners' }
});

// Then fetch partners
const query = {
  where: {
    is_deleted: false,
    is_visible: true
  },
  orderBy: [
    { is_featured: 'desc' },
    { created_at: 'desc' }
  ]
};

// Apply limit if configured
if (sectionConfig?.partners_display_mode === 'limit' && sectionConfig.partners_max_count) {
  query.take = sectionConfig.partners_max_count;
}

const partners = await prisma.partners.findMany(query);
```

**`context=gallery`** (Public gallery page - all visible):
```typescript
{
  where: {
    is_deleted: false,
    is_visible: true
  },
  orderBy: [
    { is_featured: 'desc' },
    { created_at: 'desc' }
  ],
  take: 50,  // Show all on gallery page
  skip: (page - 1) * 50
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
      "id": "clxabc1234567",
      "title_en": "TechCorp Solutions",
      "title_ar": "حلول تك كورب",
      "url": "https://www.techcorp.com",
      "image_url": "https://blob.vercel-storage.com/partner-logo-def456.png",
      "storage_type": "blob",
      "file_name": "techcorp-logo.png",
      "file_size": 128000,
      "mime_type": "image/png",
      "is_featured": true,
      "is_visible": true,
      "is_deleted": false,
      "display_order": 0,
      "created_by": "user_xyz",
      "updated_by": "user_xyz",
      "created_at": "2026-03-22T09:00:00.000Z",
      "updated_at": "2026-03-25T11:00:00.000Z",
      "createdByUser": {
        "firstName": "Admin",
        "lastName": "User"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15,
    "totalPages": 1
  }
}
```

**Single Partner Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "clxabc1234567",
    // ... same fields as list item ...
  }
}
```

**Error Responses**:
- `404 Not Found`: Partner ID not found
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Insufficient permissions

---

## POST /api/partners

**Purpose**: Create new partner entry.

**Authorization**: Admin role required.

### Request Body

**Content-Type**: `multipart/form-data` (for logo upload) OR `application/json` (for URL-only)

**Multipart Form Fields**:
```typescript
{
  title_en: string;        // Required, max 255 chars
  title_ar: string;        // Required, max 255 chars
  url?: string;            // Optional, partner website URL
  logo: File;              // Required if image_url not provided
  image_url?: string;      // Required if logo not provided
  is_featured?: boolean;   // Optional, default false
  is_visible?: boolean;    // Optional, default true
}
```

**JSON Body** (when providing URL):
```json
{
  "title_en": "TechCorp Solutions",
  "title_ar": "حلول تك كورب",
  "url": "https://www.techcorp.com",
  "image_url": "https://example.com/logo.png",
  "is_featured": true,
  "is_visible": true
}
```

### Validation Rules

1. **Title validation**:
   - `title_en` and `title_ar` required, non-empty
   - Max length: 255 characters each
   
2. **URL validation** (if provided):
   - Must be valid HTTP or HTTPS URL
   - Protocol required (http:// or https://)
   
3. **Logo validation**:
   - File size: max 5MB (5,242,880 bytes)
   - MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
   - Either `logo` file OR `image_url` must be provided
   - Recommended: PNG or SVG for logos (transparent background)

### Response Schema

**Success** (201 Created):
```json
{
  "success": true,
  "message": "Partner created successfully",
  "data": {
    "id": "clxabc1234567",
    "title_en": "TechCorp Solutions",
    "title_ar": "حلول تك كورب",
    "url": "https://www.techcorp.com",
    "image_url": "https://blob.vercel-storage.com/partner-logo-def456.png",
    "storage_type": "blob",
    "file_name": "techcorp-logo.png",
    "file_size": 128000,
    "mime_type": "image/png",
    "is_featured": true,
    "is_visible": true,
    "created_at": "2026-03-30T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors (missing fields, invalid URL, file too large)
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Non-admin user
- `500 Internal Server Error`: Upload failed, database error

---

## PUT /api/partners/:id

**Purpose**: Update existing partner.

**Authorization**: Admin role required.

### URL Parameters

- `id` (string, CUID): Partner ID to update

### Request Body

**Content-Type**: `multipart/form-data` OR `application/json`

**Fields** (all optional except titles):
```typescript
{
  title_en: string;        // Required
  title_ar: string;        // Required
  url?: string;            // Optional, can be null to remove
  logo?: File;             // Optional, replaces existing logo
  image_url?: string;      // Optional, replaces existing URL
  is_featured?: boolean;
  is_visible?: boolean;
}
```

### Response Schema

**Success** (200 OK):
```json
{
  "success": true,
  "message": "Partner updated successfully",
  "data": {
    "id": "clxabc1234567",
    // ... updated partner fields ...
    "updated_at": "2026-03-30T12:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Non-admin user
- `404 Not Found`: Partner ID not found
- `500 Internal Server Error`: Update failed

---

## DELETE /api/partners/:id

**Purpose**: Soft delete partner (set is_deleted = true).

**Authorization**: Admin role required.

### URL Parameters

- `id` (string, CUID): Partner ID to delete

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `permanent` | boolean | No | false | Hard delete (use cautiously) |

### Response Schema

**Success** (200 OK):
```json
{
  "success": true,
  "message": "Partner deleted successfully",
  "data": {
    "id": "clxabc1234567",
    "is_deleted": true
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Non-admin user
- `404 Not Found`: Partner ID not found

---

## PATCH /api/partners/:id/restore

**Purpose**: Restore soft-deleted partner (set is_deleted = false).

**Authorization**: Admin role required.

### Response Schema

**Success** (200 OK):
```json
{
  "success": true,
  "message": "Partner restored successfully",
  "data": {
    "id": "clxabc1234567",
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
    "message": "Invalid request data",
    "details": [
      {
        "field": "url",
        "message": "URL must be a valid HTTP or HTTPS address"
      }
    ]
  }
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid input data
- `INVALID_URL`: URL format invalid
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `UPLOAD_FAILED`: Logo upload error
- `DATABASE_ERROR`: Database operation failed

---

## Partner Logo Best Practices

### Recommended Specifications

- **Format**: PNG or SVG preferred (transparent backgrounds)
- **Size**: 200x200px to 400x400px (square or landscape)
- **File Size**: < 500KB (logos should be optimized)
- **Background**: Transparent or white (for dark/light mode compatibility)
- **Color**: Full color or monochrome (consistent branding)

### Upload Processing

Server should:
1. Validate file type and size
2. Upload to Vercel Blob storage
3. Store original filename and metadata
4. Return public CDN URL

Frontend rendering:
```typescript
<div className="partner-logo-container">
  <Image
    src={partner.image_url}
    alt={language === 'en' ? partner.title_en : partner.title_ar}
    width={200}
    height={200}
    className="object-contain"
  />
</div>
```

---

## Examples

### Example 1: Fetch Home Page Partners
```bash
curl -X GET "https://example.com/api/partners?context=home" \
  -H "Content-Type: application/json"
```

### Example 2: Create Partner with Logo Upload
```bash
curl -X POST "https://example.com/api/partners" \
  -H "Authorization: Bearer <clerk_token>" \
  -F "title_en=TechCorp Solutions" \
  -F "title_ar=حلول تك كورب" \
  -F "url=https://www.techcorp.com" \
  -F "logo=@/path/to/logo.png" \
  -F "is_featured=true"
```

### Example 3: Update Partner URL
```bash
curl -X PUT "https://example.com/api/partners/clxabc1234567" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title_en": "TechCorp Solutions",
    "title_ar": "حلول تك كورب",
    "url": "https://www.newtechcorp.com"
  }'
```

### Example 4: Remove Partner URL (Make Non-Clickable)
```bash
curl -X PUT "https://example.com/api/partners/clxabc1234567" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title_en": "TechCorp Solutions",
    "title_ar": "حلول تك كورب",
    "url": null
  }'
```

### Example 5: Soft Delete Partner
```bash
curl -X DELETE "https://example.com/api/partners/clxabc1234567" \
  -H "Authorization: Bearer <clerk_token>"
```
