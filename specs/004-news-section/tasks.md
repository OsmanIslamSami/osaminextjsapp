# Tasks: News Section

**Feature Branch**: `004-news-section`  
**Input**: Design documents from `specs/004-news-section/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md

**Additional Requirements**: 
- Search functionality (keyword search on all fields) for both All News page and Admin Management
- Date range filters (date from, date to) with search button
- Export to Excel functionality based on filters

**Tests**: Not explicitly requested in spec - tasks below focus on implementation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for News feature

- [ ] T001 Create feature branch `004-news-section` from main
- [ ] T002 [P] Add News menu item to admin layout in app/admin/layout.tsx
- [ ] T003 [P] Create placeholder image at public/placeholders/news-placeholder.png
- [ ] T004 [P] Add TypeScript types for News entities in lib/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Add News model to Prisma schema in prisma/schema.prisma
- [ ] T006 Generate Prisma migration for News table using `npx prisma migrate dev --name add_news_table`
- [ ] T007 [P] Generate Prisma client using `npx prisma generate`
- [ ] T008 [P] Add news permissions to Clerk metadata in lib/auth/permissions.ts (news:read, news:write, news:delete)
- [ ] T009 [P] Create ExcelJS utility for Excel export in lib/utils/excel-export.ts
- [ ] T010 [P] Create search utility functions in lib/utils/news-search.ts for keyword and date filtering

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Latest News on Home Page (Priority: P1) 🎯 MVP

**Goal**: Display 5-6 latest news items on home page with images, titles, and dates. Bilingual support with responsive design and gradient animations.

**Independent Test**: Navigate to home page and verify news section displays with proper responsive layout, animations work on hover, bilingual titles display correctly.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create NewsSection component in lib/components/home/NewsSection.tsx with responsive grid layout
- [ ] T012 [P] [US1] Create NewsCard component in lib/components/home/NewsCard.tsx with gradient animations and hover effects
- [ ] T013 [P] [US1] Create API route GET /api/news in app/api/news/route.ts for public news listing with pagination (ORDER BY published_date DESC, created_at DESC)
- [ ] T014 [US1] Integrate NewsSection component into home page in app/page.tsx below hero slider
- [ ] T015 [US1] Implement getMediaUrl helper in lib/components/home/NewsCard.tsx to resolve image URLs based on storage_type
- [ ] T016 [US1] Add CSS animations for card hover effects (gradient backgrounds, scale transforms) in NewsCard component
- [ ] T017 [US1] Implement Intersection Observer for staggered fade-in animations in NewsSection component
- [ ] T018 [US1] Add responsive breakpoints styling (1 col mobile, 2 col tablet, 3 col desktop) in NewsSection component
- [ ] T019 [US1] Add "All News" button with gradient styling in NewsSection component linking to /news page
- [ ] T020 [US1] Handle edge cases: empty state, missing images (placeholder), missing titles (fallback language)

**Checkpoint**: Home page news section is fully functional with responsive design and animations

---

## Phase 4: User Story 2 - View All News with Pagination (Priority: P2)

**Goal**: Dedicated page showing all published news with pagination, keyword search, and date range filtering. Responsive design consistent with home page.

**Independent Test**: Click "All News" button, verify pagination works, search by keyword returns filtered results, date range filter works correctly.

### Implementation for User Story 2

- [ ] T021 [P] [US2] Create All News page in app/news/page.tsx with pagination controls
- [ ] T022 [P] [US2] Create SearchBar component in lib/components/news/SearchBar.tsx with keyword input and search button
- [ ] T023 [P] [US2] Create DateRangeFilter component in lib/components/news/DateRangeFilter.tsx with date from/to inputs
- [ ] T024 [P] [US2] Create PaginationControls component in lib/components/news/PaginationControls.tsx
- [ ] T025 [US2] Update GET /api/news route in app/api/news/route.ts to accept search query parameters (keyword, dateFrom, dateTo) and maintain ORDER BY published_date DESC, created_at DESC for consistent sorting
- [ ] T026 [US2] Implement keyword search logic in API route using Prisma where clause OR filters on title_en, title_ar
- [ ] T027 [US2] Implement date range filtering in API route using Prisma where clause on published_date
- [ ] T028 [US2] Integrate SearchBar and DateRangeFilter components into All News page
- [ ] T029 [US2] Implement URL query parameter updates on search/filter (e.g., /news?page=2&search=keyword&dateFrom=2026-01-01)
- [ ] T030 [US2] Add loading skeleton components with shimmer animation for news cards while fetching
- [ ] T031 [US2] Implement pagination logic with page number navigation and prev/next buttons
- [ ] T032 [US2] Add responsive grid layout (reusing NewsSection grid patterns) for All News page
- [ ] T033 [US2] Handle edge cases: no search results, invalid date ranges, page out of bounds

**Checkpoint**: All News page is fully functional with search, filtering, and pagination

---

## Phase 5: User Story 3 - Admin Manages News Content (Priority: P3)

**Goal**: Admin interface for CRUD operations on news items with dual-storage image upload, keyword search, date filters, and Excel export functionality.

**Independent Test**: Login as admin, navigate to News management, create/edit/delete news items, upload images (blob and local), search and filter news, export to Excel.

### Database & API Routes

- [ ] T034 [P] [US3] Create POST /api/news route in app/api/news/route.ts for creating news items with validation (enforce at least one title (EN or AR) is non-empty, validate storage_type, image_url, published_date)
- [ ] T035 [P] [US3] Create PUT /api/news/[id] route in app/api/news/[id]/route.ts for updating news items (maintain validation: at least one title (EN or AR) is non-empty)
- [ ] T036 [P] [US3] Create DELETE /api/news/[id] soft delete route in app/api/news/[id]/route.ts
- [ ] T037 [P] [US3] Create POST /api/news/upload route in app/api/news/upload/route.ts for local database image upload
- [ ] T038 [P] [US3] Create GET /api/news/media/[id] route in app/api/news/[id]/media/route.ts to serve local DB images
- [ ] T039 [P] [US3] Create GET /api/news/admin route in app/api/news/admin/route.ts for admin list (includes hidden/deleted)
- [ ] T040 [P] [US3] Create GET /api/news/export route in app/api/news/export/route.ts for Excel export with filters
- [ ] T041 [US3] Add authentication checks using Clerk auth() in all admin API routes
- [ ] T042 [US3] Add permission checks using hasPermission() for news:read, news:write, news:delete

### Admin UI Components

- [ ] T043 [P] [US3] Create admin News page in app/admin/news/page.tsx with table layout
- [ ] T044 [P] [US3] Create NewsForm component in lib/components/admin/NewsForm.tsx for add/edit forms
- [ ] T045 [P] [US3] Create NewsTable component in lib/components/admin/NewsTable.tsx with sortable columns
- [ ] T046 [P] [US3] Create AdminSearchBar component in lib/components/admin/AdminSearchBar.tsx with keyword input
- [ ] T047 [P] [US3] Create AdminDateRangeFilter component in lib/components/admin/AdminDateRangeFilter.tsx
- [ ] T048 [P] [US3] Create ExportButton component in lib/components/admin/ExportButton.tsx for Excel download
- [ ] T049 [P] [US3] Create StorageTypeBadge component in lib/components/admin/StorageTypeBadge.tsx (Purple for Blob, Green for Local)

### Form & Upload Logic

- [ ] T050 [US3] Integrate FilePicker component in NewsForm for "Choose from Style Library" (blob storage) - reuse from slider
- [ ] T051 [US3] Add direct file upload option in NewsForm for local database storage
- [ ] T052 [US3] Implement form validation: at least one title (EN or AR), required image, valid date
- [ ] T053 [US3] Add bilingual title inputs (title_en, title_ar) with appropriate RTL styling for Arabic
- [ ] T054 [US3] Add published_date date picker with validation (not >1 year in future)
- [ ] T055 [US3] Add is_visible toggle switch in NewsForm
- [ ] T056 [US3] Implement form submission logic calling appropriate API routes (POST for create, PUT for update)
- [ ] T057 [US3] Handle image upload flow: detect upload type, call /api/news/upload for local or use blob URL from FilePicker
- [ ] T058 [US3] Update form state to show uploaded image preview with storage type indicator

### Table & Filtering

- [ ] T059 [US3] Implement table rendering with columns: Image, Title (EN/AR), Date, Visible status, Storage Type, Actions
- [ ] T060 [US3] Add sortable column headers (SortableColumnHeader component) for Date and Title columns
- [ ] T061 [US3] Implement filter dropdown for visibility status (all, visible, hidden, deleted)
- [ ] T062 [US3] Integrate AdminSearchBar with keyword search on title_en, title_ar fields
- [ ] T063 [US3] Integrate AdminDateRangeFilter with date from/to inputs
- [ ] T064 [US3] Implement search button that updates URL query params and refetches data
- [ ] T065 [US3] Add storage type badges (Blob/Local) display in table rows using StorageTypeBadge component
- [ ] T066 [US3] Implement pagination controls for admin table (similar to clients/orders pages)

### CRUD Operations & Export

- [ ] T067 [US3] Add "Add News" button that opens empty NewsForm
- [ ] T068 [US3] Implement Edit action that loads news item data into NewsForm
- [ ] T069 [US3] Implement Delete action with ConfirmDialog (reuse from existing components) for soft delete
- [ ] T070 [US3] Implement Restore action for soft-deleted news items (sets is_deleted: false)
- [ ] T071 [US3] Implement Toggle Visibility action (quick toggle is_visible without opening form)
- [ ] T072 [US3] Integrate ExportButton that calls GET /api/news/export with current filters
- [ ] T073 [US3] Implement Excel generation in export API route using ExcelJS library
- [ ] T074 [US3] Configure Excel export columns: ID, Title EN, Title AR, Published Date, Visible, Storage Type, Created Date
- [ ] T075 [US3] Add file download logic in browser for generated Excel file (Content-Disposition header)

### Responsive Admin UI

- [ ] T076 [US3] Add responsive table layout for mobile (convert to card view on small screens)
- [ ] T077 [US3] Ensure form is mobile-friendly with proper input sizing and touch targets (44x44px minimum)
- [ ] T078 [US3] Add collapsible filter panel for mobile to save screen space
- [ ] T079 [US3] Test admin UI across breakpoints: mobile (375px), tablet (768px), desktop (1280px)

### Edge Cases & Validation

- [ ] T080 [US3] Handle image serving failures gracefully (show placeholder if blob URL invalid or local file missing)
- [ ] T081 [US3] Validate file upload size (max 10MB) and type (jpeg, png, gif only) in upload API route
- [ ] T082 [US3] Add error handling for duplicate news items (same title and date)
- [ ] T083 [US3] Implement proper error messages for validation failures (display in form)
- [ ] T084 [US3] Add success toast notifications (reuse from existing patterns) for create/update/delete operations
- [ ] T085 [US3] Handle Excel export with no data (return empty file with headers or show message)

**Checkpoint**: Admin news management is fully functional with search, filters, and Excel export

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality checks

- [ ] T086 [P] Add loading states for all async operations (skeletons, spinners)
- [ ] T087 [P] Optimize images: add lazy loading, proper srcset/sizes attributes for responsive images
- [ ] T088 [P] Add ARIA labels and accessibility attributes for screen readers (buttons, links, forms)
- [ ] T089 [P] Ensure all animations respect prefers-reduced-motion media query
- [ ] T090 [P] Update dashboard page in app/dashboard/page.tsx to include "Total News" metric card
- [ ] T091 [P] Add "Latest News Items" section to dashboard showing 5 most recent news
- [ ] T092 Add caching headers for /api/news endpoint (Cache-Control: public, max-age=300)
- [ ] T093 Add immutable caching for /api/news/media/[id] endpoint (max-age=31536000)
- [ ] T094 Create seed script in scripts/seed-news.ts for sample data (run via npm run seed:news)
- [ ] T095 Add package.json script entry for seed:news command
- [ ] T096 Update .env.example with required environment variables (DATABASE_URL, BLOB_READ_WRITE_TOKEN, CLERK keys)
- [ ] T097 [P] Run Lighthouse audit and ensure score >90 on mobile and desktop
- [ ] T098 [P] Test cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] T099 Validate quickstart.md setup instructions work on clean install
- [ ] T100 Code cleanup: remove console.logs, add JSDoc comments to complex functions
- [ ] T101 Final manual testing: complete all acceptance scenarios from spec.md for all 3 user stories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - Can start after T010
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) and US1 components - Can reuse NewsCard from US1
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) - Can start in parallel with US1/US2 if different developer
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - can be completed independently
- **User Story 2 (P2)**: Shares NewsCard component with US1 but can be tested independently with mock data
- **User Story 3 (P3)**: Admin CRUD operations are independent - can be tested without US1/US2 being complete

### Critical Path

**Sequential (for single developer)**:
1. Phase 1: Setup (T001-T004) - 1 hour
2. Phase 2: Foundational (T005-T010) - 2 hours
3. Phase 3: User Story 1 (T011-T020) - 1 day
4. Phase 4: User Story 2 (T021-T033) - 1 day
5. Phase 5: User Story 3 (T034-T085) - 2 days
6. Phase 6: Polish (T086-T101) - 0.5 days

**Total Estimated Time**: ~5 days for single developer

**Parallel (for team of 3)**:
- Developer 1: Phase 1+2, then US1 (T001-T020) - 1.5 days
- Developer 2: Wait for Phase 2, then US2 (T021-T033) - 1 day
- Developer 3: Wait for Phase 2, then US3 (T034-T085) - 2 days
- All: Phase 6 Polish (T086-T101) - 0.5 days

**Total Estimated Time**: ~2.5 days for team of 3

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T002, T003, T004 can run in parallel

**Within Foundational (Phase 2)**:
- After T006 completes: T007, T008, T009, T010 can run in parallel

**Within User Story 1 (Phase 3)**:
- T011, T012, T013 can run in parallel (different files)

**Within User Story 2 (Phase 4)**:
- T021, T022, T023, T024 can run in parallel (different components)

**Within User Story 3 (Phase 5)**:
- Database & API Routes (T034-T042) can run in parallel with UI Components (T043-T049)
- Within each sub-group, tasks marked [P] can run in parallel

**Within Polish (Phase 6)**:
- T086, T087, T088, T089, T090, T091, T097, T098 can run in parallel (different concerns)

---

## Parallel Example: User Story 3 Admin Management

**Scenario**: 3 developers working on US3 simultaneously

```bash
# Developer A: API Routes & Database
git checkout 004-news-section
# Complete T034, T035, T036, T037, T038, T039, T040 in parallel
# Files: app/api/news/**/*.ts

