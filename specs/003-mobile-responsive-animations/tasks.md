# Tasks: Mobile Responsive UI with Animations

**Branch**: `003-mobile-responsive-animations`  
**Date**: March 26, 2026  
**Input**: Design documents from `/specs/003-mobile-responsive-animations/`

## Overview

This feature adds mobile responsiveness, animations, bilingual support (English/Arabic with RTL), user role management with RBAC, social media footer, home page hero slider with admin management panel to the Next.js client management application.

**Key Deliverables**:
- Professional modern home page with hero slider (images/videos/GIFs)
- Responsive layouts for all pages (320px+ mobile support)
- Mobile navigation with hamburger menu
- User role management (admin/user) with Clerk sync
- Bilingual UI (English/Arabic) with RTL support
- Smooth CSS animations (60fps, respecting prefers-reduced-motion)
- Social media footer with database management
- Centralized admin panel for managing slider, header, footer, and users
- Modern black/white SVG icons throughout

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable task (different files, no blocking dependencies)
- **[Story]**: User story label (US1, US2, US3, US4, US5, US6, US7)
- File paths are relative to repository root

**User Story Priorities**:
- **P1 (MVP)**: US1 (Mobile Navigation), US6 (User Roles/RBAC)
- **P2**: US2 (Responsive Layouts), US4 (Bilingual Support), US7 (Home Page Slider & Admin Panel)
- **P3**: US3 (Animations)
- **P4**: US5 (Social Media Footer)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, database schema, and base configuration

- [X] T001 Update Prisma schema with Users model in prisma/schema.prisma
- [X] T002 Update Prisma schema with SocialMediaLink model in prisma/schema.prisma
- [X] T003 Update Prisma schema with SliderContent model in prisma/schema.prisma
- [X] T004 Run Prisma migration for Users table: `npx prisma migrate dev --name add_users_table`
- [X] T005 Run Prisma migration for SocialMediaLink table: `npx prisma migrate dev --name add_social_media_links`
- [X] T006 Run Prisma migration for SliderContent table: `npx prisma migrate dev --name add_slider_content`
- [X] T007 Generate Prisma client: `npx prisma generate`
- [X] T008 [P] Download and add black/white SVG social media icons to public/icons/ (facebook.svg, twitter.svg, instagram.svg, linkedin.svg, youtube.svg, whatsapp.svg)
- [X] T009 [P] Create public/uploads/slides/ directory for slider media uploads
- [X] T010 [P] Verify @heroicons/react is installed in package.json (should already exist)

**Estimated Time**: 1-2 hours  
**Checkpoint**: Database schema updated, icons ready, upload directory created

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Create User type definition in lib/types.ts (id, clerk_user_id, email, name, role, is_active, timestamps)
- [X] T012 Create SocialMediaLink type definition in lib/types.ts (id, platform, url, icon_path, display_order, timestamps)
- [X] T013 Create SliderContent type definition in lib/types.ts (id, media_url, media_type, title_en, title_ar, button_text_en, button_text_ar, button_url, show_button, display_order, is_visible, timestamps)
- [X] T014 [P] Create auth helper: ensureUserSynced() function in lib/auth/sync.ts for Clerk user sync
- [X] T015 [P] Create auth helper: getCurrentUser() function in lib/auth/permissions.ts
- [X] T016 [P] Create auth helper: canDeleteClients() function in lib/auth/permissions.ts
- [X] T017 Create translation files structure: lib/i18n/translations/en.json
- [X] T018 Create translation files structure: lib/i18n/translations/ar.json
- [X] T019 Populate en.json with all required translation strings (nav, buttons, forms, clients, dashboard, login, footer, slider, admin, errors, common)
- [X] T020 Populate ar.json with all required Arabic translation strings (matching en.json structure)
- [X] T021 Create LanguageContext provider in lib/i18n/LanguageContext.tsx
- [X] T022 Create useTranslation hook in lib/i18n/useTranslation.ts
- [X] T023 Wrap app with LanguageProvider in app/layout.tsx
- [X] T024 Add conditional dir="rtl" and lang attributes to <html> tag in app/layout.tsx based on language context

