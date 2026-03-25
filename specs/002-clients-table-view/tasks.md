# Tasks: Clients Table with Action Icons

**Feature Branch**: `002-clients-table-view`  
**Input**: Design documents from `/specs/002-clients-table-view/`  
**Prerequisites**: ✅ plan.md, spec.md, research.md, data-model.md, contracts/api-clients.md

## Implementation Strategy

This feature implements a table view with infinite scroll and enhanced header navigation, organized by user stories (P1→P2→P3) to enable incremental delivery. Each user story is independently testable and delivers measurable value.

**MVP Scope**: User Story 1 (P1) - View All Clients in Table (with header navigation)
**Full Feature**: All 4 user stories (P1-P3) plus header navigation

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: `- [ ]` (REQUIRED for all tasks)
- **[ID]**: Task number (T001, T002, etc.)
- **[P]**: Parallelizable task (different files, no blocking dependencies)
- **[Story]**: User story label (US1, US2, US3, US4) - REQUIRED for story phase tasks
- **Description**: Action with exact file path

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Database schema changes and dependency setup that enable all user stories

- [ ] T001 Install Heroicons React library via npm for action icons
- [ ] T002 Create database migration file prisma/migrations/[timestamp]_add_client_company_status/migration.sql
- [ ] T003 Add ClientStatus enum to prisma/schema.prisma with values Active and Inactive
- [ ] T004 Add company field (String?, nullable) to clients model in prisma/schema.prisma
- [ ] T005 Add status field (ClientStatus, default Active) to clients model in prisma/schema.prisma
- [ ] T006 Add status index to clients model in prisma/schema.prisma (idx_clients_status)
- [ ] T007 Write forward migration SQL in migration file (CREATE TYPE, ALTER TABLE, CREATE INDEX)
- [ ] T008 Write rollback migration SQL in migration file comments
- [ ] T009 Test migration in Neon temporary branch for zero-downtime verification
- [ ] T010 Apply migration to main database via npx prisma migrate dev
- [ ] T011 Generate Prisma client with new types via npx prisma generate

**Deliverable**: Database schema updated, Prisma types generated, Heroicons available  
**Test**: Prisma client includes ClientStatus enum, company and status fields exist in types

---

## Phase 2: Header Navigation Enhancement

**Purpose**: Add navigation links with icons for Home, Dashboard, and Clients pages

