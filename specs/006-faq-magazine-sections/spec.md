# Feature Specification: FAQ and Magazine Home Page Sections

**Feature Branch**: `006-faq-magazine-sections`  
**Created**: April 13, 2026  
**Status**: Draft  
**Input**: User description: "Add two sections to home page with admin pages, section one is the most frequently asked questions, like the attached image it will have accordion and the latest FAQ with Favourits from admin page, it should have Arabic and English titles and Descriptions and add like 20 FAQ in arabic and english with pager at admin section, Section 2 will be Magazine Section and it will be like the cards at the attached files with New modern style, also it will have Title and description and published date and image upload file from style library or upload file based on storage type blob or local db, home section will have image and download link and published date, also admin page should manage all magazine CRUD with pager"

## Clarifications

### Session 2026-04-13

- Q: Which file formats should be supported for Magazine cover images (displayed on home page cards) and Magazine download files? → A: Images: JPEG, PNG, WebP, GIF; Downloads: PDF only
- Q: Should the FAQ accordion allow multiple items to be open simultaneously, or should opening a new item automatically close the previously opened one? → A: Single-open accordion (only one FAQ can be expanded at a time)
- Q: How many FAQs and Magazines should be displayed on the home page? Should all items be shown with pagination, or should there be a limit? → A: Display limited number (10 FAQs, 8 Magazines) with "View All" link to dedicated pages
- Q: Should FAQs marked as favorites/featured have special display treatment on the home page? If yes, how should they be distinguished? → A: Favorites are prioritized in display order (top 10 includes all favorites first, then recent non-favorites)
- Q: How should Magazines be ordered when displayed on the home page? By published date, creation date, or another criteria? → A: Most recent published date first (newest magazines appear at top)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Creates and Manages FAQ Content (Priority: P1)

Admin user needs to create, edit, and delete FAQ entries in both English and Arabic to populate the FAQ section on the home page. This is the foundation for the entire FAQ feature.

**Why this priority**: Without admin ability to manage FAQ content, the feature cannot function. This is table-stakes functionality.

**Independent Test**: Can be fully tested by: Admin adds a new FAQ in both English and Arabic, then navigates to FAQ list and verifies the entry appears with both language versions. Delivers: Functional admin interface for FAQ management.

**Acceptance Scenarios**:

1. **Given** an admin user is logged in and on the FAQ admin page, **When** they click "Add New FAQ" and fill in English and Arabic question/answer fields, **Then** the FAQ is saved and appears in the FAQ list with both language versions preserved
2. **Given** an admin views the FAQ list, **When** they click edit on any FAQ, **Then** they can modify both English and Arabic content and save changes
3. **Given** an admin views a FAQ in the list, **When** they click delete, **Then** the FAQ is soft-deleted and no longer appears in the FAQ list or home page

---

### User Story 2 - Admin Manages Magazine Content with Image Uploads (Priority: P1)

Admin user needs to create, edit, and delete Magazine entries with bilingual titles/descriptions, image uploads from style library or file upload, and download links. This is required for the Magazine section to function.

**Why this priority**: Without admin CRUD for Magazine, the feature cannot be populated with content. This is essential functionality.

**Independent Test**: Can be fully tested by: Admin creates a new Magazine entry with English/Arabic titles, uploads an image, and adds a download link. Magazine appears on home page with image, title, description, published date, and download link. Delivers: Complete Magazine content management.

**Acceptance Scenarios**:

1. **Given** an admin is on the Magazine admin page, **When** they click "Add New Magazine", they see a form with bilingual title/description fields, image upload (supporting style library or file), and download link field, **Then** they can fill in all fields and save the Magazine
2. **Given** an admin uploads an image for a Magazine, **When** the image is from style library or direct file upload based on storage configuration, **Then** the image is properly stored (blob or local DB based on storage type) and linked to the Magazine entry
3. **Given** an admin views the Magazine list, **When** they click edit on any Magazine, **Then** they can modify all fields (titles, descriptions, image, download link, published date) and save changes
4. **Given** an admin views a Magazine in the list, **When** they click delete, **Then** the Magazine is soft-deleted and no longer appears in the list or home page

