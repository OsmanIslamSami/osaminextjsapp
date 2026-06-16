---
name: project-structure
description: >
  Complete architectural reference for the OSAMI Next.js 16 application — a bilingual (English/Arabic) content management
  and client management platform. Covers project layout, database schema (18 Prisma models on Neon Postgres), 60+ API routes,
  70+ React components, Clerk authentication with custom DB authorization, Vercel Blob file storage, theme system (5 themes
  with light/dark variants), i18n with RTL support, Framer Motion animations, and all coding conventions.
  Use for any question about where code lives, how features connect, what patterns to follow, or how to add new features.
applyTo: "**"
---

# OSAMI — Project Structure & Architecture Skill

> **Stack**: Next.js 16.1.6 · React 19 · TypeScript 5 · Tailwind CSS 4 · Prisma 7 · Neon Postgres · Clerk Auth · Vercel Blob · Framer Motion 12

---

## 1. Top-Level Directory Map

```
osaminextjsapp/
├── app/                     # Next.js App Router (pages + API routes)
│   ├── layout.tsx           # Root layout — providers, fonts, metadata
│   ├── page.tsx             # Public home page
│   ├── header.tsx           # Site header component
│   ├── globals.css          # Global styles + Tailwind directives
│   ├── opengraph-image.tsx  # File-based OG image generation
│   ├── sitemap.ts           # Dynamic sitemap generator
│   ├── admin/               # Admin dashboard (13 tabs, protected)
│   ├── api/                 # RESTful API routes (60+ endpoints)
│   ├── clients/             # Client CRUD pages
│   ├── dashboard/           # Analytics dashboard
│   ├── faq/                 # Public FAQ page
│   ├── login/               # Auth page
│   ├── magazines/           # Public magazines listing
│   ├── news/                # News listing + detail [id]
│   ├── partners/            # Partners listing
│   ├── photos/              # Photo gallery
│   └── videos/              # Video gallery
│
├── lib/                     # Shared application code
│   ├── db.ts                # Database connection (Prisma + Neon adapter + pg Pool)
│   ├── types.ts             # Central TypeScript type definitions
│   ├── auth/                # Server-side auth utilities
│   ├── components/          # React components (feature-based folders)
│   ├── contexts/            # React context providers
│   ├── generated/           # Prisma generated client
│   ├── hooks/               # Custom React hooks
│   ├── i18n/                # Internationalization (translations + context)
│   ├── themes/              # Theme configuration (5 themes × 2 modes)
│   └── utils/               # Utility functions
│
├── prisma/
│   ├── schema.prisma        # Database schema (18 models, 2 enums)
│   └── migrations/          # Prisma migration history
│
├── scripts/                 # 18 seed & utility scripts
├── public/                  # Static assets (fonts, icons, placeholders)
├── docs/                    # Project documentation (20+ markdown files)
├── specs/                   # Feature specifications (SpecKit workflow)
├── __tests__/               # Test directory
│
├── next.config.ts           # Next.js config (images, CORS headers)
├── tsconfig.json            # TypeScript config (strict, path alias @/*)
├── eslint.config.mjs        # ESLint 9 flat config
├── vitest.config.ts         # Vitest test runner config
├── package.json             # Dependencies & scripts
└── prisma.config.ts         # Prisma configuration
```

---

## 2. Provider Architecture (Root Layout)

The root `app/layout.tsx` wraps the entire app in this provider hierarchy:

```
<ClerkProvider>
  <LanguageProvider>           ← i18n context (en/ar, RTL)
    <AppSettingsProvider>      ← Global settings (theme, fonts, logos)
      <ToastProvider>          ← Notification system
        <ThemeApplier />       ← CSS custom properties injection
        <FontApplier />       ← Dynamic font loading
        <UserSyncHandler />   ← Clerk → DB user sync on sign-in
        <Header />
        <main>{children}</main>
        <Footer />
        <ScrollToTop />
        <ScrollDown />
      </ToastProvider>
    </AppSettingsProvider>
  </LanguageProvider>
</ClerkProvider>
```

