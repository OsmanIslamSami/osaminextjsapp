# Implementation Plan: Clients Table with Action Icons

**Branch**: `002-clients-table-view` | **Date**: March 25, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-clients-table-view/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a comprehensive client table view on the clients page with striped rows displaying Name, Email, Phone, Company, and Status columns. Include an Options column with icon-based actions for View, Edit, and Delete operations. Use infinite scroll for seamless data loading, colored status badges (green for Active, gray for Inactive), and contextual delete confirmation dialogs. Requires database schema extension to add company and status fields.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 16.1.6 (App Router)  
**Primary Dependencies**: React 19.2.3, @clerk/nextjs 7.0.4, @prisma/client 7.5.0, Tailwind CSS 4, xlsx 0.18.5  
**Storage**: PostgreSQL on Neon (serverless) via Prisma ORM  
**Testing**: Vitest 4.1.1 with @testing-library/react 16.3.2  
**Target Platform**: Web browsers (desktop/tablet focus per spec assumptions)
**Project Type**: Full-stack web application (Next.js with API routes)  
**Performance Goals**: <2s initial load for first batch, seamless infinite scroll with no perceptible lag  
**Constraints**: Must support infinite scroll for lists >100 items, colored badges for status  
**Scale/Scope**: Client management system with orders, estimated hundreds to thousands of client records

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Client & Order Management First
- Feature enhances client management usability with improved table view
- Soft delete already exists in schema (is_deleted flag)
- Action icons will leverage existing CRUD endpoints
- Audit trail fields (created_by, updated_by, timestamps) already present

### ✅ Principle II: Clerk Authentication & Security  
- Will use existing Clerk authentication in layout
- API routes already protect with Clerk session verification
- No new authentication requirements

### ✅ Principle III: Neon PostgreSQL as Source of Truth
- Requires schema migration to add `company` (String?) and `status` (enum) fields to clients table
- Migration will be zero-downtime (additive only, nullable company field)
- New enum: ClientStatus (Active, Inactive)
- Migration includes rollback SQL
- Will test in Neon temporary branch first

### ⚠️ Principle IV: Full-Featured Pages & Search
- **COMPLIANT**: Add, Edit, View, Delete pages already exist (verified in app/clients/)
- **COMPLIANT**: Search already implemented in ClientSearchBar component
- **COMPLIANT**: Export already implemented in ExportButton component
- **THIS FEATURE**: Converts grid layout to table layout with striped rows
- Dashboard exists separately (not part of this feature)

### N/A Principle V: Order History & Client Relationship
- Not applicable to this UI enhancement feature
- Existing client-order relationship remains unchanged

### ✅ Principle VI: API-First Development
- Will use existing `/api/clients` GET endpoint
- Will enhance to support infinite scroll pagination (cursor-based or offset)
- Will use existing `/api/clients/[id]` DELETE endpoint
- Delete confirmation will be client-side UI only
- All validation already exists in API routes

### N/A Principle VII: Dashboard & Analytics
- Not applicable to this feature
- Dashboard page exists separately

**GATE STATUS**: ✅ PASS - All applicable principles satisfied. Schema migration required (Principle III).

## Project Structure

### Documentation (this feature)

```text
specs/002-clients-table-view/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-clients.md   # Enhanced API contract for infinite scroll
├── checklists/          # Quality checklists
│   └── requirements.md  # Already exists
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── clients/
│   ├── page.tsx         # THIS FEATURE: Convert grid to table with infinite scroll
│   ├── add/
│   │   └── page.tsx     # Existing: Add client form
│   └── [id]/
│       ├── view/
│       │   └── page.tsx # Existing: View client details
│       └── edit/
│           └── page.tsx # Existing: Edit client form
├── api/
│   └── clients/
│       ├── route.ts     # THIS FEATURE: Enhance for infinite scroll pagination
│       └── [id]/
│           └── route.ts # Existing: CRUD operations
└── layout.tsx           # Existing: Clerk auth wrapper

lib/
├── components/
│   ├── clients/
│   │   ├── ClientTable.tsx      # THIS FEATURE: New table component (replaces ClientGrid)
│   │   ├── ClientTableRow.tsx   # THIS FEATURE: New striped row component
│   │   ├── StatusBadge.tsx      # THIS FEATURE: New colored status badge
│   │   ├── ClientSearchBar.tsx  # Existing: Search component
│   │   └── ClientGrid.tsx       # Existing: Will be replaced
│   ├── ConfirmDialog.tsx        # THIS FEATURE: Enhance for contextual delete
│   └── DeleteButton.tsx         # Existing: Delete action component
└── generated/
    └── prisma/
        ├── client.ts    # Auto-generated from schema
        └── enums.ts     # THIS FEATURE: Will include new ClientStatus enum

prisma/
├── schema.prisma        # THIS FEATURE: Add company field and ClientStatus enum
└── migrations/
    └── [timestamp]_add_client_company_status/
        └── migration.sql # THIS FEATURE: New migration

tests/
└── [test files follow implementation]
```

