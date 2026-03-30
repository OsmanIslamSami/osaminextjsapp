# Tasks: Media Library Home Sections

**Feature**: 005-media-library-home  
**Input**: Design documents from `/specs/005-media-library-home/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks organized by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4, US5)
- File paths use Next.js App Router structure (app/, lib/)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema and core utilities that all features depend on

- [X] T001 Update Prisma schema with photos, videos, partners, home_sections models in prisma/schema.prisma
- [X] T002 Update User model with media library relations (PhotosCreatedBy, PhotosUpdatedBy, VideosCreatedBy, VideosUpdatedBy, PartnersCreatedBy, PartnersUpdatedBy) in prisma/schema.prisma
- [X] T003 Generate Prisma migration with command: npx prisma migrate dev --name add_media_library_tables
- [X] T004 Regenerate Prisma Client types with command: npx prisma generate
- [X] T005 [P] Create YouTube utility functions (extractVideoId, validateYouTubeUrl, getEmbedUrl) in lib/utils/youtube.ts
- [X] T006 [P] Create home sections utility functions (getHomeSectionConfig, getAllHomeSections, DEFAULT_SECTION_TITLES) in lib/utils/home-sections.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create seed script for home_sections table (3 default configs: photos, videos, partners) in scripts/seed-media-library.ts
- [X] T008 Create enhanced seed script for 30 sample photos with Vercel Blob placeholders in scripts/seed-media-library.ts
- [X] T009 Create enhanced seed script for 30 sample videos with YouTube URLs and thumbnails in scripts/seed-media-library.ts
- [X] T010 Create enhanced seed script for 30 sample partners with logos and URLs in scripts/seed-media-library.ts
- [X] T011 Run seed script with command: npx tsx scripts/seed-media-library.ts
- [X] T012 [P] Create base MediaPopup component with keyboard navigation (ESC, arrows) and RTL support in lib/components/media/MediaPopup.tsx
- [X] T013 [P] Add RTL direction detection hook using language context in lib/hooks/useRTLDirection.ts
- [X] T014 [P] Create reusable Slider component with RTL arrow reversal logic in lib/components/ui/Slider.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse Photos from Home Page (Priority: P1) 🎯 MVP

**Goal**: Visitors can view 5 featured photos in a slider on home page, click to view in popup with navigation, and access full photo gallery

**Independent Test**: Add photos via admin (after US4), verify 5 appear on home page, click photo to open popup, use arrows to navigate, click "View All Photos" to see gallery

### Implementation for User Story 1

- [X] T015 [P] [US1] Create GET /api/photos route with context support (home: 5 items, gallery: paginated, admin: all) in app/api/photos/route.ts
- [X] T016 [P] [US1] Implement photos query logic (featured-first + most-recent hybrid, published date filter) in app/api/photos/route.ts
- [X] T017 [P] [US1] Add relations to createdByUser for audit trail in photos query in app/api/photos/route.ts
- [X] T018 [US1] Create PhotosSection component with 5-item slider and RTL arrow reversal in lib/components/home/PhotosSection.tsx
- [X] T019 [US1] Implement slider state management (currentSlide, nextSlide, prevSlide) with RTL logic in lib/components/home/PhotosSection.tsx
- [X] T020 [US1] Add slider controls (prev/next arrows with RTL swap, dot indicators) in lib/components/home/PhotosSection.tsx
- [X] T021 [US1] Add "View All Photos" link to /photos route in lib/components/home/PhotosSection.tsx
- [X] T022 [US1] Create PhotoPopup component extending MediaPopup with photo display logic in lib/components/media/PhotoPopup.tsx
- [X] T023 [US1] Implement photo popup navigation (prev/next arrows, circular wrap, keyboard support) in lib/components/media/PhotoPopup.tsx
- [X] T024 [US1] Add RTL arrow reversal in PhotoPopup (left=next in RTL, right=prev in RTL) in lib/components/media/PhotoPopup.tsx
- [X] T025 [US1] Integrate PhotosSection into home page with visibility check in app/page.tsx
- [X] T026 [US1] Create photo gallery page (/photos) with grid layout and pagination in app/photos/page.tsx
- [X] T027 [US1] Implement gallery query (all visible photos, most-recent-first, paginated) in app/photos/page.tsx
- [X] T028 [US1] Add RTL layout support (dir attribute, text alignment) to gallery page in app/photos/page.tsx

**Checkpoint**: Photos section fully functional - 5 items on home, popup navigation, gallery page

---

## Phase 4: User Story 2 - Browse Videos from Home Page (Priority: P1)

**Goal**: Visitors can view 6 featured videos with thumbnails on home page, click to play in YouTube popup with navigation, and access full video gallery

**Independent Test**: Add videos via admin (after US4), verify 6 appear on home page with thumbnails, click video to play in popup, use arrows to navigate, click "View All Videos" to see gallery

### Implementation for User Story 2

- [X] T029 [P] [US2] Create GET /api/videos route with context support (home: 6 items, gallery: paginated, admin: all) in app/api/videos/route.ts
- [X] T030 [P] [US2] Implement videos query logic (featured-first + most-recent hybrid, published date filter) in app/api/videos/route.ts
- [X] T031 [P] [US2] Add video_id extraction from youtube_url in query response in app/api/videos/route.ts
- [X] T032 [US2] Create VideosSection component with 6-item grid (2x3) and RTL layout in lib/components/home/VideosSection.tsx
- [X] T033 [US2] Implement video card rendering (thumbnail, title, click handler) in lib/components/home/VideosSection.tsx
- [X] T034 [US2] Add "View All Videos" link to /videos route in lib/components/home/VideosSection.tsx
- [X] T035 [US2] Create VideoPopup component extending MediaPopup with YouTube iframe player in lib/components/media/VideoPopup.tsx
- [X] T036 [US2] Implement video popup navigation (prev/next arrows, circular wrap, keyboard support) in lib/components/media/VideoPopup.tsx
- [X] T037 [US2] Add RTL arrow reversal in VideoPopup (left=next in RTL, right=prev in RTL) in lib/components/media/VideoPopup.tsx
- [X] T038 [US2] Configure YouTube iframe with autoplay and enablejsapi parameters in lib/components/media/VideoPopup.tsx
- [X] T039 [US2] Integrate VideosSection into home page with visibility check in app/page.tsx
- [X] T040 [US2] Create video gallery page (/videos) with grid layout and pagination in app/videos/page.tsx
- [X] T041 [US2] Implement gallery query (all visible videos, most-recent-first, paginated) in app/videos/page.tsx
- [X] T042 [US2] Add RTL layout support to video gallery page in app/videos/page.tsx

**Checkpoint**: Videos section fully functional - 6 items on home, YouTube popup, gallery page

---

## Phase 5: User Story 3 - Browse Partners from Home Page (Priority: P2)

**Goal**: Visitors can view partner cards in a slider on home page (configurable count), click to visit partner website, and access full partners directory

**Independent Test**: Add partners via admin (after US4), verify they appear in card-by-card slider on home page, click partner to open website, access "View All Partners" page

### Implementation for User Story 3

- [X] T043 [P] [US3] Create GET /api/partners route with context support (home: configurable, gallery: all, admin: all) in app/api/partners/route.ts
- [X] T044 [P] [US3] Implement partners query logic (check home_sections config for display mode/count) in app/api/partners/route.ts
- [X] T045 [P] [US3] Apply featured-first + most-recent (by created_at) sorting in partners query in app/api/partners/route.ts
- [X] T046 [US3] Create PartnersSection component with card-by-card slider and RTL support in lib/components/home/PartnersSection.tsx
- [X] T047 [US3] Implement partner card rendering (logo, title, clickable link with target="_blank" rel="noopener noreferrer") in lib/components/home/PartnersSection.tsx
- [X] T048 [US3] Add slider controls (prev/next arrows with RTL swap, dot indicators) in lib/components/home/PartnersSection.tsx
- [X] T049 [US3] Add "View All Partners" link to /partners route in lib/components/home/PartnersSection.tsx
- [X] T050 [US3] Integrate PartnersSection into home page with visibility check in app/page.tsx
- [X] T051 [US3] Create partners directory page (/partners) with card grid layout in app/partners/page.tsx
- [X] T052 [US3] Implement partners query (all visible, most-recent-first by created_at) in app/partners/page.tsx
- [X] T053 [US3] Add RTL layout support to partners page in app/partners/page.tsx

**Checkpoint**: Partners section fully functional - configurable slider on home, clickable cards, directory page

---

## Phase 6: User Story 4 - Manage Media and Partners Content (Priority: P1)

**Goal**: Administrators can add, edit, delete photos/videos/partners through Admin Center with bilingual content, file uploads, featured flags, visibility toggles, and audit trails

**Independent Test**: Login to Admin Center, navigate to Photos tab, create new photo with EN/AR titles and image upload, verify created_by/created_at captured, edit photo to test updated_by/updated_at, toggle visibility off and verify it disappears from home page, toggle featured flag and verify it appears first

### Implementation for User Story 4

- [X] T054 [P] [US4] Create POST /api/photos route with Clerk auth, file upload (Vercel Blob), bilingual validation in app/api/photos/route.ts
- [X] T055 [P] [US4] Add file validation (5MB limit, MIME type check for jpeg/png/gif/webp) in POST /api/photos route in app/api/photos/route.ts
- [X] T056 [P] [US4] Capture created_by from Clerk userId in POST /api/photos route in app/api/photos/route.ts
- [X] T057 [P] [US4] Create PUT /api/photos/[id] route with Clerk auth and updated_by timestamp in app/api/photos/[id]/route.ts
- [X] T058 [P] [US4] Create DELETE /api/photos/[id] route with soft delete (is_deleted=true) in app/api/photos/[id]/route.ts
- [X] T059 [P] [US4] Create POST /api/videos route with Clerk auth, YouTube URL validation, thumbnail upload in app/api/videos/route.ts
- [X] T060 [P] [US4] Add YouTube URL validation (regex patterns, extractVideoId) in POST /api/videos route in app/api/videos/route.ts
- [X] T061 [P] [US4] Store video_id extracted from youtube_url in POST /api/videos route in app/api/videos/route.ts
- [X] T062 [P] [US4] Create PUT /api/videos/[id] route with Clerk auth and updated_by timestamp in app/api/videos/[id]/route.ts
- [X] T063 [P] [US4] Create DELETE /api/videos/[id] route with soft delete in app/api/videos/[id]/route.ts
- [X] T064 [P] [US4] Create POST /api/partners route with Clerk auth, logo upload, URL validation in app/api/partners/route.ts
- [X] T065 [P] [US4] Add partner website URL validation (HTTP/HTTPS protocol check) in POST /api/partners route in app/api/partners/route.ts
- [X] T066 [P] [US4] Create PUT /api/partners/[id] route with Clerk auth and updated_by timestamp in app/api/partners/[id]/route.ts
- [X] T067 [P] [US4] Create DELETE /api/partners/[id] route with soft delete in app/api/partners/[id]/route.ts
- [X] T068 [US4] Add "Photos" tab to admin layout navigation in app/admin/layout.tsx
- [X] T069 [US4] Add "Videos" tab to admin layout navigation in app/admin/layout.tsx
- [X] T070 [US4] Add "Partners" tab to admin layout navigation in app/admin/layout.tsx
- [X] T071 [US4] Add "Home Sections" tab to admin layout navigation in app/admin/layout.tsx
- [X] T072 [US4] Create admin photos management page with table view (title EN/AR, published date, featured, visible, actions) in app/admin/photos/page.tsx
- [X] T073 [US4] Implement photo list query (admin context with includeDeleted option) in app/admin/photos/page.tsx
- [X] T074 [US4] Add RTL support to photos admin table (text alignment, column order) in app/admin/photos/page.tsx
- [X] T075 [US4] Create PhotoForm component with bilingual inputs (title_en, title_ar, description_en, description_ar) in lib/components/admin/PhotoForm.tsx
- [X] T076 [US4] Add file upload field with preview to PhotoForm in lib/components/admin/PhotoForm.tsx
- [X] T077 [US4] Add published_date DatePicker to PhotoForm in lib/components/admin/PhotoForm.tsx
- [X] T078 [US4] Add is_featured checkbox to PhotoForm in lib/components/admin/PhotoForm.tsx
- [X] T079 [US4] Add is_visible toggle to PhotoForm in lib/components/admin/PhotoForm.tsx
- [X] T080 [US4] Display created_by, created_at, updated_by, updated_at (read-only) in PhotoForm edit mode in lib/components/admin/PhotoForm.tsx
- [X] T081 [US4] Integrate PhotoForm into photos admin page (Add/Edit modals) in app/admin/photos/page.tsx
- [X] T082 [US4] Add delete confirmation dialog to photos admin page in app/admin/photos/page.tsx
- [X] T083 [US4] Create admin videos management page with table view (title EN/AR, YouTube URL, published date, featured, visible, actions) in app/admin/videos/page.tsx
- [X] T084 [US4] Add RTL support to videos admin table in app/admin/videos/page.tsx
- [X] T085 [US4] Create VideoForm component with bilingual inputs and YouTube URL field in lib/components/admin/VideoForm.tsx
- [X] T086 [US4] Add YouTube URL validation to VideoForm (real-time regex check) in lib/components/admin/VideoForm.tsx
- [X] T087 [US4] Add thumbnail upload field with preview to VideoForm in lib/components/admin/VideoForm.tsx
- [X] T088 [US4] Add published_date DatePicker, is_featured checkbox, is_visible toggle to VideoForm in lib/components/admin/VideoForm.tsx
- [X] T089 [US4] Integrate VideoForm into videos admin page in app/admin/videos/page.tsx
- [X] T090 [US4] Add delete confirmation dialog to videos admin page in app/admin/videos/page.tsx
- [X] T091 [US4] Create admin partners management page with table view (title EN/AR, website URL, created date, featured, visible, actions) in app/admin/partners/page.tsx
- [X] T092 [US4] Add RTL support to partners admin table in app/admin/partners/page.tsx
- [X] T093 [US4] Create PartnerForm component with bilingual inputs and website URL field in lib/components/admin/PartnerForm.tsx
- [X] T094 [US4] Add URL validation to PartnerForm (HTTP/HTTPS protocol check) in lib/components/admin/PartnerForm.tsx
- [X] T095 [US4] Add logo upload field with preview to PartnerForm in lib/components/admin/PartnerForm.tsx
- [X] T096 [US4] Add is_featured checkbox, is_visible toggle to PartnerForm in lib/components/admin/PartnerForm.tsx
- [X] T097 [US4] Integrate PartnerForm into partners admin page in app/admin/partners/page.tsx
- [X] T098 [US4] Add delete confirmation dialog to partners admin page in app/admin/partners/page.tsx

**Checkpoint**: Admin Center fully functional - CRUD for photos/videos/partners, bilingual, file uploads, audit trails

---

## Phase 7: User Story 5 - Control Home Page Section Visibility (Priority: P2)

**Goal**: Administrators can toggle visibility of Photos/Videos/Partners sections on home page and configure partners display mode (show all vs. limit to number)

**Independent Test**: Access Home Sections settings in Admin Center, toggle Photos section off and verify it's hidden on home page, set Partners display to "limit to 8" and verify only 8 partners appear on home

### Implementation for User Story 5

- [X] T099 [P] [US5] Create GET /api/home-sections route (public read, returns all 3 configs) in app/api/home-sections/route.ts
- [X] T100 [P] [US5] Create PATCH /api/home-sections/[section_type] route with Clerk auth in app/api/home-sections/[section_type]/route.ts
- [X] T101 [P] [US5] Add validation for section_type enum (photos, videos, partners) in PATCH route in app/api/home-sections/[section_type]/route.ts
- [X] T102 [P] [US5] Add validation for partners_display_mode and partners_max_count in PATCH route in app/api/home-sections/[section_type]/route.ts
- [X] T103 [US5] Create admin home sections config page with 3 section cards (Photos, Videos, Partners) in app/admin/home-sections/page.tsx
- [X] T104 [US5] Add is_visible toggle checkbox for each section in home sections page in app/admin/home-sections/page.tsx
- [X] T105 [US5] Add partners display mode selector (radio: "Show all" vs "Limit to number") in home sections page in app/admin/home-sections/page.tsx
- [X] T106 [US5] Add partners_max_count numeric input (only enabled when mode="limit") in home sections page in app/admin/home-sections/page.tsx
- [X] T107 [US5] Add validation for partners_max_count (must be positive integer) in home sections page in app/admin/home-sections/page.tsx
- [X] T108 [US5] Display save button with real-time update to home page in home sections page in app/admin/home-sections/page.tsx
- [X] T109 [US5] Add RTL layout support to home sections config page in app/admin/home-sections/page.tsx
- [X] T110 [US5] Update PhotosSection to check home_sections config before rendering in lib/components/home/PhotosSection.tsx
- [X] T111 [US5] Update VideosSection to check home_sections config before rendering in lib/components/home/VideosSection.tsx
- [X] T112 [US5] Update PartnersSection to check home_sections config (is_visible, display mode, max count) in lib/components/home/PartnersSection.tsx

**Checkpoint**: Section visibility controls fully functional - toggle sections on/off, configure partners display

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, accessibility, responsive design, and production readiness

- [ ] T113 [P] Add loading states to all API calls in admin pages (photos, videos, partners, home-sections)
- [ ] T114 [P] Add error handling and user-friendly error messages to all API routes
- [ ] T115 [P] Add toast notifications for success/error feedback in admin pages
- [ ] T116 [P] Implement image lazy loading for gallery pages (photos, videos, partners)
- [ ] T117 [P] Add responsive breakpoints for mobile/tablet views in all components
- [ ] T118 [P] Test slider controls on touch devices (swipe gestures) in PhotosSection, VideosSection, PartnersSection
- [ ] T119 [P] Add ARIA labels and roles to all popups for screen reader accessibility
- [ ] T120 [P] Test keyboard navigation (Tab, Enter, Escape, Arrows) across all interactive elements
- [ ] T121 [P] Add focus trap to popups (PhotoPopup, VideoPopup) for accessibility
- [ ] T122 [P] Test RTL layout in all components (sliders, popups, forms, tables) with Arabic language
- [ ] T123 [P] Verify RTL arrow reversal in all sliders and popups (left=next, right=prev in Arabic)
- [ ] T124 [P] Add loading skeletons for home page sections while data loads
- [ ] T125 [P] Optimize images with Next.js Image component (automatic WebP, lazy load, blur placeholder)
- [ ] T126 [P] Add dashboard metrics cards (total photos count, total videos count, total partners count) in app/dashboard/page.tsx
- [ ] T127 [P] Test upload failures and file size limit errors (5MB) in admin forms
- [ ] T128 [P] Test invalid YouTube URL error handling in VideoForm
- [ ] T129 [P] Test invalid website URL error handling in PartnerForm
- [ ] T130 [P] Add ExcelJS export for photos, videos, partners lists in admin pages
- [ ] T131 [P] Test circular navigation in popups (last→first, first→last)
- [ ] T132 [P] Test future published dates (items hidden until publish date) in photos and videos
- [ ] T133 [P] Test featured flag priority (featured items appear first regardless of date)
- [ ] T134 [P] Test visibility toggles (hidden items don't appear on home/gallery)
- [ ] T135 [P] Test soft delete (deleted items hidden but preserved in database)
- [ ] T136 [P] Verify audit trail fields (created_by, updated_by, timestamps) in all CRUD operations
- [ ] T137 [P] Test empty states (no photos, no videos, no partners scenarios)
- [ ] T138 [P] Test edge case: more than 5 featured photos (show 5 most recent featured)
- [ ] T139 [P] Test edge case: fewer than 5 photos available (show only available, no placeholders)
- [ ] T140 [P] Test partners display mode changes (all→limit, limit→all) with immediate home page update
- [ ] T141 [P] Add meta tags and OpenGraph images for gallery pages SEO
- [ ] T142 [P] Run Lighthouse audit on home page and gallery pages (target: 90+ performance)
- [ ] T143 Run final E2E testing on all user stories in both English and Arabic modes

---

## Dependencies & Parallel Execution

### Dependency Graph (User Story Completion Order)

```
Phase 1 (Setup) & Phase 2 (Foundational) - MUST complete first
    ↓
