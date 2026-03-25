# Tasks: Client Management UI with Dashboard

**Input**: Design documents from `/specs/001-client-management-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-metrics.md, quickstart.md

**Feature Summary**: Comprehensive client management UI with dashboard analytics displaying real-time metrics, donut chart for order status breakdown, month-over-month comparisons, recent activity lists, and enhanced client search with full audit trail.

**Tests**: Unit tests included per plan.md requirements using Vitest + React Testing Library. Integration tests explicitly not included per user request.

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- File paths follow Next.js App Router structure as defined in plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [ ] T001 Install Recharts library for donut chart: `npm install recharts` and types: `npm install --save-dev @types/recharts`
- [ ] T002 [P] Install Vitest and React Testing Library for unit tests: `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] T003 [P] Add test script to package.json: `"test": "vitest"` and `"test:ui": "vitest --ui"`
- [ ] T004 [P] Create vitest.config.ts in project root with React and jsdom environment configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Update prisma/schema.prisma to add OrderStatus enum (pending, completed, cancelled)
- [ ] T006 Add audit fields (created_by, updated_by) to clients model in prisma/schema.prisma
- [ ] T007 Add audit fields (created_by, updated_by) and status field to orders model in prisma/schema.prisma
- [ ] T008 Add indexes for created_at and updated_at to clients model in prisma/schema.prisma
- [ ] T009 Add indexes for status and created_at to orders model in prisma/schema.prisma
- [ ] T010 Generate Prisma migration: `npx prisma migrate dev --name add_audit_fields_and_order_status`
- [ ] T011 Regenerate Prisma Client: `npx prisma generate`
- [ ] T012 [P] Create scripts/seed-dashboard-data.ts with function to generate 50 clients with random data across 3 months
- [ ] T013 [P] Add order generation logic to scripts/seed-dashboard-data.ts (3-10 orders per client, status distribution: 60% completed, 25% pending, 15% cancelled)
- [ ] T014 [P] Add idempotency check to scripts/seed-dashboard-data.ts (skip if 50+ clients already exist)
- [ ] T015 Run seed script: `npx tsx scripts/seed-dashboard-data.ts`
- [ ] T016 [P] Define Tailwind CSS theme colors in app/globals.css with CSS variables (--color-success for completed, --color-warning for pending, --color-danger for cancelled)
- [ ] T017 Create app/api/metrics/route.ts with GET handler skeleton
- [ ] T018 Implement total counts queries in app/api/metrics/route.ts (clientCount, orderCount)
- [ ] T019 Implement month comparison queries in app/api/metrics/route.ts (thisMonthClients, lastMonthClients, thisMonthOrders, lastMonthOrders)
- [ ] T020 Implement status breakdown query in app/api/metrics/route.ts (groupBy status with counts)
- [ ] T021 Implement recent clients query in app/api/metrics/route.ts (last 5, ordered by created_at DESC)
- [ ] T022 Implement recent orders query in app/api/metrics/route.ts (last 5 with client join, ordered by created_at DESC)
- [ ] T023 Implement latest clients query in app/api/metrics/route.ts (last 10, ordered by created_at DESC)
- [ ] T024 Add Clerk authentication check to app/api/metrics/route.ts (return 401 if unauthorized)
- [ ] T025 Add error handling and 500 response for database failures in app/api/metrics/route.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Search and View Clients (Priority: P1) 🎯 MVP

**Goal**: Users can search and view all clients with complete contact details and audit trail information (who created/updated and when)

**Independent Test**: Create test clients via API or seed script, navigate to /clients page, enter search terms, verify all fields display (name, email, mobile, address, created_by, updated_by, created_at, updated_at) and search filters correctly

### Unit Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T026 [P] [US1] Create __tests__/clients/search.test.tsx with unit test for search filtering by name
- [ ] T027 [P] [US1] Create __tests__/clients/client-card.test.tsx with unit test for rendering all client fields (name, email, mobile, address, audit fields)
- [ ] T028 [P] [US1] Add unit test to __tests__/clients/client-card.test.tsx for handling null mobile and address fields

