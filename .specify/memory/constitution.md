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
- **List page** with full-text search (name, email, mobile, order number)
- **Add page** with form validation and error feedback
- **Edit page** for updating existing records
- **View/Detail page** for comprehensive information
- **Delete capability** with confirmation and soft-delete preference

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

## Technical Constraints

### Technology Stack
- **Frontend**: Next.js App Router with React hooks
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL on Neon (serverless)
- **Authentication**: Clerk (managed service)
- **Styling**: Tailwind CSS
- **Forms**: Client-side validation + server validation

### Database Requirements
- Use Prisma or raw SQL with migrations
- Enforce NOT NULL constraints for required fields
- Use UNIQUE constraints (email on clients)
- Foreign keys for client ↔ orders relationship
- Indexes on frequently searched columns (email, name)
- Soft deletes via is_deleted boolean flag

### Form & UI Standards
- Required fields marked with asterisk (*)
- Real-time validation feedback
- Error messages below offending fields
- Loading states during API calls
- Success notifications on completion
- Back/Cancel buttons for navigation

## Development Workflow

### Feature Implementation Order
1. Database schema → Migrations → Seed data
2. API routes (GET, POST, PUT, DELETE) with validation
3. Frontend pages (List → View → Add → Edit)
4. Search & filtering enhancements
5. Integration tests & error scenarios
6. Documentation (API docs, user guide)

### Code Review & Quality Gates
- All API routes must have input validation
- All forms must have client + server validation
- No hardcoded URLs or sensitive data
- Error handling must be user-friendly
- Tests must cover happy path + error cases

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
- Every new feature requires all required pages (list, add, edit, view, delete)
- Every API route includes error handling per VI.

**Guidance & Runtime Decisions**:
- See [.specify/guides/](../../.specify/guides/) for implementation walkthroughs
- See [speckit/01-plan/](../../speckit/01-plan/) for feature planning
- See [speckit/02-tasks/](../../speckit/02-tasks/) for task breakdowns
- See [speckit/03-implement/](../../speckit/03-implement/) for code templates

**Version**: 1.0.0 | **Ratified**: 2026-03-25 | **Last Amended**: 2026-03-25
<!-- Proj-Clients Constitution adopted March 25, 2026 -->
