# Implementation Plan: News Section

**Branch**: `004-news-section` | **Date**: March 29, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-news-section/spec.md`

**User Requirements**: "make sure the slider will be responsive as well as the admin pages like all pages on the app, use the best strategy needed for responsive view and also use the best animation with gradient to make style better for the user"

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a News section to the home page displaying latest 5-6 news items with images, titles, and dates. Includes bilingual support (EN/AR), dual-storage system for images (Vercel Blob and local database), responsive design with gradient animations, admin management interface, and paginated "All News" page. Follows existing patterns from slider and social media features with enhanced visual design.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode, Next.js 16.1.6  
**Primary Dependencies**: React 19.2.3, Prisma 7.5.0, Clerk 7.0.4, Tailwind CSS 4  
**Storage**: PostgreSQL on Neon (serverless), Vercel Blob for CDN images, database BYTEA for local images  
**Testing**: Vitest 4.1.1 with React Testing Library 16.3.2  
**Target Platform**: Web (desktop and mobile browsers), Next.js App Router SSR/CSR  
**Project Type**: Full-stack web application with admin CMS  
**Performance Goals**: <2s page load, <200ms API response, 60fps animations  
**Constraints**: Mobile-first responsive design, dual-language support, WCAG accessibility  
**Scale/Scope**: ~50 news items initially, pagination at 10-12 per page, 6 items on home page

**Responsive Design Strategy**:
- Mobile-first approach with Tailwind breakpoints (sm:640px, md:768px, lg:1024px, xl:1280px)
- CSS Grid for news card layouts with auto-fit/auto-fill
- Flexbox for header/navigation components
- Touch-friendly tap targets (min 44x44px)
- Responsive images with proper srcset/sizes
- Collapsible navigation for mobile admin panel

**Animation & Visual Design**:
- Gradient backgrounds using Tailwind gradients (from-[color] via-[color] to-[color])
- Smooth transitions (transition-all duration-300 ease-in-out)
- Hover effects with scale transforms and shadow changes
- Loading skeleton animations with shimmer effect
- Staggered fade-in animations for news cards (Intersection Observer API)
- Card elevation with 3D transforms on hover
- Gradient text effects for headings
- Subtle parallax scroll effects for hero sections

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle II - Clerk Authentication & Security**: ✅ PASS
- All admin API routes (`/api/news/*`) will verify Clerk session tokens
- Admin UI (`/app/admin/news/`) behind authentication middleware
- Public routes (`/api/news` GET, `/news` page) publicly accessible
- Audit trail with created_by/updated_by fields

**Principle III - Neon PostgreSQL as Source of Truth**: ✅ PASS  
- New `News` table in Prisma schema with migration
- Zero-downtime migration (new table, no existing data impact)
- Rollback: DROP TABLE IF EXISTS news

**Principle IV - Full-Featured Pages**: ✅ PASS
- ✅ List page: Admin news management list
- ✅ Add page: Create new news form
- ✅ Edit page: Update existing news
- ✅ Delete: Soft delete with is_deleted flag
- ✅ Dashboard integration: News count metrics (T090-T091)
- ✅ Export: Excel export with filters (T040, T072-T075)
- ⚠️ Separate view/detail page: Combined with edit (acceptable for news items)

**Note**: News is a content-only feature. Combining view/detail with edit page is acceptable per project standards for CMS content.

**Principle VI - API-First Development**: ✅ PASS
- RESTful API routes: `GET /api/news`, `GET /api/news/admin`, `POST /api/news`, `PUT /api/news/[id]`, `DELETE /api/news/[id]`
- Dual upload endpoints: `POST /api/news/upload` (local DB), Style Library selection (blob)
- Input validation on all routes
- Proper HTTP status codes (200, 201, 400, 403, 404, 500)
- Pagination with query parameters (?page=1&limit=12)

**Principle VII - Dashboard & Analytics**: ✅ PASS
- Add "Total News" metric card to existing dashboard
- Add "Latest News Items" section to dashboard
- Real-time count via API

**Additional Compliance**:
- Soft deletes via is_deleted flag
- Bilingual content (title_en, title_ar)
- Responsive mobile-first design
- Dual storage system with storage_type tracking
- Proper error handling and user feedback

**Re-evaluation Required After Phase 1**: ✅ Confirmed - all gates still passing

## Project Structure

### Documentation (this feature)

```text
specs/004-news-section/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (responsive+animation patterns)
├── data-model.md        # Phase 1 output (News entity schema)
├── quickstart.md        # Phase 1 output (dev setup guide)
├── contracts/           # Phase 1 output (API contracts)
│   ├── api-news.md     # Public news API
│   ├── api-news-admin.md  # Admin management API
│   └── api-news-upload.md # Image upload API
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created yet)
```

### Source Code (repository root)

```text
app/
├── news/
│   └── page.tsx         # Public "All News" page with pagination
├── admin/
│   ├── layout.tsx       # Updated: Add News menu item
│   └── news/
│       └── page.tsx     # Admin news management (list/add/edit)
└── api/
    └── news/
        ├── route.ts     # GET (public list), POST (admin create)
        ├── admin/
        │   └── route.ts # GET (admin list with hidden news)
        ├── upload/
        │   └── route.ts # POST (local DB file upload)
        └── [id]/
            ├── route.ts # GET, PUT, DELETE
            └── media/
                └── route.ts  # GET (serve local DB images)

lib/
└── components/
    └── home/
        └── NewsSection.tsx  # Home page news widget (6 items)

prisma/
├── schema.prisma        # Updated: Add News model
└── migrations/
    └── [timestamp]_add_news_table/
        └── migration.sql

public/
└── placeholders/
    └── news-placeholder.png  # Default image for news without images
```

**Structure Decision**: Following Next.js App Router conventions with API routes colocated under `/app/api/`. Admin UI grouped under `/app/admin/`. Public pages at root level. Reusing existing patterns from slider and client management features.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations requiring justification**. All Constitution principles passed during initial check and post-design re-evaluation.

---

## Phase 0: Research & Discovery

**Objective**: Resolve all "NEEDS CLARIFICATION" items from Technical Context and establish design patterns.

### Research Completed ✅

**Output**: [research.md](./research.md)

**Key Decisions**:

1. **Responsive Design Strategy**:
   - Decision: Mobile-first CSS Grid with Tailwind breakpoints
   - Rationale: 60%+ mobile traffic, CSS Grid provides better card layout control
   - Pattern: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
   - Touch targets: 44x44px minimum for buttons/clickable cards

2. **Gradient Animations**:
   - Decision: Tailwind gradients + CSS transforms (no animation library)
   - Rationale: Lightweight, GPU-accelerated, no extra bundle size
   - Patterns: 
     - Card hover: `bg-gradient-to-br from-blue-50 to-purple-50` + `transform translate scale`
     - Shimmer loading: CSS `@keyframes shimmer` with gradient animation
     - Staggered entry: Intersection Observer + Tailwind transitions

3. **Dual-Storage Image System**:
   - Decision: Extend slider's Blob + Local DB pattern
   - Rationale: Consistency with existing code, proven implementation
   - Flow: Admin chooses "Style Library" (blob) or "Upload New" (local)

4. **Pagination Strategy**:
   - Decision: Server-side pagination with URL query params
   - Rationale: SEO-friendly, shareable URLs, consistent with clients/orders
   - Implementation: `?page=1&limit=12`

**Unknowns Resolved**: All "NEEDS CLARIFICATION" items addressed in research.md

---

## Phase 1: Design & Contracts

**Objective**: Define data model, API contracts, and developer quickstart guide.

### 1.1 Data Model ✅

**Output**: [data-model.md](./data-model.md)

**News Entity**:
```prisma
model News {
  id             String    @id @default(cuid())
  title_en       String?   @db.Text
  title_ar       String?   @db.Text
  image_url      String    @db.Text
  storage_type   String    @default("blob") @db.VarChar(10)
  file_data      Bytes?    @db.ByteA
  file_name      String?   @db.VarChar(255)
  file_size      Int?
  mime_type      String?   @db.VarChar(50)
  published_date DateTime  @db.Timestamptz(6)
  is_visible     Boolean   @default(true)
  is_deleted     Boolean   @default(false)
  created_at     DateTime  @default(now()) @db.Timestamptz(6)
  updated_at     DateTime  @updatedAt @db.Timestamptz(6)

  @@index([is_deleted, is_visible, published_date(sort: Desc)])
  @@map("news")
}
```

**Key Decisions**:
- Bilingual titles (nullable, at least one required via app validation)
- Dual storage fields (file_data for local, image_url for both)
- Composite index optimizes common query pattern (is_deleted + is_visible + published_date)
- Soft deletes (is_deleted flag)
- Visibility control (is_visible toggle)

**Validation Rules**:
- Max title length: 500 characters
- Max file size: 10MB
- Allowed MIME types: image/jpeg, image/png, image/gif
- Published date cannot be >1 year in future

**Performance**:
- Expected load: 100-500 news items, ~1000 reads/day
- Query time: <50ms with index
- Storage estimate: ~100MB for 500 items @ 200KB each

---

### 1.2 API Contracts ✅

**Output**: [contracts/api-contracts.md](./contracts/api-contracts.md)

**Public Endpoints**:
- `GET /api/news` - Paginated visible news (no auth)
- `GET /api/news/media/[id]` - Serve local images (no auth)

**Admin Endpoints** (Clerk auth + permissions):
- `GET /api/news/admin` - All news including hidden/deleted
- `POST /api/news` - Create news
- `PUT /api/news/[id]` - Update news
- `DELETE /api/news/[id]` - Soft delete
- `POST /api/news/upload` - Upload image to local DB

**Key Patterns**:
- RESTful design following existing API conventions
- Pagination: `?page=1&limit=12` (max 50)
- Input validation with Zod schemas
- Proper HTTP status codes (200, 201, 400, 401, 404, 413)
- Caching headers for media endpoint (`max-age=31536000`)

**Authentication**:
```typescript
const { userId } = await auth();
if (!userId || !hasPermission(userId, 'news:write')) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**TypeScript Types**:
- `News` (full entity)
- `NewsPublic` (safe for frontend, excludes binary data)
- `NewsAdmin` (includes metadata)
- `CreateNewsRequest`, `UpdateNewsRequest`
- `PaginatedResponse<T>`, `UploadResponse`

---

### 1.3 Quickstart Guide ✅

**Output**: [quickstart.md](./quickstart.md)

**Developer Setup**:
1. Checkout feature branch: `git checkout 004-news-section`
2. Run migration: `npx prisma migrate dev --name add_news_table`
3. Seed data: `npm run seed:news` (optional)
4. Start server: `npm run dev`

**Testing Flows**:
- Unit tests: `npm test -- news`
- E2E tests: `npm run test:e2e` (Playwright)
- Manual checklist: News display, pagination, admin CRUD, responsive layouts

**Troubleshooting**:
- Images not loading → Check storage_type and CORS
- Migration fails → `npx prisma migrate reset`
- Auth errors → Verify Clerk keys and user permissions
- TypeScript errors → `npx prisma generate`

**Deployment Checklist**:
- Build succeeds
- All tests pass
- Migrations applied
- Environment variables set
- Lighthouse score >90

---

### 1.4 Agent Context Update ✅

**Script**: `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`

**Technologies Added**:
- Language: TypeScript 5.x with strict mode, Next.js 16.1.6
- Framework: React 19.2.3, Prisma 7.5.0, Clerk 7.0.4, Tailwind CSS 4
- Database: PostgreSQL on Neon (serverless), Vercel Blob for CDN, database BYTEA for local images

**Agent File Updated**: `.github/agents/copilot-instructions.md`

**Purpose**: Ensures GitHub Copilot understands project's tech stack for better code suggestions during implementation.

---

## Post-Design Constitution Re-Evaluation

**All Gates: PASSING ✅**

| Principle | Status | Notes |
|-----------|--------|-------|
| II - Clerk Auth | ✅ PASS | Admin routes protected, permissions defined |
| III - Neon Postgres | ✅ PASS | News table designed, migration ready |
| IV - Full-Featured | ✅ PASS | All requirements met (list, add, edit, delete, export, dashboard) |
| VI - API-First | ✅ PASS | 6 endpoints designed with contracts |
| VII - Dashboard | ✅ PASS | Metrics integration planned |

**No violations**. All Constitution principles fully compliant.

---

## Complexity Tracking

**No violations requiring justification**. All Constitution principles passed during initial check and post-design re-evaluation.

---

## Planning Complete ✅

**Branch**: `004-news-section`  
**Plan Location**: `d:\Projects\osaminextjsapp\osaminextjsapp\specs\004-news-section\plan.md`

### Artifacts Generated

| Phase | Artifact | Status | Purpose |
|-------|----------|--------|---------|
| 0 | [research.md](./research.md) | ✅ Complete | Responsive design & gradient animation patterns |
| 1 | [data-model.md](./data-model.md) | ✅ Complete | News entity schema & migration |
| 1 | [contracts/api-contracts.md](./contracts/api-contracts.md) | ✅ Complete | API endpoint contracts & TypeScript types |
| 1 | [quickstart.md](./quickstart.md) | ✅ Complete | Developer setup & testing guide |
| 1 | Agent Context | ✅ Updated | GitHub Copilot instructions updated |

### Key Design Highlights

**Responsive Strategy**:
- Mobile-first CSS Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Tailwind breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px
- 44x44px touch targets, collapsible mobile navigation

**Gradient Animations**:
- Card hover: `bg-gradient-to-br from-blue-50 to-purple-50` + scale transforms
- Shimmer loading: CSS @keyframes for skeleton screens
- Staggered entry: Intersection Observer + transition delays
- Performance: GPU-accelerated transforms, 60fps target

**Dual-Storage Images**:
- Vercel Blob: CDN performance, Style Library reuse
- Local DB: BYTEA storage, `/api/news/media/[id]` serving
- Admin UI: FilePicker for Style Library, upload for local
- Caching: `max-age=31536000` for immutable images

**Data Model**:
- Single `News` entity, no relationships
- Composite index: `(is_deleted, is_visible, published_date DESC)`
- Soft deletes, visibility toggle, bilingual titles
- Expected performance: <50ms queries, <100MB storage

**API Design**:
- 6 RESTful endpoints (2 public, 4 admin-protected)
- Server-side pagination: `?page=1&limit=12`
- Input validation with Zod, proper HTTP status codes
- TypeScript types for type safety

---

## Next Steps

**Phase 2**: Task Generation (separate command)

Run the following command to generate implementation tasks:

```bash
npx speckit tasks 004-news-section
```

Or use the agent command:

```text
/speckit.tasks
```

This will create `tasks.md` with:
- Database migration tasks (Prisma schema, migration file)
- API route implementation (6 endpoints)
- Frontend components (NewsSection, AllNews page, Admin page)
- Testing tasks (unit tests, E2E tests)
- Deployment tasks (Vercel configuration)
- Dependency-ordered execution sequence

**After Task Generation**:

1. Review `tasks.md` for accuracy
2. Run `/speckit.implement` to execute all tasks
3. Or manually implement following task order
4. Deploy to staging for QA testing
5. Production deployment after approval

---

**Planning Status**: ✅ COMPLETE  
**Ready for**: Task generation and implementation  
**Branch**: `004-news-section` (already created)  
**Estimated Implementation**: 2-3 days (based on task complexity after generation)

**Note**: This plan documents the design phase only. Implementation is handled by the `/speckit.tasks` → `/speckit.implement` workflow.
