# API Contract: Slider Content Management

**Endpoint Base**: `/api/slider`  
**Feature**: 003-mobile-responsive-animations  
**Date**: March 26, 2026  
**Authentication**: Required (Clerk session token)

## Overview

REST API for managing hero slider/carousel content on the home page. Supports images, videos, and GIFs with multilingual titles and call-to-action buttons. Follows existing API patterns with input validation, error handling, and soft-delete support.

---

## Authentication & Authorization

All endpoints require valid Clerk authentication.

**Role-Based Access**:
- **Any User**: Can view active slides (public endpoint)
- **Admin Only**: Can create, update, delete, show/hide slides

**Headers**:
```http
Authorization: Bearer <clerk_session_token>
```

---

## Endpoints

### 1. List All Active Slides

**Method**: `GET`  
**Path**: `/api/slider`  
**Auth**: Not required (public - shows active slides only)

**Description**: Returns all active (non-deleted, visible) slider slides sorted by display_order

**Query Parameters**: None

**Request Example**:
```http
GET /api/slider HTTP/1.1
Host: example.com
```

**Success Response** (200):
```json
{
  "slides": [
    {
      "id": "clz1234567890",
      "media_url": "/uploads/slides/hero-banner-1.jpg",
      "media_type": "image",
      "title_en": "Welcome to Our Platform",
      "title_ar": "مرحباً بك في منصتنا",
      "button_text_en": "Get Started",
      "button_text_ar": "ابدأ الآن",
      "button_url": "/clients/add",
      "display_order": 1,
      "created_at": "2026-03-26T12:00:00Z",
      "updated_at": "2026-03-26T12:00:00Z"
    },
    {
      "id": "clz0987654321",
      "media_url": "https://example.com/promo-video.mp4",
      "media_type": "video",
      "title_en": "See It In Action",
      "title_ar": "شاهده أثناء العمل",
      "button_text_en": null,
      "button_text_ar": null,
      "button_url": null,
      "display_order": 2,
      "created_at": "2026-03-26T12:10:00Z",
      "updated_at": "2026-03-26T12:10:00Z"
    }
  ],
  "count": 2
}
```

**Notes**:
- Only returns slides where `is_deleted = false` AND `is_visible = true`
- Sorted by `display_order ASC`
- Does not include `is_deleted` or `is_visible` fields in response

---

### 2. List All Slides (Admin)

**Method**: `GET`  
**Path**: `/api/slider/admin`  
**Auth**: Required (admin only)

**Description**: Returns ALL slides (including hidden and deleted) for admin management

**Success Response** (200):
```json
{
  "slides": [
    {
      "id": "clz1234567890",
      "media_url": "/uploads/slides/hero-banner-1.jpg",
      "media_type": "image",
      "title_en": "Welcome to Our Platform",
      "title_ar": "مرحباً بك في منصتنا",
      "button_text_en": "Get Started",
      "button_text_ar": "ابدأ الآن",
      "button_url": "/clients/add",
      "display_order": 1,
      "is_visible": true,
      "is_deleted": false,
      "created_at": "2026-03-26T12:00:00Z",
      "updated_at": "2026-03-26T12:00:00Z"
    }
  ],
  "count": 1
}
```

**Notes**:
- Returns ALL slides regardless of `is_deleted` or `is_visible`
- Includes `is_deleted` and `is_visible` fields
- Sorted by `display_order ASC`

---

### 3. Create New Slide

**Method**: `POST`  
**Path**: `/api/slider`  
**Auth**: Required (admin only)

**Description**: Creates a new slider slide

**Request Body**:
```json
{
  "media_url": "/uploads/slides/new-banner.jpg",
  "media_type": "image",
  "title_en": "New Feature Launch",
  "title_ar": "إطلاق ميزة جديدة",
  "button_text_en": "Learn More",
  "button_text_ar": "اعرف المزيد",
  "button_url": "/dashboard",
  "display_order": 3,
  "is_visible": true
}
```

**Field Validation**:
- `media_url`: Required, string, max 1000 characters
- `media_type`: Required, must be "image", "video", or "gif"
- `title_en`: Optional, string, max 200 characters
- `title_ar`: Optional, string, max 200 characters
- `button_text_en`: Optional, string, max 100 characters
- `button_text_ar`: Optional, string, max 100 characters
- `button_url`: Optional, valid URL, max 500 characters
- `display_order`: Optional, integer >= 0, default 0
- `is_visible`: Optional, boolean, default true

