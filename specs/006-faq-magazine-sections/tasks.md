# Tasks: FAQ and Magazine Home Page Sections

**Input**: Design documents from `/specs/006-faq-magazine-sections/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Branch**: `006-faq-magazine-sections`  
**Date**: April 13, 2026

**Tests**: Tests are NOT explicitly required in the specification. Test tasks are omitted from this implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, etc.)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema, migrations, and TypeScript types

- [X] T001 Add FAQ model to prisma/schema.prisma (question_en, question_ar, answer_en, answer_ar, is_favorite, display_order, is_deleted, audit fields, User FK relations, indexes)
- [X] T002 Add Magazine model to prisma/schema.prisma (title_en, title_ar, description_en, description_ar, image_url, storage_type, file_data, file_name, file_size, mime_type, download_link, published_date, is_deleted, audit fields, User FK relations, indexes)
- [X] T003 Update User model in prisma/schema.prisma to add FAQ and Magazine relation fields (faqCreated, faqUpdated, magazinesCreated, magazinesUpdated)
- [X] T004 Run `npx prisma migrate dev --name add_faq_magazines` to create migration
- [X] T005 Run `npx prisma generate` to generate updated Prisma client
- [X] T006 [P] Add FAQ and Magazine TypeScript interfaces to lib/types.ts (FAQ, FAQFormData, Magazine, MagazineFormData, PaginatedResponse<T>)

**Checkpoint**: Database schema ready, TypeScript types available

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities and helper patterns that user stories will depend on

- [X] T007 [P] Create file validation utility function in lib/utils/fileValidation.ts (validate image format: JPEG/PNG/WebP/GIF, validate PDF format, check file size limits: 10MB images, 50MB PDFs)
- [X] T008 [P] Create bilingual field accessor utility in lib/utils/bilingual.ts (helpers to get `field_${language}` with type safety)

**Checkpoint**: Shared utilities ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin Creates and Manages FAQ Content (Priority: P1) 🎯 MVP

**Goal**: Admin can create, edit, delete FAQ entries with bilingual content. This is the foundation for the FAQ feature.

**Independent Test**: Admin adds a new FAQ in both English and Arabic, verifies it appears in FAQ list, edits it, then soft-deletes it and confirms it no longer appears.

### API Endpoints for User Story 1

- [X] T009 [P] [US1] Implement GET /api/faq route in app/api/faq/route.ts (list FAQs with pagination, filter by is_deleted=false, support home_page and favorites_only query params, return PaginatedResponse)
- [X] T010 [P] [US1] Implement POST /api/faq route in app/api/faq/route.ts (create FAQ, validate bilingual fields, Clerk auth + admin check, set created_by/updated_by, return created FAQ)
- [X] T011 [P] [US1] Implement GET /api/faq/[id] route in app/api/faq/[id]/route.ts (get single FAQ by ID, filter is_deleted=false, Clerk auth required)
- [X] T012 [P] [US1] Implement PUT /api/faq/[id] route in app/api/faq/[id]/route.ts (update FAQ, validate fields, Clerk auth + admin check, update updated_by field)
- [X] T013 [P] [US1] Implement DELETE /api/faq/[id] route in app/api/faq/[id]/route.ts (soft-delete FAQ by setting is_deleted=true, Clerk auth + admin check)

### UI Components for User Story 1

- [X] T014 [US1] Create FAQForm component in lib/components/faq/FAQForm.tsx (bilingual question/answer inputs, is_favorite checkbox, form validation, submit handler, loading states, use useTranslation for labels)
- [X] T015 [US1] Create FAQList component in lib/components/faq/FAQList.tsx (display FAQ list in table/card format, show edit/delete buttons, handle soft-delete with confirmation, use useTranslation)

### Admin Pages for User Story 1

- [X] T016 [US1] Create admin FAQ list page in app/admin/faq/page.tsx (fetch FAQs from API with pagination, render FAQList component, add "Add New FAQ" button linking to /admin/faq/add, Clerk auth check)
- [X] T017 [US1] Create admin FAQ add page in app/admin/faq/add/page.tsx (render FAQForm component, handle form submission to POST /api/faq, redirect to list on success, show toast notifications)
- [X] T018 [US1] Create admin FAQ edit page in app/admin/faq/[id]/edit/page.tsx (fetch FAQ data from GET /api/faq/[id], pre-populate FAQForm, handle update to PUT /api/faq/[id], redirect on success)

**Checkpoint**: Admin can fully manage FAQ content (create, read, update, delete). FAQ feature foundation is complete.

---

## Phase 4: User Story 2 - Admin Manages Magazine Content with Image Uploads (Priority: P1) 🎯 MVP

**Goal**: Admin can create, edit, delete Magazine entries with bilingual content, cover images, and PDF downloads. This is the foundation for the Magazine feature.

**Independent Test**: Admin creates Magazine with image upload and PDF link, verifies it appears in Magazine list, edits it with new image, deletes it and confirms removal.

### API Endpoints for User Story 2

- [X] T019 [P] [US2] Implement GET /api/magazines route in app/api/magazines/route.ts (list Magazines with pagination, filter is_deleted=false, order by published_date DESC, support home_page query param, return PaginatedResponse)
- [X] T020 [P] [US2] Implement POST /api/magazines route in app/api/magazines/route.ts (create Magazine with FormData, validate bilingual fields, validate image format/size, validate PDF format/size, upload cover image to Vercel Blob, upload PDF to Blob, store URLs, set created_by/updated_by, Clerk auth + admin check)
- [X] T021 [P] [US2] Implement GET /api/magazines/[id] route in app/api/magazines/[id]/route.ts (get single Magazine by ID, filter is_deleted=false, Clerk auth required)
- [X] T022 [P] [US2] Implement PUT /api/magazines/[id] route in app/api/magazines/[id]/route.ts (update Magazine with FormData, support partial updates, re-upload files if provided, validate fields, Clerk auth + admin check, update updated_by)
- [X] T023 [P] [US2] Implement DELETE /api/magazines/[id] route in app/api/magazines/[id]/route.ts (soft-delete Magazine by setting is_deleted=true, Clerk auth + admin check)

### UI Components for User Story 2

- [X] T024 [US2] Create MagazineForm component in lib/components/magazines/MagazineForm.tsx (bilingual title/description inputs, published_date date picker, cover image file input with preview, PDF file input with validation, form validation, handle FormData submission, loading states, use useTranslation)
- [X] T025 [US2] Create MagazineList component in lib/components/magazines/MagazineList.tsx (display Magazine list in table/card format with cover image thumbnails, show published date, show edit/delete buttons, handle soft-delete with confirmation, use useTranslation)

### Admin Pages for User Story 2

- [X] T026 [US2] Create admin Magazine list page in app/admin/magazines/page.tsx (fetch Magazines from API with pagination, render MagazineList component, add "Add New Magazine" button linking to /admin/magazines/add, Clerk auth check)
- [X] T027 [US2] Create admin Magazine add page in app/admin/magazines/add/page.tsx (render MagazineForm component, handle FormData submission to POST /api/magazines, show progress for file uploads, redirect to list on success, show toast notifications)
- [X] T028 [US2] Create admin Magazine edit page in app/admin/magazines/[id]/edit/page.tsx (fetch Magazine data from GET /api/magazines/[id], pre-populate MagazineForm with existing data and current images, handle update to PUT /api/magazines/[id], support replacing images, redirect on success)

**Checkpoint**: Admin can fully manage Magazine content with file uploads. Magazine feature foundation is complete.

---

## Phase 5: User Story 3 - End User Views FAQ Section with Accordion (Priority: P2)

**Goal**: End users view FAQ section on home page with accordion UI (single-open behavior), bilingual content, favorites prioritized, with "View All" link.

**Independent Test**: User visits home page, expands/collapses FAQ accordion items, verifies only one item open at a time, sees content in selected language, favorites appear first.

### UI Components for User Story 3

- [X] T029 [P] [US3] Create FAQAccordionItem component in lib/components/faq/FAQAccordionItem.tsx (single accordion item, expand/collapse with chevron icon, display question as button, show answer when expanded, use bilingual field accessor, RTL support with dir attribute)
- [X] T030 [US3] Create FAQAccordion component in lib/components/home/FAQSection.tsx (container managing expanded state, render FAQAccordionItem for each FAQ, single-open behavior with useState, show "View All FAQs" link if hasMore=true, use useTranslation for section title and link text)

### Public Pages for User Story 3

- [X] T031 [US3] Add FAQ section to home page in app/page.tsx (fetch up to 10 FAQs from Prisma with favorites first orderBy, check if more than 10 FAQs exist for hasMore flag, render FAQSection component with SSR, responsive section spacing)
- [X] T032 [US3] Create dedicated FAQ page in app/faq/page.tsx (fetch all FAQs from GET /api/faq with pagination, render FAQAccordion component, implement pagination controls, page title and meta tags, responsive layout)

**Checkpoint**: End users can view and interact with FAQ accordion on home page and dedicated page. FAQ feature is user-facing.

---

## Phase 6: User Story 4 - End User Views Magazine Section on Home Page (Priority: P2)

**Goal**: End users view Magazine section on home page with card-based layout, bilingual content, published dates, cover images, download links, ordered by recent published date, with "View All" link.

**Independent Test**: User visits home page, sees Magazine cards with images and descriptions, clicks download link and PDF downloads, view is responsive, content in selected language.

### UI Components for User Story 4

- [X] T033 [P] [US4] Create MagazineCard component in lib/components/magazines/MagazineCard.tsx (display cover image with Next Image, show bilingual title/description, show formatted published date with calendar icon, show download button with PDF icon linking to download_link, responsive aspect ratio, use useTranslation, RTL support)
- [X] T034 [US4] Create Magazine grid section component in lib/components/home/MagazineSection.tsx (grid of MagazineCard components, responsive columns: 1 on mobile, 2 on tablet, 3 on desktop, show "View All Magazines" link if hasMore=true, use useTranslation for section title and link text)

### Public Pages for User Story 4

- [X] T035 [US4] Add Magazine section to home page in app/page.tsx (fetch up to 8 Magazines from Prisma ordered by published_date DESC, check if more than 8 Magazines exist for hasMore flag, render MagazineSection component with SSR, responsive section spacing)
- [X] T036 [US4] Create dedicated Magazine page in app/magazines/page.tsx (fetch all Magazines from GET /api/magazines with pagination, render Magazine grid with MagazineCard components, implement pagination controls, page title and meta tags, responsive layout)

**Checkpoint**: End users can view Magazine cards on home page and dedicated page with download functionality. Magazine feature is user-facing.

---

## Phase 7: User Story 5 - Admin Manages FAQ Pagination and Favorites (Priority: P3)

**Goal**: Admin can navigate paginated FAQ list and toggle favorite status on FAQs to control home page display priority.

**Independent Test**: Admin navigates FAQ list with pagination controls (First, Previous, Page Numbers, Next, Last), marks FAQ as favorite, verifies favorite icon state changes, checks home page shows favorites first.

### Enhancements to Existing Components

- [X] T037 [P] [US5] Add pagination controls to FAQList component in lib/components/faq/FAQList.tsx (render pagination UI: First/Previous/Page Numbers/Next/Last buttons, page size selector: 10/20/50/100/500, show "Showing X-Y of Z" text, handle page changes with query params, pill-shaped rounded-full button styles, responsive stack on mobile, single row on desktop)
- [X] T038 [P] [US5] Add favorite toggle button to FAQList component in lib/components/faq/FAQList.tsx (star icon button on each FAQ row, onClick calls API to toggle is_favorite, optimistic UI update, show filled star if is_favorite=true, outline star if false)

### API Enhancement for User Story 5

- [X] T039 [US5] Add PATCH /api/faq/[id]/favorite endpoint in app/api/faq/[id]/favorite/route.ts (toggle is_favorite field, Clerk auth + admin check, return updated FAQ)

### Page Enhancements for User Story 5

- [X] T040 [US5] Update admin FAQ list page in app/admin/faq/page.tsx (add URL query param support for page and limit, fetch paginated FAQs from GET /api/faq, pass pagination state to FAQList component, handle page/limit changes with router push)
- [X] T041 [US5] Update dedicated FAQ page in app/faq/page.tsx (add URL query param support for page and limit, fetch paginated FAQs from GET /api/faq, render pagination controls, handle page/limit changes)

**Checkpoint**: Admin can paginate FAQ list and mark favorites. Home page prioritizes favorite FAQs correctly.

---

## Phase 8: User Story 6 - Scroll Animations on Home Page Sections (Priority: P3)

**Goal**: Add engaging scroll-triggered animations with parallax/background movement effects to FAQ and Magazine sections on home page, inspired by modern design studios like Deduxer and Orken World.

**Independent Test**: User scrolls home page and observes smooth animations: sections fade in and slide up on scroll, background elements move at different speeds (parallax), FAQ/Magazine sections have subtle scale/opacity transitions.

**Animation Requirements**:
- Scroll-triggered animations (IntersectionObserver or Framer Motion)
- Parallax background effects (background moves slower than content)
- Fade-in and slide-up transitions for sections
- Smooth opacity and scale transforms
- Performance-optimized (no layout shifts, GPU-accelerated transforms)
- Respects reduced motion preferences

### Animation Library Setup

- [X] T042 [US6] Install animation library: Run `npm install framer-motion` for declarative scroll animations (alternative: install `react-intersection-observer` + `react-spring` for custom approach)

### FAQ Section Animations

- [X] T043 [P] [US6] Add scroll animations to FAQSection component in lib/components/home/FAQSection.tsx (wrap section in motion.div from framer-motion, add initial={{ opacity: 0, y: 50 }}, animate={{ opacity: 1, y: 0 }}, transition={{ duration: 0.8, ease: "easeOut" }}, use useInView hook to trigger when 20% visible)
- [X] T044 [P] [US6] Add parallax background effect to FAQ section in lib/components/home/FAQSection.tsx (create background layer div with decorative shapes/gradient, use useScroll and useTransform from framer-motion, move background at 50% scroll speed relative to content, apply transform: translateY, use will-change: transform for GPU optimization)
- [X] T045 [P] [US6] Add stagger animation to FAQ accordion items in lib/components/home/FAQSection.tsx (wrap accordion items in motion.ul with staggerChildren: 0.1, each FAQAccordionItem animates with variants: hidden/visible, slide up sequentially on scroll into view)

### Magazine Section Animations

- [X] T046 [P] [US6] Add scroll animations to MagazineSection component in lib/components/home/MagazineSection.tsx (wrap section in motion.div, add fade-in and slide-up animation with initial/animate/transition, use useInView hook to trigger when 20% visible)
- [X] T047 [P] [US6] Add parallax background effect to Magazine section in lib/components/home/MagazineSection.tsx (create background layer with decorative elements, use useScroll and useTransform, apply parallax movement at different scroll speed, GPU-accelerated transforms)
- [X] T048 [P] [US6] Add stagger animation to Magazine cards in lib/components/home/MagazineSection.tsx (wrap card grid in motion.div with staggerChildren: 0.15, each MagazineCard animates with slide-up and scale effect, creates cascading reveal effect on scroll)

### Card-Level Animations

- [X] T049 [P] [US6] Add hover/interaction animations to MagazineCard in lib/components/magazines/MagazineCard.tsx (wrap card in motion.div, add whileHover={{ scale: 1.05, y: -8 }}, add smooth transition, elevate shadow on hover, smooth transform with transition duration 0.3s)
- [X] T050 [P] [US6] Add hover animations to FAQ accordion items in lib/components/faq/FAQAccordionItem.tsx (wrap button in motion.button, add subtle scale and background color transition on hover, smooth expand/collapse animation with framer-motion layoutId for content area)

### Performance Optimization

- [X] T051 [US6] Optimize animation performance across home page (add prefers-reduced-motion media query check with useReducedMotion hook from framer-motion, disable/simplify animations for users with motion sensitivity, use will-change CSS property sparingly on animated elements, ensure animations use transform and opacity only, no layout-affecting properties, test scroll performance with Chrome DevTools Performance tab to ensure 60fps)

**Checkpoint**: Home page sections have engaging scroll animations with parallax effects, smooth transitions, and performance optimizations. Animations respect accessibility preferences.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, error handling improvements, responsive design verification, accessibility checks

- [X] T052 [P] Add loading states with LoadingSpinner to all async operations (FAQ/Magazine admin pages, home page sections during SSR loading, use LoadingSpinner component from lib/components/ui/LoadingSpinner.tsx with appropriate sizes)
- [X] T053 [P] Add error boundaries to FAQ and Magazine sections (wrap sections in error boundary, show fallback UI on errors, log errors to console/monitoring service)
- [X] T054 [P] Verify responsive layouts on all FAQ/Magazine pages (test on mobile 375px, tablet 768px, desktop 1440px, ensure FAQ accordion and Magazine cards stack properly, pagination controls responsive)
- [X] T055 [P] Add Toast notifications for all admin CRUD operations (success toasts on create/update/delete, error toasts on validation/server failures, use existing toast system in project)
- [X] T056 [P] Verify bilingual content displays correctly (test Arabic RTL layouts with `dir="rtl"`, English LTR layouts, flex-row-reverse for icons in Arabic, text alignment correct)
- [X] T057 [P] Add accessibility attributes to accordion and cards (ARIA labels on buttons, role="region" on sections, aria-expanded on accordion items, keyboard navigation support, focus visible styles)
- [X] T058 [P] Verify soft-delete filtering in all queries (check all Prisma queries include `where: { is_deleted: false }`, test deleted items don't appear in lists or home page)
- [X] T059 [P] Add i18n translations for FAQ and Magazine UI labels (add keys to lib/i18n/translations/en.json and ar.json: "Add New FAQ", "Add New Magazine", "View All FAQs", "View All Magazines", "Frequently Asked Questions", "Magazine Section", pagination labels, form field labels)
- [X] T060 Create seed script for FAQ and Magazine test data in scripts/seed-faq-magazines.ts (create 5 FAQs with 2 marked as favorites, create 10 Magazines with various published dates, use bilingual content, mark some as deleted for testing soft-delete filtering)
- [X] T061 Update main README.md with FAQ and Magazine feature documentation (add section describing new features, document admin pages URLs, note scroll animation features, update environment variables if any added)
- [X] T062 Test complete user journeys end-to-end (admin creates FAQ → appears on home page → user views accordion → delete FAQ → verify removal, admin creates Magazine with upload → download PDF → edit Magazine → verify changes, verify animations trigger on scroll)

**Checkpoint**: Feature is polished, accessible, responsive, and fully documented. Ready for production deployment.

---

## Dependency Graph

**User Story Completion Order** (can be worked in parallel):

```
Setup (Phase 1) 
  ↓