┌───────────────────────────────────────┐
│  US1 (Photos), US2 (Videos),         │  ← Can implement in parallel
│  US3 (Partners), US4 (Admin CRUD)    │
└───────────────────────────────────────┘
    ↓
US5 (Section Visibility) - Depends on US4 for admin infrastructure
    ↓
Phase 8 (Polish) - Final integration and testing
```

### Parallel Execution Examples

**Phase 1-2 (Setup)**: All tasks can run in parallel after T003 (migration) completes
- T005, T006 (utilities) ← parallel
- T007-T011 (seed scripts) ← sequential (T011 runs after T007-T010)
- T012, T013, T014 (components) ← parallel

**Phase 3-6 (User Stories)**: After foundational phase completes
- US1 (Photos): T015-T028
- US2 (Videos): T029-T042  ← Can run in parallel with US1
- US3 (Partners): T043-T053  ← Can run in parallel with US1, US2
- US4 (Admin): T054-T098  ← Can run in parallel with US1, US2, US3 (many [P] tasks)

**Phase 7 (Visibility)**: After US4 admin infrastructure exists
- T099-T112 (mostly parallel except T110-T112 depend on component updates)

**Phase 8 (Polish)**: After all user stories complete
- T113-T143 (most can run in parallel)

---

## Implementation Strategy

### MVP First (Recommended)

**MVP = User Story 1 (Photos)**: Delivers immediate value with photo browsing

1. Complete Phase 1 & 2 (Setup)
2. Implement US1 (T015-T028) - Photos section end-to-end
3. Implement US4 (T054-T058, T068, T072-T082) - Photos admin only
4. Test MVP: Add photos via admin, view on home page, open popup, access gallery

**Iteration 2**: Add Videos (US2 + US4 videos portion)

**Iteration 3**: Add Partners (US3 + US4 partners portion)

**Iteration 4**: Add visibility controls (US5)

**Final**: Polish (Phase 8)

### Incremental Delivery Benefits

- Each user story delivers independent value
- Can deploy US1 to production before US2/US3 complete
- Early feedback from users on photo browsing patterns
- Reduced risk by testing each feature independently

---

## Task Summary

- **Total Tasks**: 143
- **Setup & Foundation**: 14 tasks (T001-T014)
- **User Story 1 (Photos)**: 14 tasks (T015-T028)
- **User Story 2 (Videos)**: 14 tasks (T029-T042)
- **User Story 3 (Partners)**: 11 tasks (T043-T053)
- **User Story 4 (Admin CRUD)**: 45 tasks (T054-T098)
- **User Story 5 (Visibility)**: 14 tasks (T099-T112)
- **Polish & Testing**: 31 tasks (T113-T143)

**Parallel Opportunities**: 85+ tasks marked [P] can run in parallel within their phase

**Estimated Timeline**:
- Phase 1-2 (Setup): 2-3 hours
- US1 (Photos): 4-5 hours
- US2 (Videos): 3-4 hours (reuses popup patterns)
- US3 (Partners): 2-3 hours (simpler than photos/videos)
- US4 (Admin CRUD): 6-8 hours (largest phase, many forms)
- US5 (Visibility): 2 hours
- Phase 8 (Polish): 3-4 hours

**Total**: ~22-29 hours for complete implementation

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] All 64 functional requirements (FR-001 to FR-064) from spec.md implemented
- [ ] All 10 success criteria (SC-001 to SC-010) measured and passing
- [ ] All 5 user stories independently testable and functional
- [ ] RTL layout works correctly in all components (sliders, popups, tables, forms)
- [ ] Slider arrows reverse direction in Arabic mode (verified in Photos, Videos, Partners sections)
- [ ] Admin tabs added to admin layout (Photos, Videos, Partners, Home Sections)
- [ ] 30 sample items seeded for photos, videos, partners
- [ ] Audit trails capture created_by, updated_by, created_at, updated_at correctly
- [ ] Featured flags work (featured items appear first on home page)
- [ ] Visibility toggles work (hidden items don't appear on home/gallery)
- [ ] Published dates work (future dates hide items until publish date)
- [ ] Soft deletes work (deleted items preserved but hidden)
- [ ] File uploads work (5MB limit enforced)
- [ ] YouTube URL validation works (invalid URLs rejected)
- [ ] Partner URL validation works (HTTP/HTTPS required)
- [ ] Popups support keyboard navigation (Escape, Arrows)
- [ ] Circular navigation works (first←→last wrapping)
- [ ] Mobile responsive (no horizontal scroll, touch-friendly)
- [ ] Performance targets met (<1s photo load, <500ms popup, <100ms slider)
- [ ] Accessibility standards met (ARIA labels, focus trap, keyboard navigation)