**Estimated Time**: 3-4 hours  
**Checkpoint**: Foundation ready - user story implementation can begin in parallel

---

## Phase 3: User Story 6 - User Role Management & Access Control (Priority: P1) 🎯 MVP

**Goal**: Sync Clerk users to database, implement role-based access control (admin/user), restrict client deletion to admins

**Independent Test**: Login with new Clerk account → verify user created in database with role="user" → admin can delete clients, regular user cannot

### API & Backend for User Roles

- [X] T025 [P] [US6] Create API route: GET /api/users/me in app/api/users/me/route.ts
- [X] T026 [P] [US6] Create API route: GET /api/users in app/api/users/route.ts (admin only, list all users)
- [X] T027 [P] [US6] Create API route: PUT /api/users/[id]/role in app/api/users/[id]/role/route.ts (admin only, update role)
- [X] T028 [P] [US6] Create API route: PUT /api/users/[id]/activate in app/api/users/[id]/activate/route.ts (admin only)
- [X] T029 [P] [US6] Create API route: PUT /api/users/[id]/deactivate in app/api/users/[id]/deactivate/route.ts (admin only)
- [X] T030 [US6] Modify DELETE /api/clients/[id] in app/api/clients/[id]/route.ts to check admin role via canDeleteClients()
- [X] T031 [US6] Add user sync logic to app middleware or root layout to call ensureUserSynced() on authenticated requests

### Frontend for User Roles

- [X] T032 [P] [US6] Create useCurrentUser hook in lib/hooks/useCurrentUser.ts (fetch /api/users/me, return user and isAdmin)
- [X] T033 [US6] Update ClientTableRow component in lib/components/clients/ClientTableRow.tsx to conditionally show delete button based on isAdmin
- [X] T034 [US6] Update DeleteButton component in lib/components/DeleteButton.tsx to check isAdmin prop
- [X] T035 [US6] Update Clients list page in app/clients/page.tsx to use useCurrentUser hook and pass isAdmin to table rows

**Estimated Time**: 4-5 hours  
**Checkpoint**: User sync working, admins can delete clients, regular users cannot

---

## Phase 4: User Story 1 - Mobile Navigation Access (Priority: P1) 🎯 MVP

**Goal**: Responsive header with mobile menu, remove Next.js logo, add language switcher, add admin button for admins

**Independent Test**: View app on mobile (375px width) → hamburger menu appears → tap menu → navigation opens → select page → navigates and menu closes → admin button visible only for admins

### Mobile Navigation Components

- [X] T036 [P] [US1] Create MobileMenu component in lib/components/MobileMenu.tsx (slide-out drawer with nav links)
- [X] T037 [P] [US1] Create LanguageSwitcher component in lib/components/LanguageSwitcher.tsx (EN/AR toggle button)
- [X] T038 [US1] Modify Header component in app/header.tsx:
  - Remove Next.js logo (<Image src="/next.svg">)
  - Add hamburger menu button (visible <768px)
  - Hide navigation links on mobile (<768px)
  - Add LanguageSwitcher component
  - Add "Admin" button (visible only when useCurrentUser().isAdmin === true, links to /admin - NOTE: admin panel created in Phase 7)
  - Add MobileMenu component with state management
- [X] T039 [US1] Add responsive Tailwind classes to Header navigation (hidden md:flex pattern)
- [X] T040 [US1] Add mobile menu animations to app/globals.css (slide-in transform, overlay fade)
- [ ] T041 [US1] Test header on mobile (320px, 375px), tablet (768px), desktop (1024px) breakpoints

**Estimated Time**: 3-4 hours  
**Checkpoint**: Mobile navigation functional, Next.js logo removed, language switcher visible, admin button for admins only

---

## Phase 5: User Story 4 - Bilingual Support (Priority: P2)

**Goal**: Full English/Arabic translation with RTL layout switching

**Independent Test**: Click language switcher → select Arabic → all UI text changes to Arabic → layout switches to RTL → switch back to English → layout returns to LTR

### Translation Implementation