**Key takeaway**: Every page has access to `useLanguage()`, `useAppSettings()`, `useToast()`, and `useCurrentUser()` without additional wrapping.

---

## 3. Authentication & Authorization

### Authentication Layer — Clerk

| Concern            | Solution                                   |
| ------------------- | ------------------------------------------ |
| Sign-in/up UI       | Clerk's hosted components                  |
| Session management  | `@clerk/nextjs` (v7) — automatic cookies   |
| Server-side auth    | `auth()` from `@clerk/nextjs/server`       |
| Client-side auth    | `useAuth()` from `@clerk/nextjs`           |
| User sync to DB     | `UserSyncHandler` → `POST /api/users/sync` |

### Authorization Layer — Custom DB

```
lib/auth/
├── permissions.ts   # getCurrentUser(), canDeleteClients(), hasPermission()
└── sync.ts          # ensureUserSynced() — Clerk → User table sync
```

**API Route Pattern (server-side):**
```typescript
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

const { userId } = await auth();
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

const user = await prisma.user.findUnique({ where: { clerk_user_id: userId } });
if (user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
```

**Component Pattern (client-side):**
```typescript
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

const { user, isAdmin, isLoading } = useCurrentUser();
```

---

## 4. Database Schema (Prisma + Neon Postgres)

### Connection Setup (`lib/db.ts`)
- **Prisma Client** with `PrismaNeon` adapter for serverless-compatible queries
- **pg Pool** for raw SQL when needed
- Path alias: `@/lib/generated/prisma/client`

### Models (18 total)

| Model               | Purpose                          | Key Fields                                                    |
| -------------------- | -------------------------------- | ------------------------------------------------------------- |
| `User`               | User accounts (synced from Clerk) | clerk_user_id, email, name, role, is_active                   |
| `clients`            | Client management                | name, email, mobile, status, is_deleted, audit fields         |
| `orders`             | Order tracking                   | client_id (FK), order_date, status (enum), description        |
| `News`               | News articles                    | title_en/ar, description_en/ar, image_url, storage_type       |
| `photos`             | Photo gallery                    | title_en/ar, image_url, is_featured, display_order            |
| `videos`             | Video gallery                    | title_en/ar, youtube_url, video_id, thumbnail_url             |
| `partners`           | Partner logos                    | title_en/ar, url, image_url, is_featured                      |
| `FAQ`                | FAQ entries                      | question_en/ar, answer_en/ar, is_favorite, display_order      |
| `Magazine`           | Magazine publications            | title_en/ar, download_link, published_date                    |
| `SliderContent`      | Hero slider slides               | media_url, media_type, title_en/ar, button config             |
| `SocialMediaLink`    | Social media links               | platform, url, icon_path, display_order                       |
| `home_sections`      | Home page section visibility     | section_type, is_visible, display_order, title_en/ar          |
| `app_settings`       | Global app configuration         | fonts, theme, colors, site metadata, SEO, verification URLs   |
| `navigation`         | Header/footer navigation         | label_en/ar, url, location, type, parent_id (self-ref)        |
| `StyleLibraryFolder` | Media library folders            | name, parent_id (self-ref), path (hierarchy)                  |
| `StyleLibraryFile`   | Media library files              | folder_id (FK), file_url, file_type, tags[], dimensions       |

### Enums
- `OrderStatus`: pending | completed | cancelled
- `ClientStatus`: Active | Inactive

### Cross-Cutting Patterns

