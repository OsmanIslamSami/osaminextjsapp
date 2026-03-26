# API Contract: Social Media Links

**Endpoint Base**: `/api/social-media`  
**Feature**: 003-mobile-responsive-animations  
**Date**: March 26, 2026  
**Authentication**: Required (Clerk session token)

## Overview

REST API for managing social media links displayed in application footer. Follows existing API patterns from `/api/clients` and `/api/orders` with input validation, error handling, and soft-delete support.

---

## Authentication

All endpoints require valid Clerk authentication.

**Headers**:
```http
Authorization: Bearer <clerk_session_token>
```

**Unauthorized Response** (401):
```json
{
  "error": "Unauthorized",
  "message": "Valid authentication required"
}
```

---

## Endpoints

### 1. List All Active Social Media Links

**Method**: `GET`  
**Path**: `/api/social-media`  
**Auth**: Required (any authenticated user)

**Description**: Returns all active (non-deleted) social media links sorted by display_order

**Query Parameters**: None

**Request Example**:
```http
GET /api/social-media HTTP/1.1
Host: example.com
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "links": [
    {
      "id": "clx1234567890",
      "platform": "Facebook",
      "url": "https://facebook.com/mycompany",
      "icon_path": "/icons/facebook.svg",
      "display_order": 1,
      "created_at": "2026-03-26T10:00:00Z",
      "updated_at": "2026-03-26T10:00:00Z"
    },
    {
      "id": "clx0987654321",
      "platform": "Twitter",
      "url": "https://twitter.com/mycompany",
      "icon_path": "/icons/twitter.svg",
      "display_order": 2,
      "created_at": "2026-03-26T10:05:00Z",
      "updated_at": "2026-03-26T10:05:00Z"
    }
  ],
  "count": 2
}
```

**Empty Response** (200):
```json
{
  "links": [],
  "count": 0
}
```

**Notes**:
- Only returns links where `is_deleted = false`
- Sorted by `display_order ASC`
- Does not include `is_deleted` field in response

---

### 2. Create New Social Media Link

**Method**: `POST`  
**Path**: `/api/social-media`  
**Auth**: Required (admin only - verify via Clerk role)

**Description**: Creates a new social media link

**Request Body**:
```json
{
  "platform": "LinkedIn",
  "url": "https://linkedin.com/company/mycompany",
  "icon_path": "/icons/linkedin.svg",
  "display_order": 3
}
```