- [X] T042 [P] [US4] Replace hardcoded text in Header (app/header.tsx) with useTranslation() calls
- [X] T043 [P] [US4] Replace hardcoded text in Dashboard page (app/dashboard/page.tsx) with useTranslation() calls
- [X] T044 [P] [US4] Replace hardcoded text in Clients list page (app/clients/page.tsx) with useTranslation() calls
- [X] T045 [P] [US4] Replace hardcoded text in Client add page (app/clients/add/page.tsx) with useTranslation() calls
- [N/A] T046 [P] [US4] Replace hardcoded text in Client edit page (app/clients/[id]/edit/page.tsx) with useTranslation() calls
- [N/A] T047 [P] [US4] Replace hardcoded text in Client view page (app/clients/[id]/view/page.tsx) with useTranslation() calls
- [X] T048 [P] [US4] Replace hardcoded text in Login page (app/login/page.tsx) with useTranslation() calls
- [X] T049 [P] [US4] Replace hardcoded text in MetricCard component (lib/components/dashboard/MetricCard.tsx) with useTranslation() calls
- [X] T050 [P] [US4] Replace hardcoded text in ClientSearchBar component (lib/components/clients/ClientSearchBar.tsx) with useTranslation() calls
- [ ] T051 [P] [US4] Replace hardcoded text in ConfirmDialog component (lib/components/ConfirmDialog.tsx) with useTranslation() calls

### RTL Layout Adjustments

- [X] T052 [US4] Add RTL-specific Tailwind utilities to app/globals.css (text alignment, margin/padding overrides)
- [ ] T053 [US4] Test all pages in Arabic (RTL) mode - verify layout mirrors correctly
- [ ] T054 [US4] Add ltr class to logo/icon elements that shouldn't flip in RTL

**Estimated Time**: 4-5 hours  
**Checkpoint**: All UI text translatable, RTL layout working for Arabic

**Estimated Time**: 4-5 hours  
**Checkpoint**: All UI text translatable, RTL layout working for Arabic

---

## Phase 6: User Story 2 - Responsive Page Layouts (Priority: P2)

**Goal**: All pages adapt to mobile screens without horizontal scrolling, all interactive elements have 44x44px touch targets

**Independent Test**: View each page at 320px width → no horizontal scroll → all buttons tappable → forms usable

### Dashboard Responsiveness

- [X] T055 [P] [US2] Make MetricCard component responsive in lib/components/dashboard/MetricCard.tsx (full-width mobile, grid on desktop)
- [X] T056 [P] [US2] Make DonutChart component responsive in lib/components/dashboard/DonutChart.tsx (scale down on mobile)
- [X] T057 [P] [US2] Make LatestClients component responsive in lib/components/dashboard/LatestClients.tsx (stack cards on mobile)
- [X] T058 [P] [US2] Make RecentActivity component responsive in lib/components/dashboard/RecentActivity.tsx (full-width list on mobile)
- [X] T059 [US2] Update Dashboard page layout in app/dashboard/page.tsx to use responsive grid (flex-col on mobile, grid on desktop)

### Clients Pages Responsiveness

- [X] T060 [US2] Make ClientTable component responsive in lib/components/clients/ClientTable.tsx (switch to card view on mobile OR horizontal scroll)
- [X] T061 [P] [US2] Make ClientCard component mobile-optimized in lib/components/clients/ClientCard.tsx (full-width, adequate spacing)
- [X] T062 [P] [US2] Make ClientSearchBar component full-width on mobile in lib/components/clients/ClientSearchBar.tsx
- [X] T063 [US2] Update Clients list page in app/clients/page.tsx to use responsive layout (card view toggle on mobile)
- [X] T064 [US2] Update Client add form in app/clients/add/page.tsx (full-width inputs, touch-friendly spacing)
- [N/A] T065 [US2] Update Client edit form in app/clients/[id]/edit/page.tsx (full-width inputs, touch-friendly spacing)
- [N/A] T066 [US2] Update Client view page in app/clients/[id]/view/page.tsx (stack fields vertically on mobile)

### Login Page Responsiveness