| Pattern           | Fields                                       | Applied To               |
| ----------------- | -------------------------------------------- | ------------------------ |
| **Soft delete**   | `is_deleted`, `deleted_by`, `deleted_at`      | clients, News, photos, videos, partners, FAQ, Magazine, etc. |
| **Audit trail**   | `created_by`, `updated_by`, `created_at`, `updated_at` | All models              |
| **Bilingual**     | `*_en`, `*_ar` suffix pairs                  | All content models       |
| **Visibility**    | `is_visible`, `display_order`                | Slider, photos, videos, partners, FAQ, Magazine |
| **File storage**  | `storage_type`, `file_data`, `file_name`, `file_size`, `mime_type` | Slider, News, photos, partners, Magazine |

---

## 5. API Routes (60+ endpoints)

### Route Organization

All routes live under `app/api/` and follow RESTful conventions:

```
app/api/
├── app-settings/          GET, PUT
├── clients/
│   ├── route.ts           GET (paginated), POST
│   ├── export/route.ts    POST (Excel export)
│   └── [id]/route.ts      GET, PUT, DELETE (soft)
├── faq/
│   ├── route.ts           GET, POST
│   └── [id]/
│       ├── route.ts       GET, PUT, DELETE
│       ├── favorite/      PATCH (toggle)
│       └── visible/       PATCH (toggle)
├── header-navigation/     GET, POST, [id]/ GET PUT DELETE
├── health/                GET (health check)
├── home-sections/         GET, PUT, reorder/ POST, [section_type]/ PATCH
├── magazines/             GET, POST, [id]/ GET PUT DELETE, [id]/visible/ PATCH
├── metrics/               GET (dashboard stats)
├── navigation/            GET, admin/ GET POST, [id]/ GET PUT DELETE
├── news/
│   ├── route.ts           GET (paginated), POST
│   ├── admin/route.ts     GET (admin list)
│   ├── upload/route.ts    POST (file upload)
│   └── [id]/
│       ├── route.ts       GET, PUT, DELETE
│       └── media/route.ts GET (media serving)
├── og/                    GET (OpenGraph image)
├── orders/                GET
├── partners/              GET, POST, [id]/ GET PUT DELETE
├── photos/                GET, POST, [id]/ GET PUT DELETE
├── slider/
│   ├── route.ts           GET, POST
│   ├── admin/route.ts     GET
│   ├── reorder/route.ts   POST
│   ├── upload/route.ts    POST
│   └── [id]/route.ts      GET, PUT, DELETE
├── social-media/          GET, POST, [id]/ GET PUT DELETE
├── style-library/
│   ├── route.ts           GET
│   ├── diagnostics/       GET
│   ├── files/             GET, POST, [id]/ GET PUT DELETE
│   └── folders/           GET, POST, [id]/ GET PUT DELETE
├── upload-icon/           POST
├── users/
│   ├── route.ts           GET (list)
│   ├── me/route.ts        GET (current user)
│   ├── sync/route.ts      POST (Clerk sync)
│   └── [id]/
│       ├── route.ts       GET, PUT
│       ├── activate/      POST
│       ├── deactivate/    POST
│       └── role/          PATCH
└── videos/                GET, POST, [id]/ GET PUT DELETE
```

### API Response Conventions

```typescript
// Success
return NextResponse.json({ data: result });

// Paginated (cursor-based with hasMore)
return NextResponse.json({ data: items, hasMore: boolean, nextCursor?: string });

// Error
return NextResponse.json({ error: 'Message' }, { status: 400 | 401 | 403 | 404 | 500 });
```

---

## 6. Component Architecture

### Directory Structure

