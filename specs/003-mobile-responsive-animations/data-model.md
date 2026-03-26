# Data Model: Mobile Responsive UI with Animations

**Feature**: 003-mobile-responsive-animations  
**Date**: March 26, 2026  
**Phase**: Phase 1 - Design

## Overview

This feature introduces two new database entities (Users, SocialMediaLink) and creates new client-side data structures for internationalization. Existing entities (Clients, Orders) remain unchanged but gain presentation-layer enhancements (responsive views, translations).

**Naming Convention Note**: This project uses consistent naming patterns across layers:
- **Database tables**: snake_case (e.g., `social_media_links`, `slider_content`)
- **Prisma models**: PascalCase (e.g., `SocialMediaLink`, `SliderContent`)
- **API routes**: kebab-case (e.g., `/api/social-media`, `/api/slider`)
- **TypeScript types**: PascalCase matching Prisma models

---

## New Database Entities

### Users

**Purpose**: Store authenticated user information synced from Clerk with role-based access control for application features

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | Primary Key, CUID | Unique internal identifier |
| clerk_user_id | String | NOT NULL, UNIQUE | Clerk user ID (from Clerk authentication) |
| email | String | NOT NULL | User's email address (synced from Clerk) |
| name | String | NULL | User's full name (synced from Clerk) |
| role | String | NOT NULL, Default: "user" | User role: "admin" or "user" |
| is_active | Boolean | NOT NULL, Default: true | Whether user account is active |
| created_at | DateTime | NOT NULL, Auto-generated | Record creation timestamp |
| updated_at | DateTime | NOT NULL, Auto-updated | Record last modification timestamp |

**Prisma Schema**:
```prisma
model User {
  id             String   @id @default(cuid())
  clerk_user_id  String   @unique
  email          String
  name           String?
  role           String   @default("user")
  is_active      Boolean  @default(true)
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt

  @@index([clerk_user_id])
  @@index([email])
  @@index([role])
  @@map("users")
}
```

**Relationships**: None (standalone entity, but logically related to Clients/Orders via audit fields)

**Validation Rules**:
- **clerk_user_id**: Required, unique, matches Clerk user ID format (e.g., "user_...")
- **email**: Required, valid email format, max 255 characters
- **name**: Optional, max 255 characters
- **role**: Required, must be either "admin" or "user" (enum-like constraint)
- **Uniqueness**: clerk_user_id must be unique (one User record per Clerk account)

**State Transitions**:
- **Create (First Login)**: User authenticates via Clerk → System checks if clerk_user_id exists in users table → If not, create new User record with role="user", is_active=true
- **Sync (Subsequent Logins)**: User authenticates → System updates email/name if changed in Clerk
- **Deactivate**: Admin sets is_active=false (user cannot access system)
- **Promote to Admin**: Admin changes role from "user" to "admin"
- **Demote from Admin**: Admin changes role from "admin" to "user"

**Business Rules**:
- New users default to "user" role (cannot delete clients)
- Admin role grants permission to delete clients (soft-delete)
- All authenticated users (admin and user) can add, edit, view clients
- At least one admin user must exist in system (prevent lockout)
- clerk_user_id is immutable (cannot change after creation)
- Email/name sync from Clerk on each login (keep data fresh)

**Example Records**:
```json
[
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
]
```

---

### SocialMediaLink

**Purpose**: Store manageable social media platform links displayed in application footer

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | Primary Key, CUID | Unique identifier |
| platform | String | NOT NULL | Platform name (e.g., "Facebook", "Twitter", "Instagram", "LinkedIn") |
| url | String | NOT NULL, Valid URL | Full URL to social media profile/page |
| icon_path | String | NOT NULL | Relative path to SVG icon in public directory (e.g., "/icons/facebook.svg") |
| display_order | Integer | NOT NULL, Default: 0 | Sort order for footer display (lower numbers appear first) |
| is_deleted | Boolean | NOT NULL, Default: false | Soft-delete flag (follows Constitution principle) |
| created_at | DateTime | NOT NULL, Auto-generated | Record creation timestamp |
| updated_at | DateTime | NOT NULL, Auto-updated | Record last modification timestamp |