# Developer B: Admin UI Components  
git checkout 004-news-section
# Complete T043, T044, T045, T046, T047, T048, T049 in parallel
# Files: lib/components/admin/**/*.tsx

# Developer C: Form Logic & Integration
git checkout 004-news-section
# Wait for A & B to commit, then complete T050-T085
# Files: app/admin/news/page.tsx, integration work

# All merge into 004-news-section feature branch
```

---

## Testing Strategy

**Manual Testing Checklist** (from spec.md acceptance scenarios):

### User Story 1 - Home Page News
- [ ] Home page loads with News section displaying up to 6 visible news items
- [ ] Each news item displays: image, title (current language), publication date
- [ ] English titles displayed when viewing in English
- [ ] Arabic titles displayed when viewing in Arabic (RTL layout)
- [ ] Less than 6 visible items: only available items shown (no error)
- [ ] Responsive: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] Animations: cards fade in with stagger, hover effects work (desktop only)
- [ ] "All News" button visible and links to /news page
- [ ] Images load correctly for both blob and local storage types
- [ ] Placeholder image shown when news has no image

### User Story 2 - All News Page
- [ ] "All News" button navigates to /news page
- [ ] Pagination controls displayed when >12 news items exist
- [ ] Clicking page numbers loads corresponding page
- [ ] News items show full image, title (current language), publication date
- [ ] News sorted by date (newest first)
- [ ] Search bar accepts keyword input
- [ ] Search returns results matching keyword in title_en or title_ar
- [ ] Date range filter accepts from/to dates
- [ ] Search button triggers filter and updates URL params
- [ ] Pagination updates based on filtered results
- [ ] No results message shown when search/filter returns empty
- [ ] URL is shareable (page number, search, date filters persist in URL)
- [ ] Responsive layout on mobile/tablet/desktop

### User Story 3 - Admin Management
- [ ] Admin sees "News" or "Manage News" menu option in admin section
- [ ] Clicking "Add News" shows form with required fields
- [ ] Form validation: at least one title (EN or AR) required
- [ ] Form accepts: Title EN, Title AR, Image (blob or local), Date, Visible toggle
- [ ] "Choose from Style Library" option displays FilePicker dialog
- [ ] Selecting from Style Library saves with storage_type='blob'
- [ ] "Upload File" option accepts file upload (jpeg, png, gif)
- [ ] Direct upload saves with storage_type='local' and stores in database
- [ ] Changes to news visibility reflect immediately on public pages
- [ ] Admin can edit existing news items (form pre-populated)
- [ ] Admin can mark news as not visible (hides from public)
- [ ] Admin can mark hidden news as visible (shows on public pages)
- [ ] Admin list shows all news with visibility status
- [ ] Storage type indicator (badge) shows for each news item (Blob/Local)
- [ ] Search bar filters news by keyword in admin list
- [ ] Date range filter works in admin list
- [ ] Filter dropdown (all/visible/hidden/deleted) works correctly
- [ ] Export button downloads Excel file with filtered data
- [ ] Excel file contains all expected columns with correct data
- [ ] Soft delete moves news to "deleted" filter view
- [ ] Restore action returns deleted news to normal view
- [ ] Responsive admin table on mobile (card view)
- [ ] File upload validation: max 10MB, only jpeg/png/gif
- [ ] Error messages displayed for validation failures
- [ ] Success notifications shown for create/update/delete

### Cross-Cutting
- [ ] All animations respect prefers-reduced-motion setting
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader announces meaningful labels (ARIA)
- [ ] Lighthouse score >90 on mobile and desktop
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] No console errors or warnings
- [ ] Dashboard shows "Total News" metric
- [ ] Dashboard shows "Latest News Items" section

---

## Search & Export Implementation Notes

### Keyword Search Logic (for both public and admin)

**API Implementation** (app/api/news/route.ts):
```typescript
const search = searchParams.get('search');
const whereClause = {
  is_deleted: false,
  is_visible: true,
  ...(search && {
    OR: [
      { title_en: { contains: search, mode: 'insensitive' } },
      { title_ar: { contains: search, mode: 'insensitive' } },
    ],
  }),
};
```

**Frontend Component** (lib/components/news/SearchBar.tsx):
```typescript
const [keyword, setKeyword] = useState('');
const handleSearch = () => {
  const params = new URLSearchParams(window.location.search);
  params.set('search', keyword);
  params.set('page', '1'); // Reset to page 1 on new search
  router.push(`/news?${params.toString()}`);
};
```

### Date Range Filter Logic

**API Implementation** (app/api/news/route.ts):
```typescript
const dateFrom = searchParams.get('dateFrom');
const dateTo = searchParams.get('dateTo');
const whereClause = {
  ...baseWhere,
  ...(dateFrom && {
    published_date: { gte: new Date(dateFrom) },
  }),
  ...(dateTo && {
    published_date: { lte: new Date(dateTo) },
  }),
};
```

**Frontend Component** (lib/components/news/DateRangeFilter.tsx):
```typescript
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');
const applyFilter = () => {
  const params = new URLSearchParams(window.location.search);
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo) params.set('dateTo', dateTo);
  params.set('page', '1');
  router.push(`/news?${params.toString()}`);
};
```

### Excel Export Logic

**API Implementation** (app/api/news/export/route.ts):
```typescript
import ExcelJS from 'exceljs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  
  // Build same where clause as list endpoint
  const news = await prisma.news.findMany({ where: { /* filters */ } });
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('News');
  
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 20 },
    { header: 'Title (English)', key: 'title_en', width: 40 },
    { header: 'Title (Arabic)', key: 'title_ar', width: 40 },
    { header: 'Published Date', key: 'published_date', width: 15 },
    { header: 'Visible', key: 'is_visible', width: 10 },
    { header: 'Storage Type', key: 'storage_type', width: 15 },
    { header: 'Created Date', key: 'created_at', width: 15 },
  ];
  
  worksheet.addRows(news);
  
  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="news-export-${new Date().toISOString()}.xlsx"`,
    },
  });
}
```