### Implementation for User Story 1

- [ ] T029 [P] [US1] Create lib/components/clients/ClientSearchBar.tsx with search input component (controlled input, onChange handler)
- [ ] T030 [P] [US1] Create lib/components/clients/ClientCard.tsx to display single client with all fields (name, email, mobile?, address?, created_by, updated_by, created_at formatted, updated_at formatted)
- [ ] T031 [P] [US1] Create lib/components/clients/ClientGrid.tsx with responsive grid layout (single column mobile <768px, multi-column desktop >1024px)
- [ ] T032 [US1] Enhance app/clients/page.tsx to add ClientSearchBar component at top
- [ ] T033 [US1] Add search state management to app/clients/page.tsx (useState for search term)
- [ ] T034 [US1] Add client filtering logic to app/clients/page.tsx (filter by name, email, or mobile containing search term, case-insensitive)
- [ ] T035 [US1] Replace existing client list rendering in app/clients/page.tsx with ClientGrid component passing filtered clients
- [ ] T036 [US1] Add empty state message to app/clients/page.tsx when no clients match search
- [ ] T037 [US1] Add Tailwind styling to app/clients/page.tsx for card-based layout with proper spacing and borders
- [ ] T037a [P] [US1] Add sort state to app/clients/page.tsx (useState for sortField: 'created_at' | 'updated_at', sortDirection: 'asc' | 'desc', default: sortField='created_at', direction='desc')
- [ ] T037b [P] [US1] Create lib/components/SortableColumnHeader.tsx (column header component with sort indicator icons, click toggles direction, accepts field name and current sort state)
- [ ] T037c [US1] Add SortableColumnHeader to app/clients/page.tsx table headers for "Added Date" (created_at) and "Updated Date" (updated_at) columns, apply sort logic to client array before rendering

**Checkpoint**: At this point, User Story 1 should be fully functional - users can search clients and see all audit fields

---

## Phase 4: User Story 2 - Dashboard with Analytics (Priority: P2)

**Goal**: Users see at-a-glance overview of client and order metrics with visual donut chart showing order status breakdown, month comparisons, and recent activity lists

**Independent Test**: Create test data with varied order statuses, navigate to /dashboard page, verify donut chart displays with correct color segments, metric cards show accurate counts, recent activity lists populate, month comparison shows this/last month data

### Unit Tests for User Story 2

- [ ] T038 [P] [US2] Create __tests__/dashboard/DonutChart.test.tsx with unit test for rendering chart with mock data (3 statuses)
- [ ] T039 [P] [US2] Create __tests__/dashboard/MetricCard.test.tsx with unit test for rendering metric value and label
- [ ] T040 [P] [US2] Create __tests__/dashboard/RecentActivity.test.tsx with unit test for rendering recent clients list (last 5)
- [ ] T041 [P] [US2] Add unit test to __tests__/dashboard/RecentActivity.test.tsx for rendering recent orders list (last 5)
- [ ] T042 [P] [US2] Create __tests__/api/metrics.test.ts with unit test for API response structure validation

### Implementation for User Story 2