**Prisma Schema**:
```prisma
model SocialMediaLink {
  id            String   @id @default(cuid())
  platform      String
  url           String
  icon_path     String
  display_order Int      @default(0)
  is_deleted    Boolean  @default(false)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  @@index([is_deleted, display_order])
  @@map("social_media_links")
}
```

**Relationships**: None (standalone entity)

**Validation Rules**:
- **platform**: Required, 1-50 characters, alphanumeric with spaces
- **url**: Required, valid URL format (https://), max 500 characters
- **icon_path**: Required, must start with "/icons/", must end with ".svg", max 200 characters
- **display_order**: Integer >= 0, default 0
- **Uniqueness**: No unique constraints (allow multiple links to same platform if needed)

**State Transitions**:
- **Create**: is_deleted = false (default)
- **Soft Delete**: Set is_deleted = true (preserve record, hide from display)
- **Restore**: Set is_deleted = false (make visible again)
- **Update**: Modify platform, url, icon_path, or display_order; auto-update updated_at

**Business Rules**:
- Active links (is_deleted=false) appear in footer sorted by display_order ascending
- If icon_path references non-existent file, display generic link icon or hide entry
- External links (social media URLs) open in new tab (target="_blank", rel="noopener noreferrer")

**Example Records**:
```json
[
  {
    "id": "clx1234567890",
    "platform": "Facebook",
    "url": "https://facebook.com/mycompany",
    "icon_path": "/icons/facebook.svg",
    "display_order": 1,
    "is_deleted": false,
    "created_at": "2026-03-26T10:00:00Z",
    "updated_at": "2026-03-26T10:00:00Z"
  },
  {
    "id": "clx0987654321",
    "platform": "Twitter",
    "url": "https://twitter.com/mycompany",
    "icon_path": "/icons/twitter.svg",
    "display_order": 2,
    "is_deleted": false,
    "created_at": "2026-03-26T10:05:00Z",
    "updated_at": "2026-03-26T10:05:00Z"
  }
]
```

---

### SliderContent

**Purpose**: Store hero slider/carousel content for home page with support for images, videos, GIFs, titles, and call-to-action buttons

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | Primary Key, CUID | Unique identifier |
| media_url | String | NOT NULL | Full URL or path to media file (image, video, GIF) - can be uploaded file path or external URL |
| media_type | String | NOT NULL | Media type: "image", "video", or "gif" |
| title_en | String | NULL | Slide title in English (optional overlay text) |
| title_ar | String | NULL | Slide title in Arabic (optional overlay text) |
| button_text_en | String | NULL | Call-to-action button text in English (optional) |
| button_text_ar | String | NULL | Call-to-action button text in Arabic (optional) |
| button_url | String | NULL | URL for button click action (optional) |
| show_button | Boolean | NOT NULL, Default: false | Explicit flag to show/hide call-to-action button regardless of button_text presence |
| display_order | Integer | NOT NULL, Default: 0 | Sort order for slider (lower numbers appear first) |
| is_visible | Boolean | NOT NULL, Default: true | Whether slide is visible in public slider (show/hide toggle) |
| is_deleted | Boolean | NOT NULL, Default: false | Soft-delete flag |
| created_at | DateTime | NOT NULL, Auto-generated | Record creation timestamp |
| updated_at | DateTime | NOT NULL, Auto-updated | Record last modification timestamp |

**Prisma Schema**:
```prisma
model SliderContent {
  id              String   @id @default(cuid())
  media_url       String
  media_type      String
  title_en        String?
  title_ar        String?
  button_text_en  String?
  button_text_ar  String?
  button_url      String?
  show_button     Boolean  @default(false)
  display_order   Int      @default(0)
  is_visible      Boolean  @default(true)
  is_deleted      Boolean  @default(false)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  @@index([is_deleted, is_visible, display_order])
  @@map("slider_content")
}
```

**Relationships**: None (standalone entity)

**Validation Rules**:
- **media_url**: Required, max 1000 characters, valid URL or file path
- **media_type**: Required, must be one of: "image", "video", "gif"
- **title_en/title_ar**: Optional, max 200 characters each
- **button_text_en/button_text_ar**: Optional, max 100 characters each
- **button_url**: Optional, valid URL format if provided, max 500 characters
- **show_button**: Boolean, default false; if true, button displays only if button_text (en/ar) and button_url are provided
- **display_order**: Integer >= 0, default 0
- **Business Rule**: At least one of title_en or title_ar should be provided for accessibility
- **Business Rule**: Button renders only when show_button=true AND button_text (for current language) AND button_url are all present

**State Transitions**:
- **Create**: is_visible = true, is_deleted = false (default - immediately visible in slider)
- **Hide**: Set is_visible = false (slide exists but not shown in public slider)
- **Show**: Set is_visible = true (make slide visible in slider rotation)
- **Soft Delete**: Set is_deleted = true (preserve record, excluded from all queries)
- **Restore**: Set is_deleted = false (undelete)
- **Update**: Modify any field; auto-update updated_at
- **Reorder**: Update display_order to change slide sequence

**Business Rules**:
- Active slides (is_deleted=false AND is_visible=true) appear in slider sorted by display_order ascending
- If media_type is "video", media_url should point to MP4 or WebM file
- If media_type is "image" or "gif", media_url should point to JPG, PNG, WebP, or GIF file
- Slider displays title based on current language (title_en for English, title_ar for Arabic)
- If button_text is provided but button_url is null, button is not clickable (display only)
- Slider should gracefully handle missing media (show placeholder or skip slide)

**Example Records**:
```json
[
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
    "is_visible": true,
    "is_deleted": false,
    "created_at": "2026-03-26T12:10:00Z",
    "updated_at": "2026-03-26T12:10:00Z"
  }
]
```

---

## Client-Side Data Structures (Non-Database)

### Translation Dictionary

**Purpose**: Store UI text translations for English and Arabic languages

**Structure**: JSON files in `lib/i18n/translations/`

**Schema**:
```typescript
// TypeScript type definition
type TranslationKey = string; // Nested dot notation (e.g., "nav.home", "buttons.save")
type TranslationValue = string;
type Translations = Record<TranslationKey, TranslationValue | Record<string, TranslationValue>>;

// Example structure
interface AppTranslations {
  nav: {
    home: string;
    dashboard: string;
    clients: string;
    login: string;
  };
  buttons: {
    add: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    export: string;
  };
  clients: {
    title: string;
    addNew: string;
    searchPlaceholder: string;
    // ... more client-related strings
  };
  dashboard: {
    title: string;
    totalClients: string;
    totalOrders: string;
    // ... more dashboard strings
  };
  // ... more sections
}
```

**English Example** (`lib/i18n/translations/en.json`):
```json
{
  "nav": {
    "home": "Home",
    "dashboard": "Dashboard",
    "clients": "Clients"
  },
  "buttons": {
    "add": "Add",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel"
  },
  "clients": {
    "title": "Client Management",
    "addNew": "Add New Client",
    "searchPlaceholder": "Search by name, email, or mobile..."
  }
}
```

**Arabic Example** (`lib/i18n/translations/ar.json`):
```json
{
  "nav": {
    "home": "الرئيسية",
    "dashboard": "لوحة التحكم",
    "clients": "العملاء"
  },
  "buttons": {
    "add": "إضافة",
    "edit": "تعديل",
    "delete": "حذف",
    "save": "حفظ",
    "cancel": "إلغاء"
  },
  "clients": {
    "title": "إدارة العملاء",
    "addNew": "إضافة عميل جديد",
    "searchPlaceholder": "البحث بالاسم أو البريد الإلكتروني أو الهاتف..."
  }
}
```

**Validation Rules**:
- Both language files must have identical keys (structural parity)
- Values must not contain HTML (security - prevent XSS)
- Keys use camelCase for nested properties
- Top-level keys match page/component sections

---

### Language Context State

**Purpose**: Manage current language selection and provide translation access

**Structure**: React Context API

**State Shape**:
```typescript
interface LanguageContextValue {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  t: (key: string) => string; // Translation function
  direction: 'ltr' | 'rtl';    // Computed from language
}
```

**State Transitions**:
1. **Initialization**: Load from localStorage → fallback to browser language → default to 'en'
2. **Language Switch**: User clicks language switcher → setLanguage('ar' or 'en') → save to localStorage → trigger re-render
3. **Translation Lookup**: Component calls t('nav.home') → return translations[language]['nav']['home']

**Persistence**: Store in `localStorage` with key `"app_language"` (survives page refresh, not server-side)

---

## Existing Entities (No Schema Changes)

### Clients

**Changes**: None (database schema unchanged)

**Presentation Enhancements**:
- Table view becomes responsive (card layout on mobile <768px)
- Forms adapt to full-width inputs on mobile
- Labels and field names translate based on language context

### Orders

**Changes**: None (database schema unchanged)

**Presentation Enhancements**:
- Order history displays adapt to mobile screens
- Status badges translate (Pending → قيد الانتظار, Completed → مكتمل, etc.)
- Timestamps format according to language locale

---

## Data Migration

### Migration 1: Add Users Table

**File**: `prisma/migrations/20260326_add_users_table/migration.sql`

```sql
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE INDEX "users_clerk_user_id_idx" ON "users"("clerk_user_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
```

**Rollback**:
```sql
-- DropTable
DROP TABLE "users";
```

**Zero-Downtime**: ✅ Yes (new table, no dependencies)

---

### Migration 2: Add SocialMediaLink Table

**File**: `prisma/migrations/20260326_add_social_media_links/migration.sql`

```sql
-- CreateTable
CREATE TABLE "social_media_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon_path" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "social_media_links_is_deleted_display_order_idx" 
  ON "social_media_links"("is_deleted", "display_order");
```

**Rollback**:
```sql
-- DropTable
DROP TABLE "social_media_links";
```

**Zero-Downtime**: ✅ Yes (new table, no dependencies)

---

### Migration 3: Add SliderContent Table

**File**: `prisma/migrations/20260326_add_slider_content/migration.sql`

```sql
-- CreateTable
CREATE TABLE "slider_content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "media_url" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "title_en" TEXT,
    "title_ar" TEXT,
    "button_text_en" TEXT,
    "button_text_ar" TEXT,
    "button_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "slider_content_is_deleted_is_visible_display_order_idx" 
  ON "slider_content"("is_deleted", "is_visible", "display_order");
```

**Rollback**:
```sql
-- DropTable
DROP TABLE "slider_content";
```

**Zero-Downtime**: ✅ Yes (new table, no dependencies)

---

## Seed Data (Optional)

**Purpose**: Provide default social media links for development/testing

**File**: `scripts/seed-social-media.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultLinks = [
  { platform: 'Facebook', url: 'https://facebook.com', icon_path: '/icons/facebook.svg', display_order: 1 },
  { platform: 'Twitter', url: 'https://twitter.com', icon_path: '/icons/twitter.svg', display_order: 2 },
  { platform: 'Instagram', url: 'https://instagram.com', icon_path: '/icons/instagram.svg', display_order: 3 },
  { platform: 'LinkedIn', url: 'https://linkedin.com', icon_path: '/icons/linkedin.svg', display_order: 4 },
];

async function main() {
  for (const link of defaultLinks) {
    await prisma.socialMediaLink.create({ data: link });
  }
}

main();
```

---

## Summary

**New Database Tables**: 3 (Users, SocialMediaLink, SliderContent)  
**Modified Database Tables**: 0  
**Client-Side Data Structures**: 2 (Translation dictionaries, Language context state)  
**Migration Complexity**: Low (three new tables, no foreign keys, no schema changes to existing tables)  
**Data Validation**: Medium-High (URL validation, path validation, soft-delete logic, role validation, Clerk ID uniqueness, media type validation, bilingual field support)
**Migration Complexity**: Low (single new table, no foreign keys)  
**Data Validation**: Medium (URL validation, path validation, soft-delete logic)