- [ ] T012 Import HomeIcon, ChartBarIcon, and UsersIcon from @heroicons/react/24/outline in app/header.tsx
- [ ] T013 Add Home link with HomeIcon to header navigation in app/header.tsx (navigates to /)
- [ ] T014 Add Dashboard link with ChartBarIcon to header navigation in app/header.tsx (navigates to /dashboard)
- [ ] T015 Update existing Clients link to include UsersIcon in app/header.tsx
- [ ] T016 Style all navigation links with consistent formatting (flex items-center gap-2, px-4 py-2)
- [ ] T017 Add hover effects to all navigation links (hover:bg-black/[.04] dark:hover:bg-[#1a1a1a])
- [ ] T018 Add active state styling to highlight current page in navigation (optional bg-black/[.08])
- [ ] T019 Ensure all navigation links show icons with w-5 h-5 sizing
- [ ] T020 Verify navigation links are only visible when user is signed in (wrap in Show component)

**Deliverable**: Header contains working navigation to Home, Dashboard, and Clients with icons  
**Test**: Signed-in users see all three navigation links with icons, navigation works, hover states display

---

## Phase 3: Foundational (Blocking Prerequisites)

**Purpose**: API enhancements and shared components needed by all user stories

- [ ] T017 [P] Update GET /api/clients route in app/api/clients/route.ts to support limit query parameter (default 50, max 100)
- [ ] T018 [P] Update GET /api/clients route in app/api/clients/route.ts to support cursor query parameter for pagination
- [ ] T019 [P] Update GET /api/clients route in app/api/clients/route.ts to return hasMore boolean and nextCursor number
- [ ] T020 [P] Update GET /api/clients route in app/api/clients/route.ts to include company and status fields in response
- [ ] T021 [P] Implement cursor-based pagination logic using Prisma findMany with take limit+1 pattern
- [ ] T022 [P] Create StatusBadge component in lib/components/clients/StatusBadge.tsx with green/gray styling
- [ ] T023 [P] Add ClientStatus type prop to StatusBadge component (Active or Inactive)
- [ ] T024 [P] Implement conditional Tailwind classes for Active (bg-green-100 text-green-800) and Inactive (bg-gray-100 text-gray-800)
- [ ] T025 Enhance ConfirmDialog component in lib/components/ConfirmDialog.tsx to accept custom message prop
- [ ] T026 Update ConfirmDialog component styling for contextual delete (red confirm button, gray cancel button)

**Deliverable**: API supports infinite scroll, StatusBadge component ready, ConfirmDialog enhanced  
**Test**: GET /api/clients?limit=50 returns paginated data with hasMore and nextCursor, StatusBadge renders correctly

---

## Phase 4: User Story 1 - View All Clients in Table (Priority P1)

**Goal**: Display all clients in striped table with Name, Email, Phone, Company, Status columns

**Independent Test**: Navigate to /clients, verify table displays with striped rows and all 5+ columns, scroll triggers loading

- [ ] T022 [US1] Create ClientTable component in lib/components/clients/ClientTable.tsx with table structure
- [ ] T023 [US1] Add table headers for Name, Email, Phone, Company, Status, Options columns in ClientTable
- [ ] T024 [US1] Implement striped rows using Tailwind even:bg-gray-50 modifier in ClientTable
- [ ] T025 [US1] Add hover effect with transition-colors for table rows in ClientTable
- [ ] T026 [US1] Create ClientTableRow component in lib/components/clients/ClientTableRow.tsx for individual rows
- [ ] T027 [US1] Integrate StatusBadge component in ClientTableRow for Status column rendering
- [ ] T028 [US1] Add key prop using client.id for ClientTableRow in map iteration
- [ ] T029 [US1] Handle null values for company field (display "-" or empty cell) in ClientTableRow
- [ ] T030 [US1] Replace ClientGrid component with ClientTable in app/clients/page.tsx
- [ ] T031 [US1] Update state management to use infinite scroll pattern (clients array that appends on load)
- [ ] T032 [US1] Implement usePaginatedClients custom hook for managing cursor and hasMore state
- [ ] T033 [US1] Implement loadMore function that fetches next page using cursor pagination
- [ ] T034 [US1] Create Intersection Observer for infinite scroll in useEffect hook
- [ ] T035 [US1] Add sentinel div at table bottom with ref for Intersection Observer
- [ ] T036 [US1] Add loading spinner component when fetching additional clients
- [ ] T037 [US1] Handle empty state when no clients exist (display message and link to add client)
- [ ] T038 [US1] Handle error state when API call fails (display error message with retry button)
- [ ] T039 [US1] Update Client interface in app/clients/page.tsx to include company and status fields

**Deliverable**: Clients page displays table with infinite scroll, striped rows, status badges  
**Acceptance**: All 3 acceptance scenarios from spec.md satisfied

---

## Phase 4: User Story 2 - View Client Details (Priority P2)

**Goal**: Navigate to client detail page via eye icon in Options column

**Independent Test**: Click view icon in any row, verify navigation to /clients/[id]/view page

- [ ] T040 [P] [US2] Import EyeIcon from @heroicons/react/24/outline in ClientTableRow
- [ ] T041 [US2] Add Options column cell in ClientTableRow component
- [ ] T042 [US2] Create view button with EyeIcon in Options column
- [ ] T043 [US2] Add Link component wrapping EyeIcon to navigate to /clients/[id]/view
- [ ] T044 [US2] Style EyeIcon with w-5 h-5 and hover:text-blue-600 classes
- [ ] T045 [US2] Add ARIA label "View client details" for accessibility

**Deliverable**: View icon functional in Options column, navigates to existing view page  
**Acceptance**: All 3 acceptance scenarios from spec.md satisfied

---

## Phase 5: User Story 3 - Edit Client Information (Priority P2)

**Goal**: Navigate to client edit page via pencil icon in Options column, see updated data in table

**Independent Test**: Click edit icon, modify client, save, return to table, verify changes visible

- [ ] T046 [P] [US3] Import PencilIcon from @heroicons/react/24/outline in ClientTableRow
- [ ] T047 [US3] Create edit button with PencilIcon in Options column next to view icon
- [ ] T048 [US3] Add Link component wrapping PencilIcon to navigate to /clients/[id]/edit
- [ ] T049 [US3] Style PencilIcon with w-5 h-5 and hover:text-green-600 classes
- [ ] T050 [US3] Add ARIA label "Edit client information" for accessibility
- [ ] T051 [US3] Add company input field to app/clients/[id]/edit/page.tsx form (optional text input)
- [ ] T052 [US3] Add status dropdown to app/clients/[id]/edit/page.tsx form (Active/Inactive options)
- [ ] T053 [US3] Set default status value to Active for new clients in edit form
- [ ] T054 [US3] Update handleSubmit in edit page to include company and status in API PATCH request
- [ ] T055 [US3] Add company input field to app/clients/add/page.tsx form (optional text input)
- [ ] T056 [US3] Add status dropdown to app/clients/add/page.tsx form with Active as default
- [ ] T057 [US3] Update handleSubmit in add page to include company and status in API POST request

**Deliverable**: Edit and Add forms include company and status fields, table reflects changes  
**Acceptance**: All 3 acceptance scenarios from spec.md satisfied

---

## Phase 6: User Story 4 - Delete Client (Priority P3)

**Goal**: Delete client via trash icon with contextual confirmation dialog showing client name

**Independent Test**: Click delete icon, verify dialog shows client name, confirm deletes, cancel preserves

- [ ] T058 [P] [US4] Import TrashIcon from @heroicons/react/24/outline in ClientTableRow
- [ ] T059 [US4] Create delete button with TrashIcon in Options column after edit icon  
- [ ] T060 [US4] Style TrashIcon with w-5 h-5 and hover:text-red-600 classes
- [ ] T061 [US4] Add ARIA label "Delete client" for accessibility
- [ ] T062 [US4] Add onClick handler for delete button that opens ConfirmDialog with client name
- [ ] T063 [US4] Pass client.name to ConfirmDialog message prop (e.g., "Delete {client.name}?")
- [ ] T064 [US4] Add state management for ConfirmDialog visibility (showConfirm, setShowConfirm)
- [ ] T065 [US4] Add state to store client ID for deletion (clientToDelete, setClientToDelete)
- [ ] T066 [US4] Implement onConfirm handler that calls DELETE /api/clients/[id] endpoint
- [ ] T067 [US4] Remove deleted client from local state on successful deletion (optimistic update)
- [ ] T068 [US4] Show success notification after deletion (optional toast or message)
- [ ] T069 [US4] Handle deletion error (e.g., client has orders) by displaying error message
- [ ] T070 [US4] Implement onCancel handler that closes dialog without deleting
- [ ] T071 [US4] Add ESC key listener to ConfirmDialog for cancel action

**Deliverable**: Delete icon with contextual confirmation, soft-delete behavior preserved  
**Acceptance**: All 4 acceptance scenarios from spec.md satisfied

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, performance, and quality improvements

- [ ] T072 [P] Add loading skeleton for initial table load (optional enhancement)
- [ ] T073 [P] Add search integration to work with infinite scroll (resets cursor on search change)
- [ ] T074 [P] Add status filter dropdown to filter by Active/Inactive (optional enhancement)
- [ ] T075 [P] Update ExportButton to include company and status columns in Excel export
- [ ] T076 [P] Ensure responsive behavior for table on tablet devices (scroll horizontally if needed)
- [ ] T077 [P] Add tooltips to action icons for additional clarity (optional enhancement)
- [ ] T078 Test table displays correctly with 0 clients (empty state)
- [ ] T079 Test table displays correctly with 1 client (no infinite scroll trigger)
- [ ] T080 Test infinite scroll works with exactly 50 clients (triggers on scroll)
- [ ] T081 Test infinite scroll stops when all clients loaded (hasMore false)
- [ ] T082 Test status badge colors meet WCAG AA contrast requirements
- [ ] T083 Test striped rows maintain pattern across infinite scroll loads
- [ ] T084 Test delete confirmation shows correct client name
- [ ] T085 Test delete confirmation cancel does not delete client
- [ ] T086 Test navigation to view/edit pages works from table
- [ ] T087 Test company field displays "-" or blank when null
- [ ] T088 Test header navigation to Home, Dashboard, and Clients pages works correctly
- [ ] T089 Test header navigation icons display with correct sizing (w-5 h-5) and hover states
- [ ] T090 Test header navigation shows only when user is signed in
- [ ] T091 Verify all tasks completed and feature meets success criteria from spec.md
- [ ] T092 Update feature branch to staging and verify in staging environment
- [ ] T093 Create pull request with link to spec.md and tasks.md

**Deliverable**: Fully polished, tested table with infinite scroll, action icons, and header navigation  
**Acceptance**: All 8 success criteria from spec.md verified

---

## Task Summary by User Story

| User Story | Task Range | Task Count | Independent Test |
|-----------|-----------|------------|------------------|
| Setup | T001-T011 | 11 | Schema has company, status, ClientStatus enum |
| Header Navigation | T012-T020 | 9 | Home, Dashboard, Clients with icons work |
| Foundational | T021-T030 | 10 | API pagination works, badge renders |
| **US1 (P1)** - View Table | T031-T048 | 18 | Table displays with infinite scroll |
| **US2 (P2)** - View Details | T049-T054 | 6 | Eye icon navigates to view page |
| **US3 (P2)** - Edit Client | T055-T066 | 12 | Edit saves company/status fields |
| **US4 (P3)** - Delete Client | T067-T080 | 14 | Trash icon shows contextual dialog |
| Polish | T081-T093 | 13 | All success criteria met |
| **TOTAL** | T001-T093 | **93 tasks** |  |

---

## Dependencies & Execution Order

### Story Completion Order

```
Setup (T001-T011)
    ↓
Header Navigation (T012-T020)
    ↓
Foundational (T021-T030)
    ↓
US1: View Table (T031-T048) ←─── MVP Deliverable
    ↓
US2: View Details (T049-T054) ──┐
    ↓                            ├── Can be parallel (different files)
US3: Edit Client (T055-T066) ───┘
    ↓
US4: Delete Client (T067-T080)
    ↓
Polish (T081-T093)
```

### Parallel Execution Opportunities

**Within Setup Phase:**
- T002-T006 (schema edits in different sections of same file - can batch)

**Within Header Navigation Phase:**
- T012-T019 can be done together (editing same header file)

**Within Foundational Phase:**
- T021-T025 (API route changes - sequential)
- T026-T028 (StatusBadge component - parallel to API)
- T029-T030 (ConfirmDialog - parallel to StatusBadge)

**Within User Story Phases:**
- US2 (T049-T054) and US3 (T055-T059) can be parallel (marked with [P])
- US3 edit page (T060-T063) and add page (T064-T066) can be parallel

**Within Polish Phase:**
- Most tasks T081-T086 can run in parallel (different concerns)
- Testing tasks T087-T090 should be sequential for verification

**Within User Story Phases:**
- US2 (T049-T054) and US3 (T055-T059) can be parallel (marked with [P])
- US3 edit page (T060-T063) and add page (T064-T066) can be parallel

**Within Polish Phase:**
- Most tasks T081-T086 can run in parallel (different concerns)
- Testing tasks T087-T090 should be sequential for verification

---

## Validation Checklist

Before considering feature complete, verify:

- [ ] All 14 functional requirements (FR-001 through FR-014) implemented
- [ ] All 8 success criteria (SC-001 through SC-008) tested and met
- [ ] All 4 user story acceptance scenarios tested (3+3+3+4 = 13 scenarios)
- [ ] Constitution Principle checks passed (zero-downtime migration, API-first, etc.)
- [ ] Code follows clean code principles (organized, maintainable, DRY)
- [ ] No TypeScript errors (npx tsc --noEmit passes)
- [ ] No lint errors (npm run lint passes)
- [ ] Database migration tested in temporary Neon branch first
- [ ] Prisma client regenerated and types verified
- [ ] All edge cases from spec.md handled (empty state, errors, conflicts)
- [ ] Header navigation with icons functional for Home, Dashboard, Clients

---

## Quick Reference

**Key Files Modified**:
- `app/header.tsx` - NEW navigation with Home, Dashboard, Clients icons
- `prisma/schema.prisma` - Database schema
- `app/api/clients/route.ts` - API pagination  
- `app/clients/page.tsx` - Main table page
- `app/clients/add/page.tsx` - Add form fields
- `app/clients/[id]/edit/page.tsx` - Edit form fields
- `lib/components/clients/ClientTable.tsx` - NEW table component
- `lib/components/clients/ClientTableRow.tsx` - NEW row component
- `lib/components/clients/StatusBadge.tsx` - NEW badge component
- `lib/components/ConfirmDialog.tsx` - Enhanced dialog

**Key Dependencies**:
- `@heroicons/react` - Action icons AND navigation icons (HomeIcon, ChartBarIcon, UsersIcon, EyeIcon, PencilIcon, TrashIcon)
- `@prisma/client` - Updated with ClientStatus enum
- Existing: Tailwind CSS, React, Next.js, Clerk

**Performance Targets**:
- Initial load: <2 seconds (SC-006)
- Infinite scroll: seamless, no lag (SC-007)
- Client identification: <5 seconds for 50 clients (SC-001)

**Constitution Compliance**:
- ✅ Principle I: Audit trail preserved
- ✅ Principle II: Clerk auth maintained
- ✅ Principle III: Zero-downtime migration
- ✅ Principle IV: Full-featured pages (add/edit extended, header navigation enhanced)
- ✅ Principle VI: API-first (business logic in API route)

---

**Implementation Ready**: All design artifacts complete. Begin with Setup Phase (T001-T011), then Header Navigation (T012-T020).