- [ ] T043 [P] [US2] Create lib/components/dashboard/DonutChart.tsx with Recharts PieChart component (innerRadius for donut, ResponsiveContainer)
- [ ] T044 [P] [US2] Add color mapping to lib/components/dashboard/DonutChart.tsx (completed=green-500, pending=yellow-500, cancelled=red-500)
- [ ] T045 [P] [US2] Add Tooltip component to lib/components/dashboard/DonutChart.tsx to show status and count on hover
- [ ] T046 [P] [US2] Create lib/components/dashboard/MetricCard.tsx with props for label, value, and optional comparison (this month vs last month)
- [ ] T047 [P] [US2] Add Tailwind card styling to lib/components/dashboard/MetricCard.tsx (bg-surface, border, rounded, padding)
- [ ] T048 [P] [US2] Create lib/components/dashboard/RecentActivity.tsx to display recent clients list (name, email, created_at, created_by)
- [ ] T049 [P] [US2] Add recent orders list to lib/components/dashboard/RecentActivity.tsx (description, client_name, status, created_at, created_by)
- [ ] T050 [P] [US2] Create lib/components/dashboard/LatestClients.tsx to display latest 10 clients (name, email, mobile, created_at)
- [ ] T051 [US2] Create app/dashboard/page.tsx as Server Component with Clerk authentication check
- [ ] T052 [US2] Add metrics fetch in app/dashboard/page.tsx using fetch to /api/metrics endpoint
- [ ] T053 [US2] Add responsive grid layout to app/dashboard/page.tsx (card-based, single column mobile, multi-column desktop)
- [ ] T054 [US2] Add metric cards section to app/dashboard/page.tsx (total clients, total orders, month comparisons)
- [ ] T055 [US2] Add DonutChart component to app/dashboard/page.tsx with statusBreakdown data
- [ ] T056 [US2] Add RecentActivity component to app/dashboard/page.tsx with recentClients and recentOrders data
- [ ] T057 [US2] Add LatestClients component to app/dashboard/page.tsx with latestClients data
- [ ] T058 [US2] Add month-over-month comparison logic to app/dashboard/page.tsx (calculate percentage change, show up/down indicator)
- [ ] T059 [US2] Add empty state handling to app/dashboard/page.tsx when no data exists (show 0 counts, empty chart message)
- [ ] T060 [US2] Add error boundary or try-catch to app/dashboard/page.tsx for API fetch failures

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - dashboard displays all analytics

---

## Phase 5: User Story 3 - Home Page Navigation (Priority: P3)

**Goal**: Users arriving at application home page can quickly navigate to dashboard and client search via prominent quick link cards

**Independent Test**: Navigate to home page (/), verify two quick link cards display (Dashboard, Search Clients), click each to verify navigation to /dashboard and /clients pages

### Unit Tests for User Story 3

- [ ] T061 [P] [US3] Create __tests__/home/QuickLinkCard.test.tsx with unit test for rendering card with title and icon
- [ ] T062 [P] [US3] Add unit test to __tests__/home/QuickLinkCard.test.tsx for click navigation behavior

### Implementation for User Story 3

- [ ] T063 [P] [US3] Create lib/components/ui/QuickLinkCard.tsx with props for title, description, icon, and href
- [ ] T064 [P] [US3] Add Tailwind card styling to lib/components/ui/QuickLinkCard.tsx (hover effect, cursor-pointer, card shadow)
- [ ] T065 [P] [US3] Add Next.js Link wrapper to lib/components/ui/QuickLinkCard.tsx for client-side navigation
- [ ] T066 [US3] Update app/page.tsx to add page title and description
- [ ] T067 [US3] Add QuickLinkCard for Dashboard to app/page.tsx (title: "Dashboard", href: "/dashboard", icon/description)
- [ ] T068 [US3] Add QuickLinkCard for Search Clients to app/page.tsx (title: "Search Clients", href: "/clients", icon/description)
- [ ] T069 [US3] Add responsive grid layout to app/page.tsx (2 cards side-by-side desktop, stacked mobile)
- [ ] T070 [US3] Add Clerk authentication check to app/page.tsx (redirect to login if not authenticated)

**Checkpoint**: All user stories should now be independently functional - complete navigation flow works

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T071 [P] Update README.md with feature overview, setup instructions, and seed data command
- [ ] T072 [P] Add JSDoc comments to all components in lib/components/dashboard/ for maintainability
- [ ] T073 [P] Add JSDoc comments to all components in lib/components/clients/ for maintainability
- [ ] T074 Run all unit tests to verify 100% pass rate: `npm test`
- [ ] T075 Validate dashboard performance with seed data (verify < 2 second load time for 10k orders)
- [ ] T076 Test responsive layouts on mobile viewport (verify single column stacking)
- [ ] T077 Test responsive layouts on desktop viewport (verify multi-column grid)
- [ ] T078 Verify WCAG AA contrast for donut chart colors (completed=green, pending=yellow, cancelled=red)
- [ ] T079 Run quickstart.md validation steps to ensure all implementation guide steps are accurate
- [ ] T080 Code cleanup: Remove console.logs, unused imports, and commented code across all files