---

### User Story 3 - End User Views FAQ Section with Accordion (Priority: P2)

End users need to view FAQ content on the home page in an accordion-style interface where they can expand/collapse questions to see answers. Content must be in their selected language.

**Why this priority**: This is the primary user-facing feature for FAQ. While less critical than admin management, it's essential for delivering value to end users once admin content exists.

**Independent Test**: Can be fully tested by: User navigates to home page, expands FAQ accordion items, reads answers in their selected language (English or Arabic), and expands/collapses multiple items. Delivers: Functional FAQ viewing experience.

**Acceptance Scenarios**:

1. **Given** a user is on the home page and FAQ section is visible, **When** they view the FAQ accordion, **Then** all questions are initially collapsed and displaying in their selected language (English or Arabic), with favorite FAQs appearing first in the list
2. **Given** a user sees the FAQ accordion, **When** they click on a question, **Then** the answer expands and displays the full text in their selected language
3. **Given** a user has expanded an answer, **When** they click the question again, **Then** the accordion collapses and hides the answer
4. **Given** a user has an FAQ item expanded, **When** they click a different question, **Then** the previously expanded item automatically collapses (single-open accordion pattern)
5. **Given** the FAQ section displays up to 10 items, **When** more than 10 FAQs exist in the database, **Then** a "View All FAQs" link appears allowing navigation to a dedicated FAQ page

---

### User Story 4 - End User Views Magazine Section on Home Page (Priority: P2)

End users need to view the Magazine section on the home page with card-based layout showing title, description, published date, image, and download link. Content must respect their language preference.

**Why this priority**: This delivers core user value and showcases Magazine content. While dependent on admin content creation, it's the primary user-facing interface.

**Independent Test**: Can be fully tested by: User navigates to home page, sees Magazine section with cards displaying image, title, description, date, and download link. Clicking download link works. View is responsive. Delivers: Magazine browsing experience.

**Acceptance Scenarios**:

1. **Given** a user is on the home page and Magazine section is visible, **When** they view the Magazine cards, **Then** each card displays the Magazine image, title, description, and published date in their selected language (English or Arabic), ordered by most recent published date first
2. **Given** a user views a Magazine card, **When** the card includes a download link, **Then** clicking the download link initiates the file download
3. **Given** a user with a mobile device views the Magazine section, **When** the screen is resized to mobile breakpoints, **Then** the cards display responsively (single column on mobile, multiple columns on desktop)
4. **Given** the Magazine section displays up to 8 items, **When** more than 8 Magazines exist in the database, **Then** a "View All Magazines" link appears allowing navigation to a dedicated Magazine page

---

### User Story 5 - Admin Manages FAQ Pagination and Favorites (Priority: P3)

Admin user can navigate paginated FAQ list in the admin section and mark FAQs as favorites/featured to highlight important items.

**Why this priority**: While pagination is important for usability with ~20 items, it's less critical than core CRUD. Favorites feature adds value but is not essential for MVP.

**Independent Test**: Can be fully tested by: Admin navigates FAQ list with pagination controls, marks items as favorite, and verifies that favorite status is saved and can be toggled.

**Acceptance Scenarios**:

1. **Given** an admin views the FAQ admin list and there are more than 10 items, **When** the page loads, **Then** pagination controls appear with First, Previous, Page numbers, Next, Last buttons
2. **Given** an admin is on any FAQ page, **When** they click pagination buttons, **Then** the FAQ list updates to show items for the selected page
3. **Given** an admin views a FAQ in the list, **When** they click the favorite/star icon, **Then** the FAQ is marked as favorite and the icon state updates to reflect this
4. **Given** an admin has marked FAQs as favorites, **When** end users view the FAQ section on the home page, **Then** favorite FAQs appear first in display order (all favorites shown before non-favorites)

