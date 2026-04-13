# Implementation Plan: FAQ and Magazine Home Page Sections

**Branch**: `006-faq-magazine-sections` | **Date**: April 13, 2026 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/006-faq-magazine-sections/spec.md`

## Summary

Add two new content sections to the home page: **FAQ accordion** (Frequently Asked Questions) and **Magazine cards** (downloadable publications). Admin users can manage both FAQ and Magazine content through dedicated CRUD interfaces with pagination. FAQ section displays up to 10 questions in an accordion format with single-open behavior, prioritizing favorites first. Magazine section displays up to 8 magazine cards with cover images, titles, descriptions, published dates, and PDF download links, ordered by most recent published date. Both sections support bilingual content (English/Arabic) and include "View All" links when content exceeds display limits. Images support both Vercel Blob and local DB storage based on existing configuration patterns.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16 (App Router)  
**Primary Dependencies**: Next.js, React 18+, Prisma (ORM), Clerk (auth), Tailwind CSS, Vercel Blob  
**Storage**: PostgreSQL on Neon (serverless), Vercel Blob for media files (fallback: local DB)  
**Testing**: Vitest (infrastructure ready, tests pending)  
**Target Platform**: Web application (SSR + API routes), deployed on Vercel  
**Project Type**: Full-stack web application with admin CMS and public-facing pages  
**Performance Goals**: <2s page load (home page sections), <100ms accordion interactions, support 10MB image uploads  
**Constraints**: Vercel 4.5MB request body limit (Hobby/Pro), ephemeral filesystem (requires Blob storage), bilingual RTL/LTR support  
**Scale/Scope**: ~20 initial FAQ entries, unlimited Magazines, expected 1000+ records at scale

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Client & Order Management First
**Status**: N/A - This feature adds FAQ and Magazine sections, not client/order management  
**Compliance**: Feature does not modify client or order functionality

### ✅ Principle II: Clerk Authentication & Security
**Status**: PASS  
**Compliance**: Admin pages require authentication via Clerk, audit trail captures created_by/updated_by  
**Implementation**: Use existing `auth()` pattern from Clerk SDK, check user role (admin only)

### ✅ Principle III: Neon PostgreSQL as Source of Truth
**Status**: PASS  
**Compliance**: Will create Prisma migrations for FAQ and Magazine models  
**Implementation**: Follow existing migration patterns (soft deletes, audit fields, indexes)

### ✅ Principle IV: Full-Featured Pages & Search
**Status**: PASS  
**Compliance**: Both FAQ and Magazine admin sections include:
- ✅ List page with pagination
- ✅ Add page with form validation
- ✅ Edit page for updates
- ✅ Delete capability with soft-delete
- ⚠️ Search: Not required per spec (pagination only)
- ⚠️ Dashboard integration: Will not add metrics to main dashboard (FAQ/Magazine are content sections, not transactional)
- ⚠️ Export: Not required per spec (content management, not data export)

**Justification for deviations**: FAQ and Magazine are cms content sections with limited entries (~20-100), not high-volume transactional data like clients/orders. Search and export are not critical for this use case.

### ✅ Principle V: Order History & Client Relationship
**Status**: N/A - This feature does not involve clients or orders  
**Compliance**: No client/order relationships in this feature

### ✅ Principle VI: API-First Development
**Status**: PASS  
**Compliance**: All CRUD operations through API routes (`/api/faq`, `/api/magazine`)  
**Implementation**: 
- Input validation (Zod schemas or manual validation)
- Soft-delete pattern with `is_deleted` flag
- Pagination support (cursor or offset-based)
- Standard HTTP status codes (200, 201, 400, 401, 403, 404, 500)

### ✅ Principle VII: Dashboard & Analytics
**Status**: PARTIAL  
**Compliance**: FAQ and Magazine counts will NOT be added to main dashboard  
**Justification**: These are cms content sections (editorial control), not operational metrics. Main dashboard focuses on client/order analytics per constitution principles I and V.

### 📋 Post-Design Re-Evaluation
Will re-check after Phase 1 design artifacts are complete to ensure:
- Database schema follows soft-delete and audit trail patterns
- API routes include proper authentication and validation
- All admin pages are accounted for (list, add, edit, delete)

**Post-Design Constitution Re-Check** (Phase 1 Complete):

✅ **Database Schema Compliance**:
- FAQ model: Uses soft-delete (`is_deleted`), audit trail (`created_by`, `updated_by`, timestamps), User FK relations
- Magazine model: Same patterns + storage type pattern matching existing News/SliderContent models
- Both models follow existing bilingual content pattern (`_en` and `_ar` suffixes)
- Indexes optimize common queries (soft-delete + ordering)

✅ **API Routes Compliance**:
- All endpoints require Clerk authentication (`auth()` pattern)
- Admin endpoints check `user.role === 'admin'` from database
- Input validation for all POST/PUT operations (field length, file format, file size)
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Soft-delete pattern for DELETE operations

✅ **Admin Pages Compliance**:
- FAQ: List (paginated), Add, Edit, Delete (all accounted for)
- Magazine: List (paginated), Add (with file uploads), Edit, Delete (all accounted for)
- Both admin sections follow existing project structure (`/app/admin/{feature}/`)

✅ **Alignment with Constitution**:
- Principle I (Client & Order Management First): N/A - No client/order modifications
- Principle II (Clerk Auth & Security): ✅ All API routes authenticated, audit trail captured
- Principle III (Neon PostgreSQL): ✅ Prisma migrations, zero-downtime compatible
- Principle IV (Full-Featured Pages): ✅ List/Add/Edit/Delete pages for both features (search/export omitted per justification)
- Principle V (Order History): N/A - No client/order relationships
- Principle VI (API-First Development): ✅ All CRUD through API routes with validation
- Principle VII (Dashboard & Analytics): Partial - FAQ/Magazine counts not added to dashboard (content sections, not operational metrics)

**Verdict**: ✅ **PASS** - All constitution gates satisfied. Feature design aligns with project governance.

## Project Structure

### Documentation (this feature)

```text
specs/006-faq-magazine-sections/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-endpoints.md # API contract documentation
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── page.tsx                              # Home page (add FAQ and Magazine sections)
├── faq/                                  # FAQ dedicated page (View All)
│   └── page.tsx                          # FAQ list with pagination
├── magazines/                            # Magazine dedicated page (View All)
│   └── page.tsx                          # Magazine list with pagination
├── admin/
│   ├── faq/
│   │   ├── page.tsx                      # FAQ admin list with pagination
│   │   ├── add/
│   │   │   └── page.tsx                  # Add new FAQ
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx              # Edit FAQ
│   └── magazines/
│       ├── page.tsx                      # Magazine admin list with pagination
│       ├── add/
│       │   └── page.tsx                  # Add new Magazine
│       └── [id]/
│           └── edit/
│               └── page.tsx              # Edit Magazine
├── api/
│   ├── faq/
│   │   ├── route.ts                      # GET (list), POST (create)
│   │   └── [id]/
│   │       └── route.ts                  # GET (single), PUT (update), DELETE (soft-delete)
│   └── magazines/
│       ├── route.ts                      # GET (list), POST (create with image upload)
│       └── [id]/
│           └── route.ts                  # GET (single), PUT (update), DELETE (soft-delete)