```
lib/components/
├── admin/                    # Admin panel components
│   ├── AdminDateRangeFilter.tsx
│   ├── AdminSearchBar.tsx
│   ├── ExportButton.tsx
│   ├── NavigationManager.tsx
│   ├── NewsForm.tsx / NewsTable.tsx
│   ├── PartnerForm.tsx / PhotoForm.tsx / VideoForm.tsx
│   └── StorageTypeBadge.tsx
│
├── clients/                  # Client management
│   ├── ClientCard.tsx / ClientGrid.tsx
│   ├── ClientSearchBar.tsx
│   ├── ClientTable.tsx / ClientTableRow.tsx
│   └── StatusBadge.tsx
│
├── dashboard/                # Dashboard widgets
│   ├── DonutChart.tsx / MetricCard.tsx
│   ├── LatestClients.tsx / LatestNews.tsx
│   └── RecentActivity.tsx
│
├── faq/                      # FAQ components
│   ├── FAQAccordionItem.tsx  # Animated accordion (Framer Motion)
│   ├── FAQForm.tsx / FAQList.tsx
│
├── home/                     # Home page sections
│   ├── HeroSlider.tsx        # Hero carousel
│   ├── NewsSection.tsx / NewsCard.tsx / NewsGridClient.tsx
│   ├── PhotosSection.tsx / VideosSection.tsx
│   ├── PartnersSection.tsx
│   ├── FAQSection.tsx / FAQSectionError.tsx
│   ├── MagazineSection.tsx / MagazineSectionError.tsx
│   ├── QuickLinksSection.tsx / StatsSection.tsx
│
├── magazines/                # Magazine components
│   ├── MagazineCard.tsx / MagazineForm.tsx
│   ├── MagazineList.tsx / MagazineRowItem.tsx
│
├── media/                    # Media popup viewers
│   ├── MediaPopup.tsx / PhotoPopup.tsx / VideoPopup.tsx
│
├── news/                     # News utilities
│   ├── DateRangeFilter.tsx / SearchBar.tsx
│   └── PaginationControls.tsx
│
├── ui/                       # UI primitives
│   ├── LoadingSpinner.tsx    # ⚠️ ALWAYS use for loading states
│   ├── Skeleton.tsx          # Skeleton loading placeholders
│   ├── QuickLinkCard.tsx / Slider.tsx
│
└── (root-level shared)       # Cross-feature components
    ├── ConfirmDialog.tsx     # ⚠️ Use instead of window.confirm()
    ├── ToastContainer.tsx    # ⚠️ Use instead of window.alert()
    ├── Toast.tsx
    ├── DeleteButton.tsx / ExportButton.tsx
    ├── ErrorBoundary.tsx
    ├── FilePicker.tsx        # File upload component
    ├── Footer.tsx / PublicNavigation.tsx / MobileMenu.tsx
    ├── FontApplier.tsx / ThemeApplier.tsx
    ├── LanguageSwitcher.tsx / LanguageAwareHTML.tsx
    ├── ScrollDown.tsx / ScrollToTop.tsx
    ├── SortableColumnHeader.tsx
    └── UserSyncHandler.tsx   # Clerk → DB user sync
```

### Component Conventions

1. **`'use client'`** directive required for any component using hooks, state, or browser APIs
2. **Feature-based folders** — group by domain, not by component type
3. **Loading**: Always use `<LoadingSpinner />` from `@/lib/components/ui/LoadingSpinner`
4. **Notifications**: Always use `useToast()` from `@/lib/components/ToastContainer`
5. **Confirmations**: Always use `<ConfirmDialog />`, never `window.confirm()`
6. **Icons**: Always use `@heroicons/react/24/outline`, never custom SVG paths
7. **Buttons**: Icon-only with `aria-label` + `title` (bilingual)

---

## 7. Hooks & Contexts

### Custom Hooks (`lib/hooks/`)

| Hook               | Purpose                                   | Returns                          |
| ------------------- | ----------------------------------------- | -------------------------------- |
| `useCurrentUser()`  | Fetch current user from DB via API        | `{ user, isAdmin, isLoading }`   |
| `useRTLDirection()` | Detect RTL direction from language context | `'ltr' \| 'rtl'`                |

### Context Providers (`lib/contexts/`)

| Context                 | Source File                           | Provides                                    |
| ----------------------- | ------------------------------------- | -------------------------------------------- |
| `LanguageProvider`      | `lib/i18n/LanguageContext.tsx`         | `language`, `setLanguage`, `t()`, `direction` |
| `AppSettingsProvider`   | `lib/contexts/AppSettingsContext.tsx`  | `settings`, `loading`, `refreshSettings()`   |
| `ToastProvider`         | `lib/components/ToastContainer.tsx`    | `showSuccess()`, `showError()`, `showInfo()`  |