---

## Phase 7: Export Functionality (FR-017)

**Purpose**: Enable Excel export of client data from search page

- [ ] T081 Install Excel generation library: `npm install xlsx` (SheetJS for .xlsx generation)
- [ ] T082 Create __tests__/api/clients/export.test.ts with unit test (verify Excel file generation, date formatting in filename)
- [ ] T083 Create __tests__/components/ExportButton.test.tsx with unit test (verify button click triggers download)
- [ ] T084 [P] Create app/api/clients/export/route.ts GET endpoint (accepts searchQuery param, returns clients as .xlsx file with Content-Disposition header)
- [ ] T085 [P] Add Excel generation logic to app/api/clients/export/route.ts (map client data to worksheet rows, apply column headers, set filename `clients_export_YYYY-MM-DD.xlsx`)
- [ ] T086 [P] Create lib/components/ExportButton.tsx (trigger download on click, show loading state during export, handle errors)
- [ ] T087 Add ExportButton component to app/clients/page.tsx (position above client list, pass current searchQuery to export endpoint)
- [ ] T088 Add export button styling using Tailwind classes (primary button style, icon + label, disabled state during loading)

**Checkpoint**: Users can export filtered client list to Excel file with accurate data and proper filename format

---

## Phase 8: Delete Functionality (FR-018)

**Purpose**: Enable soft-delete of clients with confirmation dialog

- [ ] T089 Update prisma/schema.prisma to add is_deleted, deleted_by, deleted_at fields to clients model
- [ ] T090 Generate Prisma migration: `npx prisma migrate dev --name add_soft_delete_to_clients`
- [ ] T091 Apply migration to database: verify is_deleted defaults to false for existing clients
- [ ] T092 Create __tests__/api/clients/[id]/delete.test.ts with unit test (verify soft-delete sets is_deleted=true, records deleted_by and deleted_at)
- [ ] T093 Create __tests__/components/ConfirmDialog.test.tsx with unit test (verify dialog shows client name, cancel/confirm actions)
- [ ] T094 [P] Add DELETE handler to app/api/clients/[id]/route.ts (soft-delete: SET is_deleted=true, deleted_by=userId, deleted_at=now() WHERE id=:id)
- [ ] T095 [P] Create lib/components/ConfirmDialog.tsx (reusable modal with title, message, cancel button, confirm button, close on backdrop click)
- [ ] T096 [P] Create lib/components/DeleteButton.tsx (delete icon button, opens ConfirmDialog on click, passes client name to confirmation message, shows loading state)
- [ ] T097 Add DeleteButton component to app/clients/page.tsx (add to each row in client list, trigger soft-delete API call on confirm)
- [ ] T098 Update lib/db.ts helper queries to add WHERE is_deleted = false filter to all client SELECT queries (getClients, searchClients, getClientById, getMetrics count)
- [ ] T099 Update app/api/clients/export/route.ts to exclude deleted clients (WHERE is_deleted = false in query)
- [ ] T100 Update seed script scripts/seed-dashboard-data.ts to set is_deleted=false explicitly for all seeded clients
- [ ] T101 Add delete button styling using Tailwind classes (danger button style, icon + tooltip, disabled state during loading)
- [ ] T102 Test delete confirmation flow end-to-end (verify deleted clients disappear from list, dashboard counts update, export excludes deleted clients)

**Checkpoint**: Users can soft-delete clients with confirmation, deleted clients are hidden from all views and queries, audit trail records who deleted and when

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed for parallel work)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (uses /api/metrics endpoint from foundation)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Links to US1 and US2 pages but doesn't depend on their implementation details

### Within Each User Story

