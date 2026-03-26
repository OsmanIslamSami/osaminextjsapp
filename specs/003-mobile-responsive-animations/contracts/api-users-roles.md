# API Contract: User Management & Role-Based Access Control

**Endpoint Base**: `/api/users`  
**Feature**: 003-mobile-responsive-animations  
**Date**: March 26, 2026  
**Authentication**: Required (Clerk session token)

## Overview

API for managing user roles and enforcing role-based access control (RBAC). Automatically syncs Clerk authenticated users to local database and provides admin functionality for role management.

---

## Authentication & Authorization

All endpoints require valid Clerk authentication.

**Role-Based Access**:
- **Any Authenticated User**: Can view their own user info
- **Admin Only**: Can view all users, update user roles

**Headers**:
```http
Authorization: Bearer <clerk_session_token>
```

---

## User Sync Mechanism

### Automatic User Creation on First Login

**Trigger**: Clerk user authenticates for the first time  
**Implementation**: Middleware or API route intercept

**Flow**:
1. User authenticates via Clerk
2. System extracts `clerk_user_id` from Clerk session
3. System checks if `clerk_user_id` exists in `users` table
4. If not exists → Create new User record with role="user"
5. If exists → Update email/name if changed in Clerk

**Middleware Pattern**:
```typescript
// middleware.ts or auth helper
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/db';

export async function ensureUserSynced() {
  const { userId, sessionClaims } = auth();
  
  if (!userId) return null;
  
  const clerkEmail = sessionClaims?.email || '';
  const clerkName = sessionClaims?.name || '';
  
  let user = await prisma.user.findUnique({
    where: { clerk_user_id: userId }
  });
  
  if (!user) {
    // First login - create user
    user = await prisma.user.create({
      data: {
        clerk_user_id: userId,
        email: clerkEmail,
        name: clerkName,
        role: 'user',
      }
    });
  } else {
    // Sync updates from Clerk
    if (user.email !== clerkEmail || user.name !== clerkName) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { email: clerkEmail, name: clerkName }
      });
    }
  }
  
  return user;
}
```

---

## Endpoints

### 1. Get Current User

**Method**: `GET`  
**Path**: `/api/users/me`  
**Auth**: Required (any authenticated user)

**Description**: Returns the currently authenticated user's profile and role

**Request Example**:
```http
GET /api/users/me HTTP/1.1
Host: example.com
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "user": {
    "id": "cly1234567890",
    "clerk_user_id": "user_2abcdefGHIJKL123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "user",
    "is_active": true,
    "created_at": "2026-03-25T14:30:00Z",
    "updated_at": "2026-03-25T14:30:00Z"
  }
}
```

**Unauthorized Response** (401):
```json
{
  "error": "Unauthorized",
  "message": "Valid authentication required"
}
```

---

### 2. List All Users

**Method**: `GET`  
**Path**: `/api/users`  
**Auth**: Required (admin only)

**Description**: Returns all users (for admin user management)

**Query Parameters**:
- `role` (optional): Filter by role ("admin" or "user")
- `is_active` (optional): Filter by active status (true/false)

**Request Example**:
```http
GET /api/users?role=admin HTTP/1.1
Host: example.com
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "users": [
    {
      "id": "cly1234567890",
      "clerk_user_id": "user_2abcdefGHIJKL123",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "is_active": true,
      "created_at": "2026-03-20T08:00:00Z",
      "updated_at": "2026-03-26T09:15:00Z"
    },
    {
      "id": "cly0987654321",
      "clerk_user_id": "user_2mnodefGHIJKL456",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "user",
      "is_active": true,
      "created_at": "2026-03-25T14:30:00Z",
      "updated_at": "2026-03-25T14:30:00Z"
    }
  ],
  "count": 2
}
```

**Forbidden Response** (403):
```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

---

### 3. Update User Role

**Method**: `PUT`  
**Path**: `/api/users/[id]/role`  
**Auth**: Required (admin only)

**Description**: Updates a user's role (promote to admin or demote to user)

**Request Body**:
```json
{
  "role": "admin"
}
```

**Field Validation**:
- `role`: Required, must be "admin" or "user"

**Success Response** (200):
```json
{
  "user": {
    "id": "cly0987654321",
    "clerk_user_id": "user_2mnodefGHIJKL456",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "admin",
    "is_active": true,
    "updated_at": "2026-03-26T15:00:00Z"
  },
  "message": "User role updated successfully"
}
```

**Validation Error Response** (400):
```json
{
  "error": "Validation Error",
  "message": "Invalid role. Must be 'admin' or 'user'"
}
```

**Business Rule Violation** (409):
```json
{
  "error": "Conflict",
  "message": "Cannot demote the last admin user"
}
```

**Forbidden Response** (403):
```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

---

### 4. Deactivate User

**Method**: `PUT`  
**Path**: `/api/users/[id]/deactivate`  
**Auth**: Required (admin only)