### Translation System

```typescript
import { useTranslation } from '@/lib/i18n/useTranslation';

const { t, direction, language } = useTranslation();

// Usage
<div dir={direction}>
  <h1>{t('common.welcome')}</h1>
  <p>{t('greeting', { name: 'Ahmed' })}</p>  {/* Parameter substitution */}
</div>
```

Translation files: `lib/i18n/translations/en.json` and `lib/i18n/translations/ar.json` (dot-notation keys).

---

## 8. Utility Modules

```
lib/utils/
├── apiCache.ts       # In-memory API response caching
├── bilingual.ts      # Bilingual text helper (pick en/ar based on language)
├── error-handler.ts  # Centralized error handling
├── errorLogger.ts    # Error logging utility
├── excel-export.ts   # ExcelJS-based export to .xlsx
├── fileValidation.ts # File type/size validation for uploads
├── helpers.ts        # General helper functions (+ tests)
├── home-sections.ts  # Home section data fetching utilities
├── logger.ts         # Structured logging (replaces console.log)
├── news-search.ts    # News search query builder
├── themeUtils.ts     # Theme CSS variable computation
└── youtube.ts        # YouTube URL parsing / video ID extraction
```

---

## 9. Theme System

**5 built-in themes** — Default, Modern, Elegant, Minimal, Vibrant — each with light and dark variants.

| File                         | Purpose                                     |
| ----------------------------- | ------------------------------------------- |
| `lib/themes/themeConfig.ts`   | Theme definitions, color palettes, mappings |
| `lib/components/ThemeApplier.tsx` | Injects CSS custom properties at runtime |
| `lib/components/FontApplier.tsx`  | Applies Arabic/English font selections   |
| `lib/utils/themeUtils.ts`     | Theme utility computations                  |

**Usage in components** — Always use CSS custom properties, never hard-coded colors:
```css
color: var(--color-primary);
background-color: var(--color-primary-hover);
```

**Configuration** — Stored in `app_settings` table, managed via `/admin/app-settings`.

---

## 10. File Storage (Vercel Blob)

**Primary storage**: `@vercel/blob` — required for production (local uploads do NOT persist on Vercel).

| Concern           | Details                                          |
| ----------------- | ------------------------------------------------ |
| **Max file size**  | 50 MB (Vercel body limit default: 4.5 MB)        |
| **Storage types**  | `blob` (Vercel Blob) or `local` (dev only)       |
| **Env variable**   | `BLOB_READ_WRITE_TOKEN`                          |
| **Diagnostics**    | `GET /api/style-library/diagnostics`             |
| **Models with files** | SliderContent, News, photos, partners, Magazine, StyleLibraryFile |

**Upload pattern**: All uploads go through dedicated API routes (`/api/news/upload`, `/api/slider/upload`, etc.) that handle blob storage + DB record creation.

---

## 11. Admin Panel

**Route**: `/admin` — Protected layout with admin role check.

### 13 Admin Tabs

| Tab              | Route                     | Manages                           |
| ---------------- | ------------------------- | --------------------------------- |
| Overview         | `/admin`                  | Dashboard metrics                 |
| News             | `/admin/news`             | News articles (CRUD)              |
| Slider           | `/admin/slider`           | Hero slider slides                |
| Photos           | `/admin/photos`           | Photo gallery                     |
| Videos           | `/admin/videos`           | Video gallery                     |
| Partners         | `/admin/partners`         | Partner logos                     |
| FAQ              | `/admin/faq`              | FAQ entries (with add/edit pages) |
| Magazines        | `/admin/magazines`        | Magazine publications             |
| Users            | `/admin/users`            | User management                  |
| Social           | `/admin/social`           | Social media links               |
| Home Sections    | `/admin/home-sections`    | Section visibility & ordering    |
| Style Library    | `/admin/style-library`    | Media library (folders + files)  |
| App Settings     | `/admin/app-settings`     | Theme, fonts, site metadata      |