**Success Response** (201):
```json
{
  "slide": {
    "id": "clz1111222333",
    "media_url": "/uploads/slides/new-banner.jpg",
    "media_type": "image",
    "title_en": "New Feature Launch",
    "title_ar": "إطلاق ميزة جديدة",
    "button_text_en": "Learn More",
    "button_text_ar": "اعرف المزيد",
    "button_url": "/dashboard",
    "display_order": 3,
    "is_visible": true,
    "created_at": "2026-03-26T13:00:00Z",
    "updated_at": "2026-03-26T13:00:00Z"
  },
  "message": "Slider slide created successfully"
}
```

**Validation Error Response** (400):
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "media_type",
      "message": "Media type must be 'image', 'video', or 'gif'"
    }
  ]
}
```

---

### 4. Get Single Slide

**Method**: `GET`  
**Path**: `/api/slider/[id]`  
**Auth**: Required (admin only)

**Description**: Returns a single slide by ID (for admin editing)

**Success Response** (200):
```json
{
  "slide": {
    "id": "clz1234567890",
    "media_url": "/uploads/slides/hero-banner-1.jpg",
    "media_type": "image",
    "title_en": "Welcome to Our Platform",
    "title_ar": "مرحباً بك في منصتنا",
    "button_text_en": "Get Started",
    "button_text_ar": "ابدأ الآن",
    "button_url": "/clients/add",
    "display_order": 1,
    "is_visible": true,
    "is_deleted": false,
    "created_at": "2026-03-26T12:00:00Z",
    "updated_at": "2026-03-26T12:00:00Z"
  }
}
```

**Not Found Response** (404):
```json
{
  "error": "Not Found",
  "message": "Slider slide not found"
}
```

---

### 5. Update Slide

**Method**: `PUT`  
**Path**: `/api/slider/[id]`  
**Auth**: Required (admin only)

**Description**: Updates an existing slide (partial update supported)

**Request Body** (all fields optional):
```json
{
  "title_en": "Updated Title",
  "is_visible": false,
  "display_order": 10
}
```

**Success Response** (200):
```json
{
  "slide": {
    "id": "clz1234567890",
    "media_url": "/uploads/slides/hero-banner-1.jpg",
    "media_type": "image",
    "title_en": "Updated Title",
    "title_ar": "مرحباً بك في منصتنا",
    "button_text_en": "Get Started",
    "button_text_ar": "ابدأ الآن",
    "button_url": "/clients/add",
    "display_order": 10,
    "is_visible": false,
    "created_at": "2026-03-26T12:00:00Z",
    "updated_at": "2026-03-26T14:00:00Z"
  },
  "message": "Slider slide updated successfully"
}
```

**Notes**:
- Auto-updates `updated_at` timestamp
- Cannot update `id`, `created_at`, or `is_deleted` (use DELETE for soft-delete)

---

### 6. Toggle Slide Visibility

**Method**: `PATCH`  
**Path**: `/api/slider/[id]/toggle`  
**Auth**: Required (admin only)

**Description**: Toggles `is_visible` between true and false (quick show/hide)

**Success Response** (200):
```json
{
  "slide": {
    "id": "clz1234567890",
    "is_visible": false,
    "updated_at": "2026-03-26T14:30:00Z"
  },
  "message": "Slide visibility toggled successfully"
}
```

---

### 7. Reorder Slides

**Method**: `PUT`  
**Path**: `/api/slider/reorder`  
**Auth**: Required (admin only)

**Description**: Bulk update display_order for multiple slides

**Request Body**:
```json
{
  "slides": [
    { "id": "clz1234567890", "display_order": 2 },
    { "id": "clz0987654321", "display_order": 1 },
    { "id": "clz1111222333", "display_order": 3 }
  ]
}
```

**Success Response** (200):
```json
{
  "message": "Slides reordered successfully",
  "updated_count": 3
}
```

---

### 8. Delete Slide (Soft Delete)

**Method**: `DELETE`  
**Path**: `/api/slider/[id]`  
**Auth**: Required (admin only)

**Description**: Soft-deletes a slide (sets `is_deleted = true`)

**Success Response** (200):
```json
{
  "message": "Slider slide deleted successfully",
  "id": "clz1234567890"
}
```

**Already Deleted Response** (409):
```json
{
  "error": "Conflict",
  "message": "Slider slide already deleted"
}
```

---

## Media Upload Endpoint

### 9. Upload Slide Media

**Method**: `POST`  
**Path**: `/api/slider/upload`  
**Auth**: Required (admin only)  
**Content-Type**: `multipart/form-data`

**Description**: Uploads image/video/gif file and returns URL for use in slide creation

**Request**:
```http
POST /api/slider/upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="banner.jpg"
Content-Type: image/jpeg