- [X] T067 [US2] Update Login page in app/login/page.tsx (center form, full-width inputs on mobile)

### General Responsive Utilities

- [X] T068 [P] [US2] Add responsive utility classes to app/globals.css (mobile-first breakpoints, touch target sizes)
- [ ] T069 [US2] Test all pages at breakpoints: 320px, 375px, 414px, 768px, 1024px
- [ ] T070 [US2] Verify all buttons/links meet 44x44px minimum touch target size

**Estimated Time**: 5-6 hours  
**Checkpoint**: All pages responsive, no horizontal scroll on mobile, touch targets adequate

---

## Phase 7: User Story 7 - Professional Home Page with Slider (Priority: P2)

**Goal**: Create modern home page with hero slider supporting images/videos/gifs, bilingual titles, CTA buttons, admin management

**Independent Test**: Visit home page → slider auto-plays → click navigation dots → slide changes → click CTA button → navigates to URL → admin adds new slide → appears in slider

### Slider API

- [X] T071 [P] [US7] Create API route: GET /api/slider in app/api/slider/route.ts (public, fetch active slides order by display_order)
- [X] T072 [P] [US7] Create API route: POST /api/slider in app/api/slider/route.ts (admin only, create slide, validate media_type is one of: image, video, gif)
- [X] T073 [P] [US7] Create API route: GET /api/slider/[id] in app/api/slider/[id]/route.ts (admin only)
- [X] T074 [P] [US7] Create API route: PUT /api/slider/[id] in app/api/slider/[id]/route.ts (admin only, update slide, validate media_type is one of: image, video, gif)
- [X] T075 [P] [US7] Create API route: DELETE /api/slider/[id] in app/api/slider/[id]/route.ts (admin only, soft-delete slide)
- [X] T076 [P] [US7] Create API route: POST /api/slider/upload in app/api/slider/upload/route.ts (admin only, upload media files to /public/uploads/slides/ with file name sanitization, size validation max 10MB, type validation jpg/png/gif/mp4/webm)
- [X] T077 [P] [US7] Create API route: PUT /api/slider/reorder in app/api/slider/reorder/route.ts (admin only, bulk update display_order)
- [X] T078 [P] [US7] Create API route: PUT /api/slider/[id]/toggle in app/api/slider/[id]/toggle/route.ts (admin only, toggle is_active)

### Slider Component (Home Page)

- [X] T079 [US7] Create HeroSlider component in lib/components/home/HeroSlider.tsx (auto-play, navigation, responsive)
- [X] T080 [US7] Implement slider auto-play with configurable interval (default 5 seconds)
- [X] T081 [US7] Add navigation dots (indicator for each slide, click to navigate)
- [X] T082 [US7] Add prev/next arrow buttons with hover effects
- [X] T083 [US7] Support image, video, and gif media types (conditional rendering by media_type)
- [X] T084 [US7] Display bilingual title (title_en or title_ar based on language context)
- [X] T085 [US7] Display bilingual button text (button_text_en or button_text_ar) only when show_button=true AND button_text AND button_url are present
- [X] T086 [US7] Make slider responsive (full-width, adjust height for mobile/desktop)
- [X] T087 [US7] Add swipe gestures for mobile (touch events for prev/next)
- [X] T088 [US7] Add slide transition animations (fade or slide effect)
- [X] T089 [US7] Update Home page in app/page.tsx to display HeroSlider component at top

### Admin Panel - Slider Management

- [X] T090 [US7] Create admin layout with navigation in app/admin/layout.tsx (tabs for Slider, Header, Footer, Users)
- [X] T091 [US7] Create SliderManagement page in app/admin/slider/page.tsx (list slides with CRUD operations, note: admin changes visible on next page load)
- [X] T092 [US7] Add "Add New Slide" form in admin panel (title EN/AR, button text EN/AR, URL, media upload)
- [X] T093 [US7] Add slide reordering UI (up/down arrow buttons to change display_order - drag-and-drop deferred as future enhancement)
- [X] T094 [US7] Add slide visibility toggle (is_visible checkbox)
- [X] T095 [US7] Add slide edit modal/page (update all fields)
- [X] T096 [US7] Add slide delete confirmation with soft-delete
- [X] T097 [US7] Add media upload progress indicator (for large video/gif files)
- [X] T098 [US7] Validate media file size (max 10MB) and types (jpg, png, gif, mp4, webm)

