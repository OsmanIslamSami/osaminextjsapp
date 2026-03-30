# API Contract: Home Sections Endpoint

**Base URL**: `/api/home-sections`  
**Authentication**: Required (Clerk session)  
**Authorization**: Admin role required for all operations  

**Purpose**: Manage global configuration for media library sections displayed on home page (photos, videos, partners).

---

## GET /api/home-sections

**Purpose**: Retrieve home section configurations.

**Authorization**: Public for read (no auth required), Admin for full details.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `section_type` | enum | No | - | Filter: `photos`, `videos`, `partners` |
| `visible_only` | boolean | No | false | Include only visible sections |

### Response Schema

**List Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "clxhome123456",
      "section_type": "photos",
      "is_visible": true,
      "title_en": null,
      "title_ar": null,
      "display_order": 1,
      "partners_display_mode": null,
      "partners_max_count": null,
      "created_at": "2026-03-01T00:00:00.000Z",
      "updated_at": "2026-03-25T10:00:00.000Z"
    },
    {
      "id": "clxhome234567",
      "section_type": "videos",
      "is_visible": true,
      "title_en": null,
      "title_ar": null,
      "display_order": 2,
      "partners_display_mode": null,
      "partners_max_count": null,
      "created_at": "2026-03-01T00:00:00.000Z",
      "updated_at": "2026-03-01T00:00:00.000Z"
    },
    {
      "id": "clxhome345678",
      "section_type": "partners",
      "is_visible": true,
      "title_en": "Our Partners",
      "title_ar": "شركاؤنا",
      "display_order": 3,
      "partners_display_mode": "all",
      "partners_max_count": null,
      "created_at": "2026-03-01T00:00:00.000Z",
      "updated_at": "2026-03-20T14:30:00.000Z"
    }
  ]
}
```

**Single Section Response** (200 OK):
```bash
GET /api/home-sections?section_type=partners
```
```json
{
  "success": true,
  "data": {
    "id": "clxhome345678",
    "section_type": "partners",
    "is_visible": true,
    "title_en": "Our Partners",
    "title_ar": "شركاؤنا",
    "display_order": 3,
    "partners_display_mode": "all",
    "partners_max_count": null,
    "created_at": "2026-03-01T00:00:00.000Z",
    "updated_at": "2026-03-20T14:30:00.000Z"
  }
}
```

**Error Responses**:
- `404 Not Found`: Section type not found (invalid section_type parameter)

---

## PATCH /api/home-sections/:section_type

**Purpose**: Update home section configuration.

**Authorization**: Admin role required.

### URL Parameters

- `section_type` (enum): Section identifier - `photos`, `videos`, or `partners`

### Request Body

**Content-Type**: `application/json`

**Fields** (all optional):
```typescript
{
  is_visible?: boolean;           // Toggle section visibility on home page
  title_en?: string | null;       // Custom section title (EN), null = use default
  title_ar?: string | null;       // Custom section title (AR), null = use default
  display_order?: number;         // Section position on home page (1-based)
  partners_display_mode?: 'all' | 'limit';  // Partners only
  partners_max_count?: number | null;       // Partners only, requires mode='limit'
}
```

### Validation Rules

1. **section_type**:
   - Must be one of: `photos`, `videos`, `partners`
   - Case-sensitive
   
2. **display_order**:
   - Must be positive integer
   - Determines vertical order on home page (1 = top, 3 = bottom)
   
3. **partners_display_mode**:
   - Only applicable when `section_type = 'partners'`
   - Must be `'all'` or `'limit'`
   - If `'limit'`, requires `partners_max_count` > 0
   
4. **partners_max_count**:
   - Only applicable when `section_type = 'partners'`
   - Must be positive integer if mode = `'limit'`
   - Ignored if mode = `'all'` (can be null)

### Response Schema

**Success** (200 OK):
```json
{
  "success": true,
  "message": "Section updated successfully",
  "data": {
    "id": "clxhome123456",
    "section_type": "photos",
    "is_visible": false,
    "title_en": null,
    "title_ar": null,
    "display_order": 1,
    "partners_display_mode": null,
    "partners_max_count": null,
    "updated_at": "2026-03-30T15:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors (invalid section_type, negative display_order, invalid mode/count combination)
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Non-admin user
- `404 Not Found`: Section type not found
- `500 Internal Server Error`: Update failed

---

## POST /api/home-sections/initialize

**Purpose**: Initialize default home section configurations (run once during setup).

**Authorization**: Admin role required.

**Note**: This endpoint is idempotent - it uses upsert to create or update sections.

### Response Schema

**Success** (201 Created):
```json
{
  "success": true,
  "message": "Home sections initialized successfully",
  "data": [
    {
      "section_type": "photos",
      "is_visible": true,
      "display_order": 1
    },
    {
      "section_type": "videos",
      "is_visible": true,
      "display_order": 2
    },
    {
      "section_type": "partners",
      "is_visible": true,
      "display_order": 3,
      "partners_display_mode": "all"
    }
  ]
}
```

---

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid configuration",
    "details": [
      {
        "field": "partners_max_count",
        "message": "partners_max_count must be a positive integer when mode is 'limit'"
      }
    ]
  }
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid input data
- `INVALID_SECTION_TYPE`: Section type not recognized
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Section not found
- `DATABASE_ERROR`: Database operation failed

---

## Configuration Scenarios

### Scenario 1: Hide Videos Section
```json
PATCH /api/home-sections/videos
{
  "is_visible": false
}
```
**Result**: Videos section completely hidden from home page.

### Scenario 2: Show Only 6 Partners
```json
PATCH /api/home-sections/partners
{
  "partners_display_mode": "limit",
  "partners_max_count": 6
}
```
**Result**: Partners section shows 6 most recent (featured-first) partners.

### Scenario 3: Show All Partners
```json
PATCH /api/home-sections/partners
{
  "partners_display_mode": "all",
  "partners_max_count": null
}
```
**Result**: All visible partners displayed in slider.

### Scenario 4: Custom Section Title
```json
PATCH /api/home-sections/photos
{
  "title_en": "Photo Gallery",
  "title_ar": "معرض الصور"
}
```
**Result**: Section displays custom titles instead of defaults.

### Scenario 5: Reorder Sections
```json
PATCH /api/home-sections/videos
{ "display_order": 1 }

PATCH /api/home-sections/photos
{ "display_order": 2 }

PATCH /api/home-sections/partners
{ "display_order": 3 }
```
**Result**: Videos appear first, then photos, then partners.

---

## Frontend Integration

### Fetching Section Configuration

```typescript
// lib/utils/home-sections.ts
export async function getHomeSectionConfig(sectionType: 'photos' | 'videos' | 'partners') {
  const response = await fetch(`/api/home-sections?section_type=${sectionType}`);
  const { data } = await response.json();
  return data;
}

export async function getAllHomeSections() {
  const response = await fetch('/api/home-sections');
  const { data } = await response.json();
  return data;
}
```

### Checking Visibility

```typescript
// app/page.tsx
export default async function HomePage() {
  const sections = await getAllHomeSections();
  
  const photosSection = sections.find(s => s.section_type === 'photos');
  const videosSection = sections.find(s => s.section_type === 'videos');
  const partnersSection = sections.find(s => s.section_type === 'partners');
  
  return (
    <>
      {photosSection?.is_visible && <PhotosSection config={photosSection} />}
      {videosSection?.is_visible && <VideosSection config={videosSection} />}
      {partnersSection?.is_visible && <PartnersSection config={partnersSection} />}
    </>
  );
}
```

### Admin Toggle Component

```typescript
// lib/components/admin/SectionVisibilityToggle.tsx
'use client';

export function SectionVisibilityToggle({ 
  sectionType, 
  initialVisibility 
}: { 
  sectionType: string; 
  initialVisibility: boolean; 
}) {
  const [isVisible, setIsVisible] = useState(initialVisibility);
  
  const handleToggle = async () => {
    const response = await fetch(`/api/home-sections/${sectionType}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: !isVisible }),
    });
    
    if (response.ok) {
      setIsVisible(!isVisible);
    }
  };
  
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={isVisible}
        onChange={handleToggle}
        className="toggle"
      />
      <span>Show {sectionType} section on home page</span>
    </label>
  );
}
```

---

## Default Section Titles

If `title_en` and `title_ar` are null, use these defaults:

| Section Type | Default Title EN | Default Title AR |
|-------------|------------------|------------------|
| photos | "Photos" | "الصور" |
| videos | "Videos" | "الفيديوهات" |
| partners | "Our Partners" | "شركاؤنا" |

---

## Examples

### Example 1: Get All Section Configurations
```bash
curl -X GET "https://example.com/api/home-sections"
```

### Example 2: Hide Photos Section
```bash
curl -X PATCH "https://example.com/api/home-sections/photos" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{"is_visible": false}'
```

### Example 3: Limit Partners to 8
```bash
curl -X PATCH "https://example.com/api/home-sections/partners" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "partners_display_mode": "limit",
    "partners_max_count": 8
  }'
```

### Example 4: Set Custom Titles
```bash
curl -X PATCH "https://example.com/api/home-sections/videos" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title_en": "Latest Videos",
    "title_ar": "أحدث الفيديوهات"
  }'
```

### Example 5: Reorder Sections
```bash
# Move partners to top
curl -X PATCH "https://example.com/api/home-sections/partners" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{"display_order": 1}'

# Move photos to middle
curl -X PATCH "https://example.com/api/home-sections/photos" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{"display_order": 2}'

# Move videos to bottom
curl -X PATCH "https://example.com/api/home-sections/videos" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{"display_order": 3}'
```