---

## 12. Public Pages

| Page             | Route              | Data Source                        |
| ---------------- | ------------------- | ---------------------------------- |
| Home             | `/`                 | Aggregates all visible home sections |
| News List        | `/news`             | Paginated news with search/filter  |
| News Detail      | `/news/[id]`        | Single article with OG metadata    |
| Photos           | `/photos`           | Photo gallery grid                 |
| Videos           | `/videos`           | Video gallery grid                 |
| Partners         | `/partners`         | Partner cards grid                 |
| FAQ              | `/faq`              | Accordion FAQ list                 |
| Magazines        | `/magazines`        | Magazine cards grid                |
| Clients          | `/clients`          | Client list (authenticated)       |
| Client Add       | `/clients/add`      | Create client form                 |
| Client Edit      | `/clients/[id]/edit`| Edit client form                   |
| Client View      | `/clients/[id]/view`| Client detail view                 |
| Dashboard        | `/dashboard`        | Analytics charts + metrics         |
| Login            | `/login`            | Clerk authentication               |

---

## 13. Scripts & Seeding

All scripts use `tsx` for TypeScript execution:

```bash
npx tsx scripts/<script-name>.ts
```

| Script                              | Purpose                                    |
| ------------------------------------ | ------------------------------------------ |
| `init-db.js`                         | Initialize database schema                 |
| `seed-admin-user.ts`                 | Create initial admin user                  |
| `seed-news.ts` / `seed-additional-news.ts` | Seed news articles                   |
| `seed-slider.ts`                     | Seed hero slider content                   |
| `seed-social-media.ts`              | Seed social media links                    |
| `seed-header-navigation.ts` / `seed-navigation.ts` | Seed navigation items       |
| `seed-dashboard-data.ts`            | Seed dashboard demo data                   |
| `seed-media-library.ts`             | Seed style library folders/files           |
| `seed-faq-magazines.ts`             | Seed FAQ and magazine entries              |
| `add-faq-magazine-sections.ts`      | Initialize FAQ/Magazine home sections      |
| `add-news-section.ts`               | Add news home section                      |
| `add-slider-stats-quicklinks-sections.ts` | Initialize slider/stats/quicklinks sections |
| `update-app-settings-defaults.ts`   | Reset app settings to defaults             |
| `update-news-descriptions.ts`       | Batch update news descriptions             |
| `update-slider-storage-type.ts`     | Migrate slider storage types               |
| `fix-placeholder-urls.ts`           | Fix placeholder image URLs                 |
| `check-news.ts`                     | Validate news data integrity               |

---

## 14. Testing

| Tool             | Config File        | Command           |
| ---------------- | ------------------- | ----------------- |
| **Vitest**       | `vitest.config.ts`  | `npm test`        |
| **Testing Library** | `vitest.setup.ts` | `npm run test:ui` |

- **Environment**: jsdom
- **Path alias**: `@/*` → `./`
- **Existing tests**: `LoadingSpinner.test.tsx`, `ConfirmDialog.test.tsx`, `PaginationControls.test.tsx`, `useCurrentUser.test.ts`, `helpers.test.ts`

---

## 15. Build & Deploy

```bash
npm install              # Auto-runs prisma generate (postinstall hook)
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # prisma generate + next build
npm run lint             # ESLint check
npm test                 # Run Vitest
npm run seed-admin       # Create admin user
```

### Required Environment Variables

