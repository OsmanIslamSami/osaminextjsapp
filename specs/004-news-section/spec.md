# Feature Specification: News Section

**Feature Branch**: `004-news-section`  
**Created**: March 29, 2026  
**Status**: Draft  
**Input**: User description: "Add New Section to Home page Called News, News should show image and title and Date, slider at home page should be 5 or 6 items only with button called all news, All News Should show all news with pager, Manage News should be from Admin Section, News should have Title En and Ar and Date and Visible"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Latest News on Home Page (Priority: P1)

Visitors to the website see the latest 5-6 news items displayed on the home page with an image, title, and date for each item. This provides immediate access to current news without requiring navigation.

**Why this priority**: Core user-facing functionality that delivers immediate value. Users expect to see recent news on the home page, and this represents the minimal viable feature.

**Independent Test**: Navigate to home page and verify news section displays with 5-6 items showing image, title, and date. Can be tested without implementing pagination or admin features.

**Acceptance Scenarios**:

1. **Given** a visitor accesses the home page, **When** the page loads, **Then** they see a News section displaying up to 6 visible news items
2. **Given** news items exist in the system, **When** viewing the News section, **Then** each item displays an image, title (in current language), and publication date
3. **Given** the user is viewing in English, **When** the News section loads, **Then** English titles are displayed
4. **Given** the user is viewing in Arabic, **When** the News section loads, **Then** Arabic titles are displayed
5. **Given** less than 6 news items are marked as visible, **When** the News section loads, **Then** only the available visible items are shown

---

### User Story 2 - View All News with Pagination (Priority: P2)

Users can click an "All News" button on the home page to navigate to a dedicated page showing all published news items with pagination support, allowing them to browse the complete news archive.

**Why this priority**: Extends the basic news viewing capability to handle large volumes of news. Users need access to older news items beyond the 5-6 shown on home page.

**Independent Test**: Click "All News" button from home page and verify full news listing page displays with pagination controls. Can be tested with basic news display already implemented.

**Acceptance Scenarios**:

1. **Given** the News section on home page, **When** user clicks "All News" button, **Then** they navigate to a dedicated All News page
2. **Given** more than 10 news items exist, **When** viewing All News page, **Then** news items are displayed with pagination controls
3. **Given** viewing All News page, **When** user clicks a page number, **Then** the corresponding page of news items loads
4. **Given** viewing a news item, **When** displayed, **Then** it shows the full image, title (in current language), and publication date
5. **Given** news items are sorted by date, **When** All News page loads, **Then** newest items appear first

---

### User Story 3 - Admin Manages News Content (Priority: P3)

Administrators can create, edit, delete, and publish/hide news items through the admin section, controlling what news appears on the website.

**Why this priority**: Required for content management but doesn't directly impact end users. Can be developed after basic viewing functionality is working.

**Independent Test**: Login as admin, navigate to News management section, and perform CRUD operations on news items. Changes should reflect on home page and All News page.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they navigate to Admin section, **Then** they see a "News" or "Manage News" menu option
2. **Given** admin is in News management, **When** they click "Add News", **Then** they see a form to create a new news item
3. **Given** creating a news item, **When** admin fills required fields (Title EN, Title AR, Image, Date, Visible), **Then** they can save the news item
4. **Given** an existing news item, **When** admin edits it, **Then** changes are saved and reflected on the website
5. **Given** an existing news item, **When** admin marks it as not visible, **Then** it no longer appears on home page or All News page
6. **Given** a news item marked as hidden, **When** admin marks it as visible, **Then** it appears on home page (if in top 6) and All News page
7. **Given** news items exist, **When** admin views the management list, **Then** they can see all news items with their visibility status
8. **Given** admin is adding/editing news, **When** selecting an image, **Then** they see two options: "Choose from Style Library" and "Upload File"
9. **Given** admin chooses from Style Library, **When** image is selected, **Then** the news item is saved with storage_type='blob' and image served from Vercel Blob
10. **Given** admin uploads a file directly, **When** upload completes, **Then** the news item is saved with storage_type='local' and image stored in database
11. **Given** admin views news management list, **When** reviewing news items, **Then** each item displays its storage type (Blob or Local) with visual indicator

---

### Edge Cases

- What happens when no news items are marked as visible? (Display empty state or hide News section)
- How does the system handle news items without images? (Display placeholder image or text-only card)
- What happens when Title EN or Title AR is missing? (Fall back to available language or show placeholder)
- How does pagination behave when there are exactly 10, 20, or other page-boundary counts? (Calculate pages correctly)
- What happens when admin attempts to save news without required fields? (Validation error)
- How are news items sorted when multiple items have the same date? (Use creation timestamp or ID as secondary sort)
- What happens on mobile devices with the news layout? (Responsive design with appropriate grid/card layout)
- What happens if a blob-stored image URL becomes invalid or deleted? (Display placeholder and allow re-upload)
- What happens if image upload to database fails due to file size? (Show clear error message with size limit)
- How does the system handle switching storage types for an existing news item? (Treat as new image upload, clean up old storage if needed)
- What happens when trying to upload unsupported image formats? (Validation error before upload)