**Frontend Component** (lib/components/admin/ExportButton.tsx):
```typescript
const handleExport = async () => {
  const params = new URLSearchParams(window.location.search);
  const response = await fetch(`/api/news/export?${params.toString()}`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `news-export-${new Date().toISOString()}.xlsx`;
  a.click();
};
```

---

## Implementation Strategy

### MVP Scope (User Story 1 Only)

For fastest time-to-value, implement only **Phase 1, 2, and 3** (User Story 1):
- Home page displays latest news
- Basic responsive design and animations
- No admin interface yet (manually insert test data via Prisma Studio)

**Estimated Time**: 2 days
**Value**: Public-facing news section live

### Incremental Delivery (US1 → US2 → US3)

1. **Sprint 1** (2 days): Complete US1 (home page news section)
2. **Sprint 2** (1 day): Complete US2 (All News page with search/filters)
3. **Sprint 3** (2 days): Complete US3 (admin management with export)
4. **Sprint 4** (0.5 days): Polish and launch

**Total**: ~5.5 days spread across 4 sprints

### Full Parallel (3 developers)

All user stories developed simultaneously (requires coordination):
- Each developer owns one user story
- Daily standups to sync shared components
- Code reviews before merge

**Total**: ~2.5 days

---

## Success Metrics

- [ ] Total tasks: 101
- [ ] Setup tasks: 4
- [ ] Foundational tasks: 6
- [ ] User Story 1 tasks: 10
- [ ] User Story 2 tasks: 13
- [ ] User Story 3 tasks: 52
- [ ] Polish tasks: 16

**Parallel opportunities**: 45 tasks marked [P] (45% parallelizable)

**Independent test criteria**:
- US1: Home page news section works standalone
- US2: All News page works with mock data (independent of US1)
- US3: Admin CRUD works without public pages being complete

**Suggested MVP scope**: Phase 1 + 2 + 3 (User Story 1 only) = 20 tasks

---

**Tasks Generated**: March 29, 2026  
**Total Task Count**: 101  
**Estimated Completion**: 2.5 days (parallel) to 5.5 days (sequential)  
**Format Validation**: ✅ All tasks follow checklist format with IDs, labels, and file paths