<binary data>
------WebKitFormBoundary--
```

**Field Validation**:
- File size: Max 10MB
- Allowed types: image/jpeg, image/png, image/webp, image/gif, video/mp4, video/webm

**Success Response** (201):
```json
{
  "url": "/uploads/slides/banner-1234567890.jpg",
  "filename": "banner-1234567890.jpg",
  "media_type": "image",
  "size": 2450000,
  "message": "File uploaded successfully"
}
```

**Validation Error Response** (400):
```json
{
  "error": "Validation Error",
  "message": "File type not allowed. Allowed: jpg, png, webp, gif, mp4, webm"
}
```

**File Too Large Response** (413):
```json
{
  "error": "Payload Too Large",
  "message": "File size exceeds 10MB limit"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors, invalid input, invalid media type |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Non-admin attempting admin operation |
| 404 | Not Found | Slide ID does not exist |
| 409 | Conflict | Slide already in desired state (e.g., already deleted) |
| 413 | Payload Too Large | File upload exceeds size limit |
| 500 | Internal Server Error | Database errors, file system errors |

---

## Frontend Integration Examples

### Fetch Active Slides (Public - Home Page)

```typescript
async function fetchActiveSlides() {
  const response = await fetch('/api/slider');
  if (!response.ok) throw new Error('Failed to fetch slides');
  const data = await response.json();
  return data.slides;
}
```

### Create New Slide (Admin Panel)

```typescript
async function createSlide(slideData: SlideInput) {
  const response = await fetch('/api/slider', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slideData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}
```

### Upload Media File (Admin Panel)

```typescript
async function uploadSlideMedia(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/slider/upload', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  return data.url; // Use this URL in slide creation
}
```

### Toggle Slide Visibility (Admin Panel)

```typescript
async function toggleSlideVisibility(slideId: string) {
  const response = await fetch(`/api/slider/${slideId}/toggle`, {
    method: 'PATCH'
  });
  
  if (!response.ok) throw new Error('Failed to toggle visibility');
  return await response.json();
}
```

---

## Business Rules

1. **Public Visibility**: Only slides with `is_deleted = false` AND `is_visible = true` appear on home page
2. **Display Order**: Slides display in ascending order by `display_order` field
3. **Multilingual Support**: Display title and button text based on current language (title_en/title_ar)
4. **Button Display**: Show button only if both `button_text` and `button_url` are provided
5. **Media Validation**: Server should validate media_type matches actual file type on upload
6. **Auto-Play**: Slider auto-advances every 5 seconds (configurable client-side)
7. **Accessibility**: Provide alt text for images (can use title_en as fallback)
8. **Fallback**: If no active slides exist, show static hero section or hide slider

---

## Testing Checklist

- [ ] Unauthorized access returns 401
- [ ] Non-admin cannot POST/PUT/PATCH/DELETE
- [ ] Invalid media_type rejected with 400
- [ ] File upload validates size (<10MB) and type
- [ ] Soft-delete sets is_deleted=true (verify in database)
- [ ] Hidden slides (is_visible=false) excluded from public GET /api/slider
- [ ] Public endpoint GET /api/slider requires no auth
- [ ] Admin endpoint GET /api/slider/admin requires admin auth
- [ ] Reorder endpoint updates multiple slides atomically
- [ ] Toggle visibility switches between true/false
- [ ] Display order sorting works correctly
- [ ] Deleted slides (is_deleted=true) excluded from all public queries
- [ ] Media URLs are properly validated (no script injection)
- [ ] Bilingual titles and buttons work in both languages