**Structure Decision**: Next.js App Router monolith with collocated API routes. Frontend components in `/lib/components`, Prisma client in `/lib/generated/prisma`, database schema in `/prisma/schema.prisma`. This feature enhances the existing `/app/clients/page.tsx` and adds new table components while maintaining the existing CRUD pages.

## Complexity Tracking

No constitution violations. All applicable principles satisfied with existing architecture.

---

## Phase 0: Research ✅ Complete

**Output**: [research.md](research.md)

**Key Decisions**:
1. Infinite scroll: Intersection Observer API (native, performant)
2. Icons: Heroicons (Tailwind-native, tree-shakeable)
3. Status badges: Tailwind utility classes with StatusBadge component
4. Table striping: Tailwind `even:` modifier
5. Delete confirmation: Enhanced ConfirmDialog component
6. Database migration: Additive with nullable company, enum status with default

---

## Phase 1: Design & Contracts ✅ Complete

**Outputs**:
- [data-model.md](data-model.md) - Database schema with company and ClientStatus enum
- [contracts/api-clients.md](contracts/api-clients.md) - API contract for infinite scroll pagination
- [quickstart.md](quickstart.md) - Developer setup guide

**Agent Context Updated**: .github/agents/copilot-instructions.md updated with:
- TypeScript 5 / Next.js 16.1.6 (App Router)
- React 19.2.3, @clerk/nextjs 7.0.4, @prisma/client 7.5.0, Tailwind CSS 4, xlsx 0.18.5
- PostgreSQL on Neon (serverless) via Prisma ORM
- Full-stack web application (Next.js with API routes)

---

## Constitution Check (Post-Design Re-evaluation)

*GATE: Verify design artifacts align with constitution principles*

### ✅ Principle I: Client & Order Management First
- **Audit Trail**: All existing audit fields preserved (created_by, updated_by, timestamps)
- **Data Integrity**: ClientStatus enum enforces valid status values at database level
- **Soft Deletes**: Existing is_deleted pattern unchanged, respected in API filters
- **Reversibility**: Status changes tracked via updated_at/updated_by

### ✅ Principle II: Clerk Authentication & Security
- **API Protection**: All API routes verified with Clerk session (existing pattern maintained)
- **User Identity**: No new authentication requirements, leverages existing Clerk setup
- **Session Tokens**: Automatic with Clerk client library

### ✅ Principle III: Neon PostgreSQL as Source of Truth
- **Migration Design**: Zero-downtime additive migration (nullable company, status with default)
- **Backward Compatibility**: Existing queries unaffected by new fields
- **Rollback Procedure**: Included in migration SQL comments
- **Testing Strategy**: Neon temporary branch testing prescribed in quickstart.md
- **Schema Contract**: Prisma schema extended, generates new TypeScript types

### ✅ Principle IV: Full-Featured Pages & Search
- **Dashboard**: Exists separately (not modified by this feature)
- **List Page**: Enhanced with table view (this feature)
- **Add/Edit Pages**: Existing pages will need company and status fields (future task)
- **View Page**: Existing (no changes required)
- **Delete**: Leverages existing soft-delete API
- **Search**: Existing ClientSearchBar component maintained
- **Export**: Existing ExportButton component maintained

### ✅ Principle V: Order History & Client Relationship
- **Not Applicable**: This UI enhancement doesn't affect client-order relationship

### ✅ Principle VI: API-First Development
- **API Contract**: Documented in contracts/api-clients.md
- **Pagination**: Cursor-based (stable, efficient)
- **Validation**: Status enum enforced at database and API levels
- **Error Handling**: HTTP status codes defined (200, 400, 401, 500)
- **Business Logic**: Maintained in API route (prisma queries), not frontend

### ✅ Principle VII: Dashboard & Analytics
- **Not Applicable**: Dashboard exists separately, not part of this feature

**GATE STATUS**: ✅ PASS - All design artifacts comply with constitution. Ready for Phase 2 (Task Generation).

---

## Phase 2: Task Generation (Next Step)

**Command**: `/speckit.tasks`

**Expected Output**: tasks.md with dependency-ordered implementation tasks

**Prerequisites**: ✅ All complete
- [x] research.md created
- [x] data-model.md created
- [x] contracts/api-clients.md created
- [x] quickstart.md created
- [x] Agent context updated
- [x] Post-design constitution check passed

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