lib/
├── components/
│   ├── home/
│   │   ├── FAQSection.tsx                # Home page FAQ accordion component
│   │   └── MagazineSection.tsx           # Home page Magazine cards component
│   ├── faq/
│   │   ├── FAQList.tsx                   # FAQ list component (admin + public)
│   │   ├── FAQForm.tsx                   # FAQ add/edit form
│   │   └── FAQAccordionItem.tsx          # Single accordion item component
│   └── magazines/
│       ├── MagazineList.tsx              # Magazine list component (admin + public)
│       ├── MagazineForm.tsx              # Magazine add/edit form
│       └── MagazineCard.tsx              # Single magazine card component
└── types.ts                              # Add FAQ and Magazine TypeScript types

prisma/
├── schema.prisma                         # Add FAQ and Magazine models
└── migrations/
    └── [timestamp]_add_faq_magazines/    # Migration file
        └── migration.sql

```

**Structure Decision**: This project uses Next.js 16 App Router with collocated API routes and page components. The structure follows existing patterns:
- Public pages in `/app` root (home + dedicated FAQ/Magazine pages)
- Admin pages in `/app/admin`
- API routes in `/app/api`
- Reusable components in `/lib/components` organized by feature
- Database models in Prisma schema with generated client in `/lib/generated/prisma`

## Complexity Tracking

> **No constitution violations requiring justification**

This feature aligns with all constitution principles. Deviations from Principle IV (search/export/dashboard) are justified by the content management nature of FAQ/Magazine sections (low volume, editorial content vs. transactional data).