## Clarifications

### Session 2026-03-29

- Q: How should news images be uploaded and stored in the system? → A: Images should work exactly like slider images with two storage options: (1) Choose from Style Library which uses Vercel Blob storage (storage_type='blob'), or (2) Upload file directly which stores in local database with file data (storage_type='local'). Admin interface should provide both options with clear indication of storage type.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a News section on the home page showing up to 6 visible news items (exact count: min(6, total_visible_items))
- **FR-002**: System MUST display each news item with an image, title, and publication date
- **FR-003**: System MUST support bilingual titles (English and Arabic) for each news item
- **FR-004**: System MUST display titles in the current user's selected language
- **FR-005**: System MUST show newest news items first on both home page and All News page
- **FR-006**: System MUST provide an "All News" button/link on the home page News section
- **FR-007**: System MUST display all visible news items on the All News page with pagination
- **FR-008**: System MUST paginate news items on All News page with 12 items per page
- **FR-009**: System MUST provide admin interface for managing news items in the Admin section
- **FR-010**: Admins MUST be able to create new news items with Title EN, Title AR, Image, Date, and Visible flag
- **FR-011**: Admins MUST be able to edit existing news items
- **FR-012**: Admins MUST be able to delete or hide news items
- **FR-013**: System MUST only display news items marked as "Visible" to public users
- **FR-014**: System MUST allow admins to toggle news item visibility without deletion
- **FR-015**: System MUST validate that news items have at least one title (EN or AR) before saving
- **FR-016**: Admins MUST be able to choose news images from Style Library (Vercel Blob storage)
- **FR-017**: Admins MUST be able to upload news images directly to local database storage
- **FR-018**: System MUST track image storage type (blob or local) for each news item
- **FR-019**: System MUST serve news images from the appropriate storage location based on storage_type
- **FR-020**: Admin interface MUST display storage type indicator when managing news images
- **FR-021**: System MUST provide keyword search functionality on title_en and title_ar fields on All News page and Admin News Management page
- **FR-022**: System MUST provide date range filtering (from date and to date) on published_date field with search button on All News page and Admin News Management page
- **FR-023**: Admins MUST be able to export filtered news data to Excel format (.xlsx) including all columns and respecting current search/filter parameters
- **FR-024**: System MUST display news metrics on dashboard page (total news count and latest 5 news items)

### Key Entities

- **News**: Represents a news article/item with the following attributes:
  - Unique identifier
  - Title in English (title_en)
  - Title in Arabic (title_ar)
  - Image URL (image_url - path or URL to the image based on storage type)
  - Image storage type (storage_type - 'blob' for Vercel Blob or 'local' for database storage)
  - Image file data (file_data - binary data for locally stored images, null for blob storage)
  - Image metadata (file_name, file_size, mime_type - for local storage)
  - Publication date
  - Visibility flag (is_visible - boolean indicating if displayed publicly)
  - Creation timestamp (for internal tracking)
  - Update timestamp (for internal tracking)
  - Deletion status (soft delete flag)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view latest news on home page with Largest Contentful Paint (LCP) under 2 seconds on 4G connection (measured via Lighthouse)
- **SC-002**: Home page displays exactly 5-6 news items (or fewer if less than 6 visible items exist)
- **SC-003**: Users can navigate to All News page with one click from home page
- **SC-004**: All News page displays all visible news items with pagination working correctly
- **SC-005**: Admins can create a new news item in under 1 minute
- **SC-006**: Changes to news visibility reflect immediately on public pages (after cache refresh)
- **SC-007**: News section is responsive and displays correctly on mobile, tablet, and desktop devices
- **SC-008**: News titles display correctly in both English and Arabic based on user's language selection
- **SC-009**: Pagination on All News page allows users to navigate through all news items without errors

## Assumptions

- Existing bilingual infrastructure (language context/switching) will be reused for news titles
- Admin UI will follow existing patterns established in Slider and Social Media management
- News items will use soft deletion (is_deleted flag) similar to other entities in the system
- Default page size for pagination will be 10-12 items per page
- News items on home page will be limited to exactly 6 items (or the number of visible items if less than 6)
- News images will use the same dual storage approach as slider images:
  - **Blob storage**: Images from Style Library stored in Vercel Blob, referenced by full URL
  - **Local storage**: Directly uploaded images stored as binary data in database, served via API endpoint
  - Storage type tracked via storage_type field ('blob' or 'local')
- The feature will integrate with existing authentication/permission system for admin access
- News section on home page will be placed after the hero slider
- Date display will use standard format consistent with system locale settings
- News items without images will display a default placeholder image
- If a title in the current language is missing, the system will fall back to the alternative language
- Admin interface will provide both "Choose from Style Library" and "Upload File" options similar to slider management
- Image upload will follow same size limits and file type restrictions as slider (10MB, jpeg/png/gif formats)