**Field Validation**:
- `platform`: Required, string, 1-50 characters
- `url`: Required, string, valid URL (starts with https://), max 500 characters
- `icon_path`: Required, string, must start with "/icons/" and end with ".svg", max 200 characters
- `display_order`: Optional, integer >= 0, default 0

**Success Response** (201):
```json
{
  "link": {
    "id": "clx9876543210",
    "platform": "LinkedIn",
    "url": "https://linkedin.com/company/mycompany",
    "icon_path": "/icons/linkedin.svg",
    "display_order": 3,
    "created_at": "2026-03-26T11:00:00Z",
    "updated_at": "2026-03-26T11:00:00Z"
  },
  "message": "Social media link created successfully"
}
```

**Validation Error Response** (400):
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "url",
      "message": "URL must start with https://"
    },
    {
      "field": "icon_path",
      "message": "Icon path must end with .svg"
    }
  ]
}
```

---

### 3. Get Single Social Media Link

**Method**: `GET`  
**Path**: `/api/social-media/[id]`  
**Auth**: Required (any authenticated user)

**Description**: Returns a single social media link by ID

**Request Example**:
```http
GET /api/social-media/clx1234567890 HTTP/1.1
Host: example.com
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "link": {
    "id": "clx1234567890",
    "platform": "Facebook",
    "url": "https://facebook.com/mycompany",
    "icon_path": "/icons/facebook.svg",
    "display_order": 1,
    "is_deleted": false,
    "created_at": "2026-03-26T10:00:00Z",
    "updated_at": "2026-03-26T10:00:00Z"
  }
}
```

**Not Found Response** (404):
```json
{
  "error": "Not Found",
  "message": "Social media link not found"
}
```

**Notes**:
- Returns link even if `is_deleted = true` (for admin views)
- Includes `is_deleted` field in response

---

### 4. Update Social Media Link

**Method**: `PUT`  
**Path**: `/api/social-media/[id]`  
**Auth**: Required (admin only)

**Description**: Updates an existing social media link

**Request Body** (partial update supported):
```json
{
  "url": "https://facebook.com/newcomapny",
  "display_order": 5
}
```

**Success Response** (200):
```json
{
  "link": {
    "id": "clx1234567890",
    "platform": "Facebook",
    "url": "https://facebook.com/newcompany",
    "icon_path": "/icons/facebook.svg",
    "display_order": 5,
    "created_at": "2026-03-26T10:00:00Z",
    "updated_at": "2026-03-26T12:30:00Z"
  },
  "message": "Social media link updated successfully"
}
```

**Validation Error Response** (400):
```json
{
  "error": "Validation Error",
  "message": "Invalid URL format"
}
```

**Not Found Response** (404):
```json
{
  "error": "Not Found",
  "message": "Social media link not found"
}
```

**Notes**:
- Auto-updates `updated_at` timestamp
- Cannot update `id`, `created_at`, or `is_deleted` (use DELETE for soft-delete)

---

### 5. Delete Social Media Link (Soft Delete)

**Method**: `DELETE`  
**Path**: `/api/social-media/[id]`  
**Auth**: Required (admin only)

**Description**: Soft-deletes a social media link (sets `is_deleted = true`)

**Request Example**:
```http
DELETE /api/social-media/clx1234567890 HTTP/1.1
Host: example.com
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "message": "Social media link deleted successfully",
  "id": "clx1234567890"
}
```

**Not Found Response** (404):
```json
{
  "error": "Not Found",
  "message": "Social media link not found"
}
```

**Already Deleted Response** (409):
```json
{
  "error": "Conflict",
  "message": "Social media link already deleted"
}
```

**Notes**:
- Does not permanently delete record (soft-delete only)
- Record remains in database with `is_deleted = true`
- Future enhancement: Add restore endpoint (PUT /api/social-media/[id]/restore)

---

## Error Handling

### Standard Error Response Format

All error responses follow this structure:

```json
{
  "error": "<ErrorType>",
  "message": "<Human-readable message>",
  "details": [] // Optional, for validation errors
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Authenticated but not authorized (e.g., non-admin trying to create/update/delete) |
| 404 | Not Found | Resource ID does not exist |
| 409 | Conflict | Resource already in desired state (e.g., already deleted) |
| 500 | Internal Server Error | Database errors, unexpected exceptions |

---

## Role-Based Access Control

| Endpoint | Any User | Admin Only |
|----------|----------|------------|
| GET /api/social-media | ✅ | ✅ |
| GET /api/social-media/[id] | ✅ | ✅ |
| POST /api/social-media | ❌ | ✅ |
| PUT /api/social-media/[id] | ❌ | ✅ |
| DELETE /api/social-media/[id] | ❌ | ✅ |

**Admin Check** (via Clerk metadata):
```typescript
import { auth } from '@clerk/nextjs';

export async function requireAdmin() {
  const { userId, sessionClaims } = auth();
  if (!userId) throw new Error('Unauthorized');
  
  const isAdmin = sessionClaims?.metadata?.role === 'admin';
  if (!isAdmin) throw new Error('Forbidden: Admin access required');
}
```

---

## Rate Limiting

**Note**: Consider implementing rate limiting for public-facing endpoints

**Suggested Limits**:
- GET endpoints: 100 requests/minute per user
- POST/PUT/DELETE endpoints: 20 requests/minute per user

---

## Frontend Integration Examples

### Fetch All Links (Footer Component)

```typescript
async function fetchSocialLinks() {
  const response = await fetch('/api/social-media');
  if (!response.ok) throw new Error('Failed to fetch social links');
  const data = await response.json();
  return data.links;
}
```

### Create New Link (Admin Panel)

```typescript
async function createSocialLink(platform: string, url: string, iconPath: string) {
  const response = await fetch('/api/social-media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, url, icon_path: iconPath, display_order: 0 })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}
```

---

## Testing Checklist

- [ ] Unauthorized access returns 401
- [ ] Non-admin cannot POST/PUT/DELETE
- [ ] Invalid URL format rejected with 400
- [ ] Invalid icon_path (not .svg) rejected with 400
- [ ] Soft-delete sets is_deleted=true (verify in database)
- [ ] Deleted links excluded from GET /api/social-media
- [ ] Non-existent ID returns 404
- [ ] Successful operations return correct status codes
- [ ] Response formats match contract
- [ ] Display order sorting works correctly