**Description**: Deactivates a user account (sets is_active = false)

**Success Response** (200):
```json
{
  "user": {
    "id": "cly0987654321",
    "email": "john.doe@example.com",
    "is_active": false,
    "updated_at": "2026-03-26T15:30:00Z"
  },
  "message": "User deactivated successfully"
}
```

**Business Rule Violation** (409):
```json
{
  "error": "Conflict",
  "message": "Cannot deactivate the last admin user"
}
```

---

### 5. Reactivate User

**Method**: `PUT`  
**Path**: `/api/users/[id]/activate`  
**Auth**: Required (admin only)

**Description**: Reactivates a deactivated user account (sets is_active = true)

**Success Response** (200):
```json
{
  "user": {
    "id": "cly0987654321",
    "email": "john.doe@example.com",
    "is_active": true,
    "updated_at": "2026-03-26T16:00:00Z"
  },
  "message": "User activated successfully"
}
```

---

## Role-Based Client Operations

### Check User Role for Delete Permission

**Helper Function Pattern**:
```typescript
// lib/auth/permissions.ts
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/db';

export async function canDeleteClients(): Promise<boolean> {
  const { userId } = auth();
  if (!userId) return false;
  
  const user = await prisma.user.findUnique({
    where: { clerk_user_id: userId },
    select: { role: true, is_active: true }
  });
  
  return user?.is_active && user?.role === 'admin';
}

export async function getCurrentUser() {
  const { userId } = auth();
  if (!userId) return null;
  
  return await prisma.user.findUnique({
    where: { clerk_user_id: userId }
  });
}
```

---

### Modified Client Delete Endpoint

**Method**: `DELETE`  
**Path**: `/api/clients/[id]`  
**Auth**: Required (admin only for delete)

**Authorization Check**:
```typescript
// app/api/clients/[id]/route.ts
import { canDeleteClients } from '@/lib/auth/permissions';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const canDelete = await canDeleteClients();
  
  if (!canDelete) {
    return Response.json(
      { error: 'Forbidden', message: 'Admin role required to delete clients' },
      { status: 403 }
    );
  }
  
  // Proceed with soft-delete
  const client = await prisma.client.update({
    where: { id: params.id },
    data: { is_deleted: true }
  });
  
  return Response.json({ message: 'Client deleted successfully', id: client.id });
}
```

---

## Frontend Integration

### Check User Role in Components

```typescript
'use client';
import { useEffect, useState } from 'react';

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setIsAdmin(data.user?.role === 'admin');
      });
  }, []);
  
  return { user, isAdmin };
}
```

### Conditional Delete Button

```typescript
// lib/components/clients/ClientTableRow.tsx
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

export function ClientTableRow({ client }) {
  const { isAdmin } = useCurrentUser();
  
  return (
    <tr>
      <td>{client.name}</td>
      <td>{client.email}</td>
      <td>
        <button>Edit</button>
        {isAdmin && <button onClick={() => handleDelete(client.id)}>Delete</button>}
      </td>
    </tr>
  );
}
```

---

## Business Rules

### Critical Constraints

1. **Last Admin Protection**: Cannot demote or deactivate the last admin user (prevent lockout)
2. **Default Role**: All new users default to "user" role
3. **Clerk as Source of Truth**: clerk_user_id is immutable and authoritative
4. **Auto-Sync**: Email and name update from Clerk on each login
5. **Active User Check**: Deactivated users (is_active=false) cannot access system

### Role Permissions Matrix

| Operation | User | Admin |
|-----------|------|-------|
| View Clients | ✅ | ✅ |
| Add Client | ✅ | ✅ |
| Edit Client | ✅ | ✅ |
| Delete Client | ❌ | ✅ |
| View Dashboard | ✅ | ✅ |
| Export Clients | ✅ | ✅ |
| Manage Users | ❌ | ✅ |
| Assign Roles | ❌ | ✅ |

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful operation |
| 400 | Bad Request | Invalid role value |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Non-admin attempting admin operation |
| 404 | Not Found | User ID does not exist |
| 409 | Conflict | Business rule violation (e.g., last admin) |
| 500 | Internal Server Error | Database errors |

---

## Testing Checklist

- [ ] First-time Clerk login creates User record with role="user"
- [ ] Subsequent logins update email/name if changed in Clerk
- [ ] Admin can view all users via GET /api/users
- [ ] Admin can promote user to admin via PUT /api/users/[id]/role
- [ ] Admin can demote admin to user via PUT /api/users/[id]/role
- [ ] Cannot demote last admin (409 Conflict)
- [ ] Admin can delete clients (DELETE /api/clients/[id])
- [ ] Regular user cannot delete clients (403 Forbidden)
- [ ] Regular user can add/edit/view clients
- [ ] Delete button hidden for non-admin users in UI
- [ ] Deactivated user cannot access app (is_active=false check)
- [ ] At least one admin user exists at all times