| Variable                              | Purpose                  |
| ------------------------------------- | ------------------------ |
| `DATABASE_URL`                        | Neon Postgres connection |
| `CLERK_SECRET_KEY`                    | Clerk server auth        |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`   | Clerk client auth        |
| `BLOB_READ_WRITE_TOKEN`              | Vercel Blob storage      |

### Image Remote Patterns (next.config.ts)

Allowed image hosts: Vercel Blob (`*.public.blob.vercel-storage.com`), Unsplash, placehold.co, YouTube thumbnails.

---

## 16. How to Add a New Feature

Follow this checklist when adding a new content type (e.g., "Events"):

### Step 1 — Database Model
1. Add model to `prisma/schema.prisma` with bilingual fields (`title_en`/`title_ar`), audit fields, and soft delete
2. Run `npx prisma migrate dev --name add_events`

### Step 2 — Types
1. Add TypeScript interfaces to `lib/types.ts` (Event, CreateEventInput, UpdateEventInput)

### Step 3 — API Routes
1. Create `app/api/events/route.ts` (GET list, POST create)
2. Create `app/api/events/[id]/route.ts` (GET, PUT, DELETE)
3. Add auth checks, soft delete filters, and audit field population

### Step 4 — Admin Page
1. Create `app/admin/events/page.tsx`
2. Add form component in `lib/components/admin/EventForm.tsx`
3. Add tab to admin layout in `app/admin/layout.tsx`

### Step 5 — Public Page
1. Create `app/events/page.tsx`
2. Add components in `lib/components/events/`

### Step 6 — Home Section (optional)
1. Add section component in `lib/components/home/EventsSection.tsx`
2. Add section type to `home_sections` table
3. Register in home page (`app/page.tsx`)

### Step 7 — Navigation
1. Add entries via `/admin/header-navigation`
2. Update translation files (`lib/i18n/translations/en.json` and `ar.json`)

### Step 8 — Seed Script (optional)
1. Create `scripts/seed-events.ts`
2. Add npm script to `package.json`

---

## 17. Key Patterns Quick Reference

### Soft Delete Query
```typescript
const items = await prisma.events.findMany({
  where: { is_deleted: false },  // ⚠️ ALWAYS include
  orderBy: { created_at: 'desc' },
});
```

### Bilingual Content Display
```typescript
const title = language === 'ar' ? item.title_ar : item.title_en;
```

### Pagination (Cursor-based)
```typescript
return NextResponse.json({
  data: items,
  hasMore: items.length === limit,
  nextCursor: items[items.length - 1]?.id,
});
```

### Toast Notifications
```typescript
import { useToast } from '@/lib/components/ToastContainer';
const { showSuccess, showError } = useToast();

showSuccess(language === 'ar' ? 'تم بنجاح' : 'Success');
showError(language === 'ar' ? 'فشل' : 'Failed');
```

### Loading States
```typescript
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';

if (loading) return <LoadingSpinner className="min-h-screen" size="lg" />;
```

### File Upload (Vercel Blob)
```typescript
import { put } from '@vercel/blob';

const blob = await put(filename, file, { access: 'public' });
// Store blob.url in database
```

### RTL-Aware Styling
```typescript
const { direction, language } = useTranslation();