### Admin Panel - Header & Footer Management

- [ ] T099 [US7] Create HeaderManagement page in app/admin/header/page.tsx (manage site title text, logo image upload with validation, navigation links with bilingual labels)
- [ ] T099a [US7] Add site branding fields to HeaderManagement: logo upload (max 2MB, png/jpg/svg), site title input (EN/AR)
- [X] T100 [US7] Create FooterManagement page in app/admin/footer/page.tsx (link to T121-T125 social media API, display SocialMediaManagement UI)

### Admin Panel - User Management

- [X] T101 [US7] Create UserManagement page in app/admin/users/page.tsx (list users, change roles, activate/deactivate)
- [X] T102 [US7] Add role change dropdown (admin/user) with PUT /api/users/[id]/role integration
- [X] T103 [US7] Add activate/deactivate toggle with API integration
- [ ] T104 [US7] Add user search/filter functionality

### Admin Panel - Access Control

- [X] T105 [US7] Protect all /admin/* routes with middleware check for admin role
- [X] T106 [US7] Add 403 Forbidden page for non-admin users accessing /admin routes
- [X] T107 [US7] Test admin panel access (admin sees panel, regular user gets 403)

**Estimated Time**: 8-10 hours  
**Checkpoint**: Professional home page with slider, admin can manage all site content from centralized panel

---

## Phase 8: User Story 3 - Smooth Page Transitions and Interactions (Priority: P3)

## Phase 8: User Story 3 - Smooth Page Transitions and Interactions (Priority: P3)

**Goal**: Add smooth animations to page transitions, menu, buttons, and lists while respecting prefers-reduced-motion

**Independent Test**: Navigate between pages → smooth fade-in → open mobile menu → smooth slide → hover buttons → subtle color transition → check with reduced motion enabled → animations disabled

### Animation Infrastructure

- [X] T108 [P] [US3] Add animation keyframes to app/globals.css (fadeIn, slideIn, staggerIn)
- [X] T109 [P] [US3] Add prefers-reduced-motion media queries to app/globals.css (disable/minimize animations)
- [X] T110 [P] [US3] Add transition utilities to app/globals.css (button hover, focus states)
- [N/A] T111 [P] [US3] Create AnimatedPage wrapper component in lib/components/AnimatedPage.tsx (OPTIONAL - for page transitions)

### Apply Animations

- [X] T112 [US3] Add page transition animations to each route (fade-in on load) - can use AnimatedPage wrapper or direct CSS
- [X] T113 [US3] Add slide animation to MobileMenu in lib/components/MobileMenu.tsx (transform: translateX)
- [X] T114 [P] [US3] Add hover/focus transitions to buttons throughout app (color, scale effects)
- [X] T115 [P] [US3] Add stagger animation to MetricCard list in Dashboard (OPTIONAL - sequential fade-in)
- [X] T116 [P] [US3] Add hover effects to ClientCard in lib/components/clients/ClientCard.tsx
- [X] T117 [P] [US3] Add transition to HeroSlider component (fade or slide between slides)

### Animation Testing

- [ ] T118 [US3] Test animations on mobile device for 60fps performance
- [ ] T119 [US3] Test with prefers-reduced-motion enabled (verify animations disabled/minimal)
- [ ] T120 [US3] Verify no animation jank or stuttering on page transitions

**Estimated Time**: 3-4 hours  
**Checkpoint**: Smooth animations throughout, 60fps on mobile, reduced motion respected

---

## Phase 9: User Story 5 - Contact Footer with Social Media (Priority: P4)

**Goal**: Responsive footer on all pages with database-managed social media links

**Independent Test**: Scroll to bottom of any page → see footer with social links → click link → opens in new tab → admin adds new social link via API → link appears in footer

### Social Media API

- [X] T121 [P] [US5] Create API route: GET /api/social-media in app/api/social-media/route.ts (list active links)
- [X] T122 [P] [US5] Create API route: POST /api/social-media in app/api/social-media/route.ts (admin only, create link)
- [X] T123 [P] [US5] Create API route: GET /api/social-media/[id] in app/api/social-media/[id]/route.ts
- [X] T124 [P] [US5] Create API route: PUT /api/social-media/[id] in app/api/social-media/[id]/route.ts (admin only, update link)
- [X] T125 [P] [US5] Create API route: DELETE /api/social-media/[id] in app/api/social-media/[id]/route.ts (admin only, soft-delete link)

### Footer Component

- [X] T126 [US5] Create Footer component in lib/components/Footer.tsx (fetch social links, display icons, responsive layout)
- [X] T127 [US5] Add Footer component to app/layout.tsx (render below main content on all pages)
- [X] T128 [US5] Make Footer responsive with Tailwind (stack on mobile, flex on desktop)
- [X] T129 [US5] Translate footer text using useTranslation hook
- [X] T130 [US5] Verify social media links open in new tabs with rel="noopener noreferrer"

### Footer Testing

- [ ] T131 [US5] Test footer displays on all pages
- [ ] T132 [US5] Test footer layout on mobile, tablet, desktop
- [ ] T133 [US5] Test social media link clicks (new tab, correct URL)

**Estimated Time**: 3-4 hours  
**Checkpoint**: Footer on all pages, social links working, manageable via API (admin panel integration already in Phase 7)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final testing, performance optimization, accessibility verification

- [ ] T134 Run Lighthouse mobile audit (target: 90+ performance score)
- [ ] T135 Test keyboard navigation across all pages
- [ ] T136 Test screen reader accessibility (ARIA labels, semantic HTML)
- [ ] T137 Verify WCAG 2.1 AA compliance (color contrast, touch targets, focus indicators)
- [ ] T138 Cross-browser testing (Chrome, Firefox, Safari on mobile and desktop)
- [ ] T139 Test on actual mobile devices (iOS Safari, Android Chrome) including device rotation testing (portrait ↔ landscape during form filling, menu interaction)
- [ ] T140 [US3] Test all user stories end-to-end
- [ ] T141 [US3] Update documentation (README, quickstart) with new features
- [X] T142 [US3] Create seed script for initial admin user (scripts/seed-admin-user.ts)
- [X] T143 [US3] Create seed script for default social media links (scripts/seed-social-media.ts)
- [X] T144 [US3] Create seed script for sample slider content (scripts/seed-slider.ts)
- [ ] T144a Conduct stakeholder review of home page professional appearance (SC-025 verification)

**Estimated Time**: 4-5 hours  
**Checkpoint**: Production-ready feature

---

## Summary

**Total Tasks**: 147 (was 144, added T010a, T099a, T144a)  
**Estimated Total Time**: 43-51 hours

**Task Breakdown by User Story**:
- Phase 1: Setup - 11 tasks (2.5 hours) [+1 for baseline metrics]
- Phase 2: Foundation - 14 tasks (6-7 hours)
- Phase 3: US6 User Roles (P1) - 11 tasks (4-5 hours)
- Phase 4: US1 Mobile Nav (P1) - 6 tasks (3-4 hours)
- Phase 5: US4 Bilingual (P2) - 13 tasks (4-5 hours)
- Phase 6: US2 Responsive (P2) - 16 tasks (5-6 hours)
- Phase 7: US7 Home Slider & Admin Panel (P2) - 39 tasks (8.5-10.5 hours) [+2 for header branding]
- Phase 8: US3 Animations (P3) - 13 tasks (3-4 hours)
- Phase 9: US5 Footer (P4) - 13 tasks (3-4 hours)
- Phase 10: Polish - 12 tasks (4.5-5.5 hours) [+1 for stakeholder review]

**Parallel Execution Opportunities**:
- Phase 2: All type definitions and translations can be done in parallel
- Phase 3: All API routes can be built in parallel (T025-T029)
- Phase 5: All translation replacements can be done in parallel (T042-T051)
- Phase 6: Component responsiveness updates can be parallelized by page
- Phase 7: Slider API routes (T071-T078) can be built in parallel
- Phase 7: Admin panel pages (T090-T104) can be built in parallel after layout is created
- Phase 8: Animation CSS and component updates can be parallelized
- Phase 9: Social media API routes can be built in parallel (T121-T125)

**MVP Scope** (Recommended for initial delivery):
- Phases 1-4 only (Setup, Foundation, User Roles, Mobile Nav) = ~15 hours
- Delivers: Mobile-responsive navigation with role-based admin access
- Defer: Slider, animations, footer, full bilingual to Phase 2

**Implementation Strategy**:
1. Complete MVP phases sequentially (1→2→3→4)
2. Each user story (phases 3-9) can be implemented independently
3. P1 user stories (US6, US1) should complete before P2/P3/P4
4. Slider (US7) is independent and can be implemented anytime after Foundation
5. Footer (US5) depends on admin panel (US7) for management UI

**Dependencies Graph**:
```
Setup (Phase 1)
  └─> Foundation (Phase 2)
        ├─> US6 User Roles (Phase 3) [P1] ─────┐
        ├─> US1 Mobile Nav (Phase 4) [P1] ──────┤
        ├─> US4 Bilingual (Phase 5) [P2] ───────┼─> US7 Slider & Admin (Phase 7) [P2]
        ├─> US2 Responsive (Phase 6) [P2] ──────┤      └─> US5 Footer (Phase 9) [P4]
        └─> US3 Animations (Phase 8) [P3] ──────┘
                                                  └─> Polish (Phase 10)
```

**Testing Checkpoints**:
- After Phase 2: All TypeScript types compile, translations load
- After Phase 3: User sync works, admins can delete clients
- After Phase 4: Mobile menu functional, admin button appears
- After Phase 5: Language switcher changes all UI text
- After Phase 6: All pages responsive without horizontal scroll
- After Phase 7: Slider works, admin panel manages all content
- After Phase 8: Smooth animations, 60fps performance
- After Phase 9: Footer on all pages with social links
- After Phase 10: Production-ready, Lighthouse 90+ score

**MVP Scope** (Phases 1-4): 38 tasks, ~12-15 hours
- Setup + Foundation + US6 (User Roles) + US1 (Mobile Nav)

**Full Feature Scope**: All 103 tasks, ~30-36 hours

---

## Dependency Graph

### User Story Completion Order

```
Phase 1 (Setup)
   ↓
Phase 2 (Foundation)
   ↓
   ├─→ Phase 3: US6 (User Roles - P1) ───┐
   ├─→ Phase 4: US1 (Mobile Nav - P1) ────┤
   ├─→ Phase 5: US4 (Bilingual - P2) ─────┤→ Can work in parallel
   ├─→ Phase 6: US2 (Responsive - P2) ────┤
   ├─→ Phase 7: US3 (Animations - P3) ────┤
   └─→ Phase 8: US5 (Footer - P4) ────────┘
                  ↓
          Phase 9 (Polish)
```

**Parallel Opportunities**:
- After Phase 2 (Foundation), all user story phases (3-8) can be worked on simultaneously by different developers
- Within each phase, tasks marked [P] can run in parallel
- Translation tasks (T039-T048) are highly parallelizable

---

## Implementation Strategy

**Recommended Approach**:

1. **Sprint 1 (MVP)**: Complete Phases 1-4 (Setup, Foundation, User Roles, Mobile Nav)
   - Deliverable: Working mobile app with user role management
   
2. **Sprint 2**: Complete Phases 5-6 (Bilingual Support, Responsive Layouts)
   - Deliverable: Fully responsive, bilingual application
   
3. **Sprint 3**: Complete Phases 7-8 (Animations, Footer)
   - Deliverable: Polished UI with social media integration
   
4. **Sprint 4**: Complete Phase 9 (Polish & Testing)
   - Deliverable: Production-ready feature

**Incremental Delivery**: Each phase delivers independently testable value. Consider deploying to staging after each phase for stakeholder feedback.
