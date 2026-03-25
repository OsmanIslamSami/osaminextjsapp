# Implementation Plan: Client Management UI with Dashboard

**Branch**: `001-client-management-ui` | **Date**: 2026-03-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-client-management-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature implements a comprehensive client management UI with dashboard analytics. The system provides quick navigation from a home page to dashboard and client search pages. The dashboard displays real-time metrics using a colored donut chart for order status breakdown, side-by-side month comparisons (This Month vs Last Month), recent activity lists (last 5 clients and orders), and latest added clients. The client search page offers full-text search with all audit trail fields (created_by, updated_by, timestamps). The implementation uses Tailwind CSS theme colors for all UI components, follows a responsive card-based grid layout, and integrates with existing Clerk authentication and Neon PostgreSQL database.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.1.6  
**Primary Dependencies**: React 19.2.3, @clerk/nextjs 7.0.4, Tailwind CSS 4, Chart.js/Recharts (for donut chart)  
**Storage**: Neon PostgreSQL via @prisma/client 7.5.0 (existing schema: clients, orders tables)  
**Testing**: Jest + React Testing Library (unit tests), Vitest as alternative  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge) - desktop and mobile responsive  
**Project Type**: Next.js App Router web application with API routes (serverless functions)  
**Performance Goals**: Dashboard load < 2 seconds for 10k orders, search results < 500ms, real-time metrics  
**Constraints**: Card-based responsive grid (mobile <768px single column, desktop >1024px multi-column), WCAG AA contrast for donut chart colors  
**Scale/Scope**: 3 new pages (home, dashboard, enhanced search), 1 API endpoint for metrics, donut chart component, seed data for 50 clients + orders

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle II: Clerk Authentication & Security
- All new pages (home, dashboard, search) will require Clerk authentication
- No API endpoints needed for this feature (uses existing `/api/clients` and new `/api/metrics`)
- Audit trail fields (created_by, updated_by) already exist in database schema

### ✅ Principle III: Neon PostgreSQL as Source of Truth
- No schema changes required - feature uses existing `clients` and `orders` tables
- All data queries via Prisma client (existing setup)
- No migrations needed for this feature

### ✅ Principle IV: Full-Featured Pages & Search
- Dashboard page: NEW (required by Principle VII)
- List page with search: ENHANCED (existing `/app/clients/page.tsx` to be improved)
- Add/Edit/View pages: EXISTING (already implemented, no changes)
- Export capability: DEFERRED (not in scope for this feature per user requirements)

### ✅ Principle VII: Dashboard & Analytics
- Dashboard will display total client count and total order count
- Order status breakdown via donut chart (pending/completed/cancelled)
- Recent activity: Last 5 clients added + last 5 orders created
- Month comparison metrics: This Month vs Last Month
- Latest clients section by created_at date
- All metrics via new `/api/metrics` endpoint

### 📋 Compliance Notes
- **Testing**: Unit tests included per user requirements; integration tests explicitly skipped per user request
- **Seed Data**: Migration will include seed script for 50 clients and multiple orders per client per user requirements
- **Styling**: Tailwind CSS theme colors required for all components per user requirements
- **Responsive Design**: Card-based grid layout (mobile single-column, desktop multi-column) per Feature Spec FR-016

**GATE STATUS**: ✅ PASS - All constitution principles satisfied. No violations requiring justification.

**POST-PHASE 1 RE-CHECK** (2026-03-25):
- ✅ Schema changes documented in data-model.md (audit fields, order status enum, indexes)
- ✅ API contract defined for /api/metrics endpoint
- ✅ All dashboard requirements met (metrics, donut chart, recent activity, month comparison)
- ✅ Tailwind CSS theme colors strategy researched and documented
- ✅ Seed data specifications complete (50 clients, ~350 orders)
- ✅ No new violations introduced in design phase

**FINAL STATUS**: ✅ APPROVED - Ready for Phase 2 (task breakdown)

## Project Structure

### Documentation (this feature)

```text
specs/001-client-management-ui/
├── spec.md              # Feature specification (input)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-metrics.md   # Metrics API contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── page.tsx                    # NEW: Home page with quick links
├── dashboard/
│   └── page.tsx                # NEW: Dashboard with metrics and donut chart
├── clients/
│   └── page.tsx                # ENHANCED: Add full-text search, responsive grid
├── api/
│   └── metrics/
│       └── route.ts            # NEW: Metrics endpoint for dashboard

lib/
├── components/
│   ├── dashboard/
│   │   ├── DonutChart.tsx      # NEW: Order status donut chart
│   │   ├── MetricCard.tsx      # NEW: Reusable metric card component
│   │   ├── RecentActivity.tsx  # NEW: Recent clients/orders lists
│   │   └── LatestClients.tsx   # NEW: Latest clients section
│   └── ui/
│       └── QuickLinkCard.tsx   # NEW: Home page quick link cards

scripts/
└── seed-dashboard-data.ts      # NEW: Generate 50 clients + orders

__tests__/
├── dashboard/
│   ├── DonutChart.test.tsx     # NEW: Unit tests for chart component
│   ├── MetricCard.test.tsx     # NEW: Unit tests for metric card
│   └── dashboard-page.test.tsx # NEW: Unit tests for dashboard page
└── api/
    └── metrics.test.ts         # NEW: Unit tests for metrics endpoint
```

**Structure Decision**: Next.js App Router structure with feature-based organization. Dashboard components isolated in `lib/components/dashboard/` for maintainability. API routes follow RESTful patterns under `app/api/`. Seed script in `scripts/` directory alongside existing `init-db.js`.

## Complexity Tracking

**No violations identified.** All requirements align with constitution principles. No justification needed.