1. Tests MUST be written FIRST and FAIL before implementation
2. Components should be implemented in parallel where possible ([P] markers)
3. Page assembly tasks depend on component completion
4. Story should be independently testable before moving to next priority

### Parallel Opportunities

- **Phase 1**: T001, T002, T003, T004 can all run in parallel
- **Phase 2 Foundational**: 
  - Schema updates (T005-T009) must be sequential
  - Seed script tasks (T012-T014) can run in parallel
  - CSS variables (T016) can run in parallel with seed tasks
  - API metrics tasks (T017-T023) must be mostly sequential (building on skeleton)
- **User Story 1**: 
  - All tests (T026-T028) can run in parallel
  - All components (T029-T031) can run in parallel
  - Page updates (T032-T037) must be sequential
- **User Story 2**: 
  - All tests (T038-T042) can run in parallel
  - All components (T043-T050) can run in parallel
  - Page tasks (T051-T060) must be sequential
- **User Story 3**: 
  - All tests (T061-T062) can run in parallel
  - Component tasks (T063-T065) can run in parallel
  - Page tasks (T066-T070) must be sequential
- **Polish**: Most tasks (T071-T073) can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Parallel Task: "Create __tests__/dashboard/DonutChart.test.tsx with unit test"
Parallel Task: "Create __tests__/dashboard/MetricCard.test.tsx with unit test"
Parallel Task: "Create __tests__/dashboard/RecentActivity.test.tsx with unit test"
Parallel Task: "Create __tests__/api/metrics.test.ts with unit test"

# Launch all dashboard components together:
Parallel Task: "Create lib/components/dashboard/DonutChart.tsx"
Parallel Task: "Create lib/components/dashboard/MetricCard.tsx"
Parallel Task: "Create lib/components/dashboard/RecentActivity.tsx"
Parallel Task: "Create lib/components/dashboard/LatestClients.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004) - ~10 minutes
2. Complete Phase 2: Foundational (T005-T025) - ~45 minutes (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (T026-T037) - ~90 minutes
4. **STOP and VALIDATE**: Test User Story 1 independently (search works, all fields display)
5. Deploy/demo if ready - **MVP complete with core client search functionality**

**Total MVP Time**: ~2.5 hours

### Incremental Delivery

1. Complete Setup + Foundational (T001-T025) → ~55 minutes → Foundation ready
2. Add User Story 1 (T026-T037) → ~90 minutes → Test independently → **Deploy MVP**
3. Add User Story 2 (T038-T060) → ~2 hours → Test independently → **Deploy dashboard analytics**
4. Add User Story 3 (T061-T070) → ~30 minutes → Test independently → **Deploy home page navigation**
5. Polish (T071-T080) → ~30 minutes → **Final production-ready release**

**Total Feature Time**: ~4 hours

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With 3 developers after Foundational phase completes:

1. **Team completes Setup + Foundational together** (T001-T025) - ~55 minutes
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T026-T037) - Client search enhancement
   - **Developer B**: User Story 2 (T038-T060) - Dashboard analytics
   - **Developer C**: User Story 3 (T061-T070) - Home page navigation
3. Stories complete and integrate independently
4. Full team on Polish tasks (T071-T080)

**Total Time with 3 Developers**: ~2 hours (vs 4 hours solo)

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe for parallel execution
- **[Story] labels**: Map each task to specific user story for traceability and independent testing
- **Tests First**: All test tasks (T026-T028, T038-T042, T061-T062) must fail before implementation begins
- **Foundational Phase Critical**: Cannot skip T005-T025 - all user stories depend on database schema, seed data, and API endpoint
- **Independent Stories**: Each user story (US1, US2, US3) can be tested and deployed independently
- **File Paths**: All paths follow Next.js App Router conventions per plan.md
- **Commit Strategy**: Commit after completing each phase or after each checkpoint
- **Validation**: Stop at checkpoints to validate story works independently before proceeding
- **Avoid**: Vague tasks, same-file conflicts, cross-story dependencies that break independence
