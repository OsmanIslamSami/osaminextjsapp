<!--
================================================================================
SYNC IMPACT REPORT - Constitution Update
================================================================================

Version Change: 1.0.0 → 1.1.0 (MINOR version bump)

Rationale: Added new principle (Dashboard & Analytics) and expanded requirements
for existing principles. This is a material expansion of project scope requiring
new implementation artifacts.

Modified Principles:
- Principle IV: "Full-Featured Pages & Search" 
  → Added: Dashboard page requirement, Export capability requirement
  
Added Principles:
- Principle VII: "Dashboard & Analytics" (NEW)
  → Mandates dashboard as default landing page with real-time metrics
  
Modified Sections:
- Technical Constraints
  → Added: Export technology requirement (SheetJS/ExcelJS)
  → Added: Dashboard Requirements subsection
  → Added: Export Requirements subsection
  
- Development Workflow
  → Updated implementation order to include Dashboard (step 3)
  → Added compliance gates for dashboard and export

Templates Requiring Updates:
✅ PLANNING.md (speckit/01-plan/) - Added dashboard & export features
✅ TASKS_CHECKLIST.md (speckit/02-tasks/) - Will add dashboard & export tasks
✅ API_ENDPOINTS.md (speckit/02-tasks/) - Will add metrics & export endpoints
✅ IMPLEMENTATION_GUIDE.md (speckit/03-implement/) - Will add dashboard patterns

Deferred Items:
- None. All placeholders filled.

Follow-up Actions Required:
1. Update speckit/01-plan/PLANNING.md with dashboard page structure
2. Update speckit/02-tasks/TASKS_CHECKLIST.md with dashboard & export tasks
3. Update speckit/02-tasks/API_ENDPOINTS.md with /api/metrics and /api/clients/export
4. Create implementation template for dashboard components
5. Create implementation template for Excel export functionality

Suggested Commit Message:
docs: amend constitution to v1.1.0 (dashboard & export requirements)

- Add Principle VII: Dashboard & Analytics
- Expand Principle IV with dashboard and export requirements
- Add Dashboard Requirements subsection
- Add Export Requirements subsection
- Update compliance verification gates
- MINOR version bump due to new mandatory features

================================================================================
-->

# Proj-Clients Constitution
<!-- Client Management System with Orders - Core Governance -->

## Core Principles

### I. Client & Order Management First
All features prioritize usability and data integrity for client and order management. Every operation must be auditable, reversible (soft deletes preferred), and maintain referential integrity. Client data is immutable once created except through explicit edit operations.

### II. Clerk Authentication & Security
User authentication and authorization are mandatory via Clerk. All API routes must verify Clerk session tokens. Row-level security (RLS) policies are preferred at database level. User identity is always captured with created_at/updated_at timestamps for audit trails.

### III. Neon PostgreSQL as Source of Truth
Database schema is the contractual source of truth for data structure. All schema changes must:
- Use zero-downtime migrations (no blocking locks)
- Maintain backward compatibility for 1 version
- Include rollback procedures
- Be tested in temporary branch before production

### IV. Full-Featured Pages & Search
Every collection (Clients, Orders) must have:
- **Dashboard page** with aggregate counts and key metrics
- **List page** with full-text search (name, email, mobile, order number)
- **Add page** with form validation and error feedback
- **Edit page** for updating existing records
- **View/Detail page** for comprehensive information
- **Delete capability** with confirmation and soft-delete preference
- **Export capability** (Excel format) from list/search pages

### V. Order History & Client Relationship
Order history is mandatory. Every client record must:
- Display complete order history (all orders, all statuses)
- Link orders bidirectionally to clients
- Show order timestamps, status, and amounts
- Support filtering by order status (pending, completed, cancelled)

### VI. API-First Development
Frontend consumes only documented REST/JSON APIs. All business logic lives in API routes, not frontend. API routes include:
- Input validation and error messages
- Soft-delete patterns (e.g., is_deleted flag)
- Pagination and search parameters
- Proper HTTP status codes (400, 404, 409, 500)