---

### Edge Cases

- What happens when an admin uploads an image file that's too large? (Should show error and not save Magazine entry)
- What happens when an admin uploads an unsupported file format for Magazine cover image or download? (Should show validation error specifying allowed formats: JPEG/PNG/WebP/GIF for images, PDF for downloads)
- What happens when a Magazine entry has no image? (Should either be optional or display a placeholder)
- What happens when FAQ or Magazine page size limit changes? (Should maintain user on valid page after pagination setting changes)
- What happens when FAQ/Magazine contains special characters in English or Arabic? (Should render correctly without escaping issues)
- What happens when admin deletes a Magazine while users are viewing it? (Should gracefully handle the soft-delete and refresh the page)

## Requirements *(mandatory)*

### Functional Requirements

#### FAQ Requirements

- **FR-001**: System MUST allow admin users to create new FAQ entries with both English and Arabic question and answer text
- **FR-002**: System MUST allow admin users to edit existing FAQ entries and update both language versions independently
- **FR-003**: System MUST allow admin users to delete FAQ entries (soft delete with is_deleted flag)
- **FR-004**: System MUST store and retrieve FAQ entries with proper soft-delete filtering (is_deleted = false)
- **FR-005**: System MUST support pagination in the FAQ admin list with configurable page size (10, 20, 50, 100, 500 items per page)
- **FR-006**: System MUST support marking FAQs as favorites/featured
- **FR-007**: System MUST display FAQ section on home page in accordion format with questions grouped by language
- **FR-008**: System MUST allow users to expand/collapse individual FAQ accordion items to view answers (single-open behavior: opening a new item automatically closes the previously opened item)
- **FR-009**: System MUST retrieve and display only non-deleted FAQs on the home page (maximum 10 items), prioritizing favorites first, then most recent non-favorites
- **FR-009b**: System MUST display a "View All FAQs" link when more than 10 FAQs exist, linking to a dedicated FAQ page with full list and pagination
- **FR-010**: System MUST track audit fields (created_by, updated_by, created_at, updated_at) for all FAQ entries

#### Magazine Requirements

- **FR-011**: System MUST allow admin users to create new Magazine entries with English and Arabic titles and descriptions
- **FR-012**: System MUST allow admin users to upload Magazine cover images (JPEG, PNG, WebP, GIF formats only) from style library or direct file upload
- **FR-013**: System MUST support both blob storage (Vercel Blob) and local DB storage for Magazine images based on configuration
- **FR-014**: System MUST allow admin users to add download links (PDF files only) to Magazine entries
- **FR-015**: System MUST allow admin users to set/update published date for Magazine entries
- **FR-016**: System MUST allow admin users to edit existing Magazine entries and update all fields (titles, descriptions, image, download link, date)
- **FR-017**: System MUST allow admin users to delete Magazine entries (soft delete with is_deleted flag)
- **FR-018**: System MUST support pagination in the Magazine admin list with configurable page size (10, 20, 50, 100, 500 items per page)
- **FR-019**: System MUST display Magazine section on home page in card-based layout with modern styling
- **FR-020**: System MUST display Magazine cards with image, title, description, published date, and download link in user's selected language
- **FR-021**: System MUST provide responsive card layout (1 column on mobile, multiple columns on tablet/desktop)
- **FR-022**: System MUST retrieve and display only non-deleted Magazines on the home page (maximum 8 items), ordered by published date descending (most recent first)
- **FR-022b**: System MUST display a "View All Magazines" link when more than 8 Magazines exist, linking to a dedicated Magazine page with full list and pagination
- **FR-023**: System MUST track audit fields (created_by, updated_by, created_at, updated_at) for all Magazine entries

#### Shared Requirements

