# Implementation Plan: Mobile Responsive UI with Animations

**Branch**: `003-mobile-responsive-animations` | **Date**: March 26, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-mobile-responsive-animations/spec.md` with additional requirements for bilingual support (Arabic/English), modern icons, and social media footer

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature adds comprehensive mobile-responsive design, smooth animations, bilingual support (Arabic/English), and a social media footer to the existing Next.js client management application. The implementation focuses on:

1. **Mobile Responsiveness**: Redesign header with mobile menu, optimize all pages (Dashboard, Clients, Login, Forms) for 320px+ widths
2. **Modern Animations**: Add smooth page transitions, menu animations, and interactive element feedback (respecting prefers-reduced-motion)
3. **Bilingual Support**: Implement language switcher with full Arabic/English translation and RTL/LTR layout switching
4. **Visual Refresh**: Replace Next.js branding with custom branding, use modern black/white SVG icons throughout
5. **Social Footer**: Add responsive footer with manageable social media links (database-driven)

The approach uses CSS media queries and Flexbox/Grid for responsive layouts, CSS animations and transitions for smooth interactions, Next.js i18n patterns for bilingual support, and a new Prisma model for social media link management.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x with Next.js 16.1.6 (App Router), React 19.2.3  
**Primary Dependencies**: @clerk/nextjs (auth), @prisma/client (ORM), @heroicons/react (icons), Tailwind CSS 4.x (styling)  
**Storage**: PostgreSQL on Neon Serverless (existing database, will add SocialMediaLink table)  
**Testing**: Vitest 4.1.1 with @testing-library/react for component testing  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari) on mobile (320px+), tablet (768px+), desktop (1024px+)
**Project Type**: Full-stack web application (Next.js App Router with API routes)  
**Performance Goals**: 60fps animations on mobile, <300ms page transitions, <200ms API response times  
**Constraints**: Maintain existing functionality, support prefers-reduced-motion, WCAG 2.1 AA compliance (44px touch targets)  
**Scale/Scope**: 8 existing pages to make responsive + new i18n layer + footer component + social media CRUD

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I - Client & Order Management First**: ✅ PASS
- Feature focuses on presentation layer only, does not alter data integrity or client management logic
- No changes to audit trails, soft deletes, or referential integrity

**Principle II - Clerk Authentication & Security**: ✅ PASS
- No authentication changes required
- Social media link management will use existing Clerk session verification
- New API route for social links will follow existing auth patterns

**Principle III - Neon PostgreSQL as Source of Truth**: ✅ PASS
- Adding one new table (SocialMediaLink) via Prisma migration
- Migration will be zero-downtime (adding table, no schema modifications to existing tables)
- Follows existing migration patterns from specs/001 and specs/002

**Principle IV - Full-Featured Pages & Search**: ✅ PASS
- Does not remove or reduce existing page functionality
- Enhances all existing pages with responsive design
- No changes to search, export, or CRUD operations

**Principle V - Order History & Client Relationship**: ✅ PASS
- No changes to order-client relationship
- Responsive design preserves all order history displays

**Principle VI - API-First Development**: ✅ PASS
- Social media link management via new API routes: GET/POST/PUT/DELETE /api/social-media
- Follows existing API patterns (validation, error handling, soft-delete)
- Footer component consumes API, no business logic in frontend

**Principle VII - Dashboard & Analytics**: ✅ PASS
- Dashboard remains default landing page
- Responsive design preserves all metrics and analytics
- Mobile layout stacks metric cards vertically

**Additional Validation**:
- Bilingual support (i18n) is presentation layer only, does not affect data model
- Animations respect accessibility (prefers-reduced-motion)
- New database table follows existing conventions (id, created_at, updated_at, is_deleted)

**GATE STATUS**: ✅ ALL CHECKS PASSED - Proceed to Phase 0

---

## Phase 0: Research Complete

See [research.md](./research.md) for detailed findings.

**Key Decisions**:
- Responsive design: Tailwind CSS mobile-first utilities
- Mobile navigation: Slide-out drawer menu pattern
- Animations: CSS transitions/animations with prefers-reduced-motion support
- i18n: Custom React Context + JSON translation files
- RTL: HTML dir attribute + Tailwind RTL variants
- Icons: @heroicons/react + custom SVGs for social media
- Social media data: PostgreSQL table via Prisma
- Footer: React component in root layout with API data fetching

---

## Phase 1: Design Complete

**Artifacts Generated**:
- [data-model.md](./data-model.md) - SocialMediaLink schema + i18n structures
- [contracts/api-social-media.md](./contracts/api-social-media.md) - Social media API specification
- [contracts/i18n-structure.md](./contracts/i18n-structure.md) - Translation format and language context
- [quickstart.md](./quickstart.md) - Developer implementation guide

---

## Constitution Re-Check (Post-Design)

*Re-validating all principles after Phase 1 design completion*

**Principle I - Client & Order Management First**: ✅ PASS
- Design preserves all client/order data integrity
- No changes to audit patterns or soft-delete logic
- SocialMediaLink follows same soft-delete pattern

**Principle II - Clerk Authentication & Security**: ✅ PASS
- Social media API routes will use existing Clerk auth patterns
- Admin-only access for POST/PUT/DELETE operations
- No changes to existing auth flow

**Principle III - Neon PostgreSQL as Source of Truth**: ✅ PASS
- Data model created for SocialMediaLink table
- Migration designed as zero-downtime (new table only)
- Follows existing Prisma patterns from clients/orders

**Principle IV - Full-Featured Pages & Search**: ✅ PASS
- All existing pages enhanced (responsive design)
- Dashboard, search, export functionality preserved
- No feature removal

**Principle V - Order History & Client Relationship**: ✅ PASS
- No changes to order-client relationships
- Responsive design applies to order displays

**Principle VI - API-First Development**: ✅ PASS
- Complete API contract defined for social media endpoints
- Follows existing validation/error handling patterns
- Footer component consumes API (no business logic in frontend)

**Principle VII - Dashboard & Analytics**: ✅ PASS
- Dashboard remains landing page with all metrics
- Responsive design stacks metric cards on mobile
- No reduction in analytics functionality

**Design Validation**:
- Data model includes proper validation rules ✅
- API contracts specify input validation ✅
- RTL/LTR support documented with examples ✅
- Accessibility considerations (touch targets, reduced motion) ✅
- Performance targets defined (60fps, <300ms) ✅

**FINAL GATE STATUS**: ✅ ALL CHECKS PASSED - Ready for Phase 2 (Tasks)

---

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                                      # Next.js App Router
├── globals.css                           # [MODIFY] Add responsive utilities, RTL support, animation keyframes
├── header.tsx                            # [MODIFY] Make responsive, add mobile menu, language switcher, remove Next.js logo
├── layout.tsx                            # [MODIFY] Add i18n provider, Footer component
├── page.tsx                              # [MODIFY] Responsive layout
├── api/
│   ├── clients/                          # [MODIFY] Existing - no changes
│   ├── metrics/                          # [MODIFY] Existing - no changes
│   ├── orders/                           # [MODIFY] Existing - no changes
│   └── social-media/                     # [NEW] CRUD endpoints for SocialMediaLink
│       └── route.ts                      # [NEW] GET/POST
│       └── [id]/                         # [NEW] GET/PUT/DELETE by ID
│           └── route.ts
├── dashboard/
│   └── page.tsx                          # [MODIFY] Responsive metric cards, mobile-friendly charts
├── clients/
│   ├── page.tsx                          # [MODIFY] Responsive table/card view
│   ├── add/page.tsx                      # [MODIFY] Responsive form layout
│   └── [id]/
│       ├── edit/page.tsx                 # [MODIFY] Responsive form layout
│       └── view/page.tsx                 # [MODIFY] Responsive detail view
└── login/
    └── page.tsx                          # [MODIFY] Responsive centered layout

lib/
├── components/
│   ├── Footer.tsx                        # [NEW] Responsive footer with social media links
│   ├── LanguageSwitcher.tsx              # [NEW] EN/AR toggle button for header
│   ├── MobileMenu.tsx                    # [NEW] Mobile navigation drawer/menu
│   ├── AnimatedPage.tsx                  # [NEW] Wrapper for page transition animations
│   ├── dashboard/
│   │   ├── DonutChart.tsx                # [MODIFY] Responsive chart sizing
│   │   ├── LatestClients.tsx             # [MODIFY] Card stacking on mobile
│   │   ├── MetricCard.tsx                # [MODIFY] Flexible sizing
│   │   └── RecentActivity.tsx            # [MODIFY] Mobile-optimized list
│   └── clients/
│       ├── ClientTable.tsx               # [MODIFY] Responsive table or switch to card view
│       ├── ClientCard.tsx                # [MODIFY] Already card-based, enhance mobile spacing
│       └── ClientSearchBar.tsx           # [MODIFY] Full-width on mobile
├── i18n/                                 # [NEW] Internationalization
│   ├── translations/
│   │   ├── en.json                       # [NEW] English translations
│   │   └── ar.json                       # [NEW] Arabic translations
│   ├── LanguageContext.tsx               # [NEW] React context for language state
│   └── useTranslation.ts                 # [NEW] Custom hook for accessing translations
└── types.ts                              # [MODIFY] Add SocialMediaLink type

prisma/
├── schema.prisma                         # [MODIFY] Add SocialMediaLink model
└── migrations/
    └── 20260326_add_social_media_links/  # [NEW] Migration for SocialMediaLink table
        └── migration.sql

public/
├── icons/                                # [NEW] Black/white SVG icon library
│   ├── facebook.svg
│   ├── twitter.svg
│   ├── instagram.svg
│   ├── linkedin.svg
│   ├── youtube.svg
│   └── whatsapp.svg
└── next.svg                              # [REMOVE] or keep but don't use in header

specs/003-mobile-responsive-animations/
├── plan.md                               # This file
├── research.md                           # [GENERATE] Phase 0 output
├── data-model.md                         # [GENERATE] Phase 1 output
├── quickstart.md                         # [GENERATE] Phase 1 output
└── contracts/                            # [GENERATE] Phase 1 output
    ├── api-social-media.md               # [GENERATE] Social media API contract
    └── i18n-structure.md                 # [GENERATE] Translation structure
```

**Structure Decision**: Web application structure (Option 2 pattern). This is a Next.js full-stack app with:
- `app/` directory for App Router pages and API routes (Next.js 13+ convention)
- `lib/` for shared components, utilities, and i18n infrastructure
- `prisma/` for database schema and migrations
- `public/` for static assets (icons)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