### VII. Dashboard & Analytics
Dashboard is the default landing page after authentication. Must display:
- Total clients count
- Total orders count
- Recent activity (latest clients/orders)
- Order status breakdown (pending/completed/cancelled)
- All metrics update in real-time via API polling or websockets

## Technical Constraints

### Technology Stack
- **Frontend**: Next.js App Router with React hooks
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL on Neon (serverless)
- **Authentication**: Clerk (managed service)
- **Styling**: Tailwind CSS
- **Forms**: Client-side validation + server validation
- **Export**: Excel/XLSX generation (SheetJS/ExcelJS)

### Database Requirements
- Use Prisma or raw SQL with migrations
- Enforce NOT NULL constraints for required fields
- Use UNIQUE constraints (email on clients)
- Foreign keys for client ↔ orders relationship
- Indexes on frequently searched columns (email, name)
- Soft deletes via is_deleted boolean flag
- Aggregate queries for dashboard metrics

### Form & UI Standards
- Required fields marked with asterisk (*)
- Real-time validation feedback
- Error messages below offending fields
- Loading states during API calls
- Success notifications on completion
- Back/Cancel buttons for navigation
- Export button on list pages with download progress

### Dashboard Requirements
- Metric cards with icons and counts
- Responsive grid layout (mobile-first)
- Loading skeletons while fetching data
- Auto-refresh capability (30-60 seconds)
- Click-through to detailed views

### Export Requirements
- Generate Excel (.xlsx) from current search results
- Include all visible columns
- Respect current filters and search terms
- File naming: `clients_export_YYYY-MM-DD.xlsx`
- Client-side download via blob URL
- Progress indicator for large exports (>1000 records)

## Development Workflow

### Feature Implementation Order
1. Database schema → Migrations → Seed data
2. API routes (GET, POST, PUT, DELETE) with validation
3. Dashboard page with metrics
4. Frontend pages (List → View → Add → Edit)
5. Search & filtering enhancements
6. Export functionality
7. Integration tests & error scenarios
8. Documentation (API docs, user guide)

### Code Review & Quality Gates
- All API routes must have input validation
- All forms must have client + server validation
- No hardcoded URLs or sensitive data
- Error handling must be user-friendly
- Tests must cover happy path + error cases
- Dashboard metrics must match database counts
- Export must handle empty results gracefully

### Database Migrations
- Create in temporary Neon branch first
- Test for zero-downtime compatibility
- Include rollback SQL inline
- Document any data transformations
- Never drop columns without deprecation period

## Governance

**Constitution Authority**: This document supersedes all informal practices. All code contributions must align with these principles.

**Amendment Process**: 
- Propose amendments with rationale
- Document affected principles and sections
- Get team consensus before implementation
- Update version following semantic versioning:
  - MAJOR: Principle removal or incompatible change (avoid)
  - MINOR: New principle or significant guidance addition
  - PATCH: Clarification, wording, non-semantic change

**Compliance Verification**:
- Every PR must verify: Clerk auth, API validation, DB constraints
- Every schema change requires zero-downtime verification
- Every new feature requires all required pages (dashboard, list, add, edit, view, delete, export)
- Every API route includes error handling per VI
- Dashboard metrics must be verifiable via direct DB queries

**Guidance & Runtime Decisions**:
- See [.specify/guides/](../../.specify/guides/) for implementation walkthroughs
- See [speckit/01-plan/](../../speckit/01-plan/) for feature planning
- See [speckit/02-tasks/](../../speckit/02-tasks/) for task breakdowns
- See [speckit/03-implement/](../../speckit/03-implement/) for code templates

**Version**: 1.1.0 | **Ratified**: 2026-03-25 | **Last Amended**: 2026-03-25
<!-- Proj-Clients Constitution - Added Dashboard & Export requirements (v1.1.0) -->