- **FR-024**: System MUST support bilingual content (English and Arabic) for both FAQ and Magazine with correct text direction (LTR for English, RTL for Arabic)
- **FR-025**: System MUST track which admin user created or modified FAQ/Magazine entries (audit trail)
- **FR-026**: System MUST validate all user inputs for FAQ and Magazine entries (required fields, text length limits, file size limits for images, file format validation for images: JPEG/PNG/WebP/GIF, file format validation for downloads: PDF only)
- **FR-027**: System MUST provide appropriate error messages when validation fails or operations encounter issues

### Key Entities *(include if feature involves data)*

- **FAQ**: Represents a frequently asked question entry
  - Attributes: id, question_en, question_ar, answer_en, answer_ar, is_favorite, created_by (user_id), updated_by (user_id), created_at, updated_at, is_deleted
  - Relationships: Links to admin user who created/updated it
  
- **Magazine**: Represents a magazine/article entry
  - Attributes: id, title_en, title_ar, description_en, description_ar, image_url (cover image displayed on home page cards, JPEG/PNG/WebP/GIF formats), image_storage_type (blob|local), download_link (PDF file only), published_date, created_by (user_id), updated_by (user_id), created_at, updated_at, is_deleted
  - Relationships: Links to admin user who created/updated it, references cover image file (either in blob storage or embedded in DB)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can create and save a complete FAQ entry (with both English and Arabic content) in under 1 minute
- **SC-002**: Admin can create and save a complete Magazine entry (with all fields including image upload) in under 2 minutes
- **SC-003**: Home page FAQ section loads and displays all non-deleted FAQs within 2 seconds
- **SC-004**: Home page Magazine section loads and displays all non-deleted Magazines within 2 seconds
- **SC-005**: FAQ accordion expand/collapse interactions respond to user clicks with no perceptible delay (< 100ms)
- **SC-006**: Magazine card grid displays responsively with appropriate layout on mobile (375px), tablet (768px), and desktop (1440px) viewports
- **SC-007**: Image uploads for Magazine entries complete successfully for files up to 10MB in size
- **SC-008**: Admin pagination allows navigating 200+ FAQ/Magazine entries with proper page layout and navigation controls
- **SC-009**: Bilingual content displays correctly in both English (LTR) and Arabic (RTL) layouts without text overflow or alignment issues
- **SC-010**: 95% of FAQ/Magazine CRUD operations complete without user-facing errors
- **SC-011**: Downloads triggered from Magazine download links complete successfully for linked file types

## Assumptions

- **Scope**: FAQ and Magazine sections are independent features; other home page sections remain unchanged
- **Home Page Display**: Home page displays maximum 10 FAQs and 8 Magazines with "View All" links to dedicated pages when more items exist
- **Dedicated Pages**: Full FAQ and Magazine listing pages with pagination will be created to support "View All" functionality
- **Authentication**: Both FAQ and Magazine admin pages require admin role authorization (enforced via existing Clerk + custom role system)
- **Bilingual Support**: Both English and Arabic versions must be provided explicitly for all content; automatic translation is out of scope
- **Image Storage**: Images can be stored in either Vercel Blob or local DB based on existing `BLOB_READ_WRITE_TOKEN` configuration; storage type is determined at deployment time, not per-image
- **Pagination**: Standard cursor-based or offset-based pagination with page size selector will be used (consistent with existing project patterns)
- **Soft Deletes**: All deletions use soft-delete pattern with `is_deleted` flag rather than hard deletes (consistent with existing project patterns)
- **Audit Trail**: All create/update operations will track `created_by`, `updated_by`, `created_at`, `updated_at` fields (consistent with existing project patterns)
- **Styling**: Both sections will use existing project theme system with Tailwind CSS and support for light/dark modes
- **Volume**: Initial MVP targets approximately 20 FAQ entries and unlimited Magazine entries; performance optimizations apply at 1000+ record scales
- **Deployment**: Feature will deploy to production environment following existing deployment checklist procedures
- **Dependencies**: Feature depends on existing Prisma, database, Clerk authentication, and style library infrastructure