<div dir={direction} className={language === 'ar' ? 'text-right' : 'text-left'}>
```

---

## 18. Common Pitfalls

| Issue                            | Cause                                  | Fix                                        |
| -------------------------------- | -------------------------------------- | ------------------------------------------ |
| Deleted items still appearing     | Missing `is_deleted: false` in query   | Add to ALL Prisma queries                  |
| Uploads vanish on Vercel          | Using local file storage               | Use Vercel Blob (`@vercel/blob`)           |
| Wrong URL in production           | Hard-coded `localhost:3000`            | Use `process.env` for base URL             |
| OG images fail in Teams           | Dynamic API OG route                   | Use file-based `opengraph-image.tsx`       |
| Empty sections on Vercel          | HTTP fetch in server component         | Query DB directly with Prisma              |
| `window is not defined`           | Missing `'use client'` directive       | Add `'use client'` to interactive components |
| Hydration mismatch                | `localStorage` read during SSR         | Guard with `typeof window !== 'undefined'` |
| Missing translations              | Key not in both `en.json` and `ar.json`| Add to BOTH translation files              |
| `alert()` or `confirm()` used     | Not using Toast/ConfirmDialog          | Replace with `useToast()` / `ConfirmDialog`|
| Custom SVG icons                  | Not using Heroicons                    | Import from `@heroicons/react/24/outline`  |

---

## 19. Dependencies Reference

### Production Dependencies
| Package                    | Version  | Purpose                        |
| -------------------------- | -------- | ------------------------------ |
| `next`                     | 16.1.6   | React framework                |
| `react` / `react-dom`     | 19.2.3   | UI library                     |
| `@clerk/nextjs`            | ^7.0.4   | Authentication                 |
| `@prisma/client`           | ^7.7.0   | Database ORM                   |
| `@prisma/adapter-neon`     | ^7.5.0   | Neon Postgres adapter          |
| `@neondatabase/serverless` | ^1.0.2   | Neon serverless driver         |
| `pg`                       | ^8.11.3  | PostgreSQL driver              |
| `@vercel/blob`             | ^2.3.1   | File storage                   |
| `@heroicons/react`         | ^2.2.0   | Icon library                   |
| `framer-motion`            | ^12.38.0 | Animations                     |
| `exceljs`                  | ^4.4.0   | Excel export                   |
| `xlsx`                     | ^0.18.5  | Spreadsheet parsing            |
| `dotenv`                   | ^16.3.1  | Environment variables          |

### Dev Dependencies
| Package                     | Version  | Purpose                       |
| --------------------------- | -------- | ----------------------------- |
| `typescript`                | ^5       | Type checking                 |
| `tailwindcss`               | ^4       | Utility-first CSS             |
| `@tailwindcss/postcss`      | ^4       | PostCSS plugin                |
| `prisma`                    | ^7.7.0   | Schema management & migrations|
| `eslint` / `eslint-config-next` | ^9 / 16.1.6 | Linting               |
| `vitest`                    | ^4.1.1   | Test runner                   |
| `@testing-library/react`    | ^16.3.2  | Component testing             |
| `@testing-library/jest-dom` | ^6.9.1   | DOM assertions                |
| `jsdom`                     | ^29.0.1  | DOM environment for tests     |
| `recharts`                  | ^3.8.0   | Dashboard charts              |
| `tsx`                       | ^4.21.0  | TypeScript script execution   |

---

## 20. Documentation Index

| Document                        | Path                            | Purpose                          |
| ------------------------------- | ------------------------------- | -------------------------------- |
| Project README                  | `README.md`                     | Overview & quick start           |
| Deployment Checklist            | `docs/DEPLOYMENT_CHECKLIST.md`  | Full deployment process          |
| Vercel Deployment               | `docs/VERCEL_DEPLOYMENT.md`     | Vercel-specific setup            |
| Vercel Blob Setup               | `docs/VERCEL_BLOB_SETUP.md`    | Blob storage configuration       |
| Upload Troubleshooting          | `docs/UPLOAD_TROUBLESHOOTING.md`| File upload issues               |
| Theme System                    | `docs/THEME_SYSTEM.md`         | Theme configuration guide        |
| Style Library                   | `docs/STYLE_LIBRARY.md`        | Media library documentation      |
| Client Setup                    | `docs/CLIENTS_SETUP.md`        | Client management setup          |
| Admin User Guide                | `docs/ADMIN_USER_GUIDE.md`     | Admin panel usage                |
| Teams Preview Fix               | `docs/TEAMS_PREVIEW_FIX.md`    | OG image issues in Teams         |
| Vercel Fix Checklist            | `docs/VERCEL_FIX_CHECKLIST.md` | Deployment-specific fixes        |
| Implementation Progress         | `docs/IMPLEMENTATION_PROGRESS.md`| Feature status tracking        |
| Quick Start                     | `docs/QUICKSTART.md`           | Developer onboarding             |