Foundational (Phase 2)
  ↓
┌─────────────────┬─────────────────┬─────────────────┐
│  US1 (P1) 🎯    │  US2 (P1) 🎯    │  US5 (P3)       │
│  Admin FAQ CRUD │  Admin Magazine │  FAQ Pagination │
│  T009-T018      │  T019-T028      │  T037-T041      │
│  (independent)  │  (independent)  │  (requires US1) │
└────────┬────────┴────────┬────────┴────────┬────────┘
         │                 │                 │
         ↓                 ↓                 ↓
    US3 (P2)          US4 (P2)          US6 (P3)
    User FAQ View     User Magazine     Scroll Animations
    T029-T032         T033-T036         T042-T051
    (requires US1)    (requires US2)    (requires US3, US4)
```

**Critical Path**: Setup → Foundational → US1 + US2 → US3 + US4 → Animations → Polish

---

## Parallel Execution Opportunities

**Phase 1-2**: All tasks can run in parallel (independent database and type definitions)

**Phase 3 (US1)**: Tasks T009-T013 (API routes) can run in parallel, then T014-T015 (components), then T016-T018 (pages)

**Phase 4 (US2)**: Tasks T019-T023 (API routes) can run in parallel, then T024-T025 (components), then T026-T028 (pages)

**Phase 3 + Phase 4**: US1 and US2 can be developed completely in parallel (different files, no dependencies)

**Phase 5 (US3)**: T029-T030 (components) in parallel, then T031-T032 (pages)

**Phase 6 (US4)**: T033-T034 (components) in parallel, then T035-T036 (pages)

**Phase 7 (US5)**: T037-T038 (component updates) in parallel, T040-T041 (page updates) in parallel

**Phase 8 (US6)**: T043-T045 (FAQ animations) in parallel with T046-T050 (Magazine animations), then T051 (optimization)

**Final Phase**: Tasks T052-T059 all parallelizable (different concerns), T060-T062 sequential (testing)

---

## Implementation Strategy

**MVP Scope** (Deliver first): 
- Phase 1: Setup ✅
- Phase 2: Foundational ✅
- Phase 3: US1 - Admin FAQ CRUD ✅ (P1)
- Phase 4: US2 - Admin Magazine CRUD ✅ (P1)
- Phase 5: US3 - User FAQ View ✅ (P2)
- Phase 6: US4 - User Magazine View ✅ (P2)

**This MVP delivers full FAQ and Magazine content management and user-facing display (Tasks T001-T036)**

**Post-MVP Enhancements**:
- Phase 7: US5 - Pagination & Favorites (P3)
- Phase 8: US6 - Scroll Animations (P3)
- Final Phase: Polish & Documentation

**Incremental Delivery**: Each user story is independently testable and deployable. After US1+US2 complete, FAQ and Magazine admin functionality works. After US3+US4 complete, user-facing sections work.

---

## Task Count Summary

- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 2 tasks
- **Phase 3 (US1 - Admin FAQ CRUD)**: 10 tasks
- **Phase 4 (US2 - Admin Magazine CRUD)**: 10 tasks
- **Phase 5 (US3 - User FAQ View)**: 4 tasks
- **Phase 6 (US4 - User Magazine View)**: 4 tasks
- **Phase 7 (US5 - FAQ Pagination & Favorites)**: 5 tasks
- **Phase 8 (US6 - Scroll Animations)**: 10 tasks
- **Final Phase (Polish)**: 11 tasks

**Total**: 62 tasks

**MVP Tasks (T001-T036)**: 36 tasks  
**Post-MVP Tasks (T037-T062)**: 26 tasks

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`  
✅ All user story phase tasks have [Story] labels (US1-US6)  
✅ Setup and Foundational phases have NO story labels  
✅ Polish phase has NO story labels  
✅ Task IDs are sequential (T001-T062)  
✅ Parallelizable tasks marked with [P]  
✅ File paths included in all implementation task descriptions  
✅ Each user story phase has goal, independent test criteria, and checkpoint

---

## Ready for Implementation

All tasks are actionable and specific. Each task can be assigned, tracked, and verified independently. Proceed with implementation following the phase order, or parallelize within phases as indicated by [P] markers.
