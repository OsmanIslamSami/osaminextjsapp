# Feature Specification: Media Library Home Sections

**Feature Branch**: `005-media-library-home`  
**Created**: March 30, 2026  
**Status**: Draft  
**Input**: User description: "we need New Feature for Media Library photoes and Videos, it should Display Two Sections At Home Page Like News , Photoes Section Also should display 5 items with slider and Title and View all Photoes, Videos Section Should Display 6 Videos with background default image, Both Photoes and Video ara clickable, On click it should popup display and View photo or Video. both Sections Should be manages by Admin Center, also we need to add checkBox button to Admin Panel for each tab at Home Sections whether to be displayed on Home Page or not like visibility, so if i want to View videos section at home page or hide it completely, Also add third Section of partners with Slider Card by card with also button to view all partners, Arabic mode should be handled by default for all features"

## Clarifications

### Session 2026-03-30

- Q: How do administrators control which specific items appear on the home page (the 5 photos, 6 videos, and partners in the slider)? → A: Most recent by published date with optional featured flag override - System automatically shows the most recently published items, but admins can mark items as "featured" to pin them to the home page regardless of publish date
- Q: Should the partners slider on the home page cycle through ALL visible partners, or only show a limited number? → A: Show all visible partners by default, with admin option to specify maximum number - Admin Center provides setting to either show all visible partners or limit to a specified number (e.g., show only 8 partners)
- Q: How should items be sorted on the full gallery pages (Photos gallery, Videos gallery, Partners page)? → A: Most recent first (descending by published date) - Newest published items appear first on gallery pages, making it easy for visitors to see latest content immediately
- Q: Can visitors navigate to the next/previous photo or video while the popup is open, or must they close the popup and click another item? → A: Navigate within popup - Popup includes previous/next arrows allowing visitors to browse through all photos (or videos) without closing the popup
- Q: Can visitors navigate to the next/previous photo or video while the popup is open, or must they close the popup and click another item? → A: Navigate within popup - Popup includes previous/next arrows allowing visitors to browse through all photos (or videos) without closing the popup

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Photos from Home Page (Priority: P1)

Visitors can view featured photos directly from the home page and access the full photo gallery with a single click. The photos section displays 5 featured photos in a slider format with a title and "View All Photos" link.

**Why this priority**: Photos are primary visual content that drives user engagement on the home page. This provides immediate value by showcasing visual content.

**Independent Test**: Can be fully tested by adding photos through admin panel, verifying they appear in the home page slider (5 items), clicking individual photos to view in popup, and clicking "View All Photos" to see the complete gallery. Delivers immediate visual engagement value.

**Acceptance Scenarios**:

1. **Given** the photos section is visible on home page, **When** a visitor views the home page, **Then** they see a slider displaying 5 featured photos with a section title
2. **Given** photos are displayed in the slider, **When** a visitor clicks on any photo, **Then** a popup opens displaying the full-size photo with close functionality and navigation arrows
3. **Given** a photo popup is open, **When** a visitor clicks the "next" arrow, **Then** the popup displays the next photo without closing
4. **Given** a photo popup is open, **When** a visitor uses keyboard arrow keys, **Then** they can navigate to previous/next photos
5. **Given** the photos section is displayed, **When** a visitor clicks "View All Photos", **Then** they are taken to a dedicated page showing all photos in the gallery
6. **Given** the page is in Arabic mode, **When** a visitor views the photos section, **Then** all text (title, "View All Photos") is displayed in Arabic and the slider direction is RTL

---

### User Story 2 - Browse Videos from Home Page (Priority: P1)

Visitors can view featured videos directly from the home page and access the full video gallery. The videos section displays 6 featured videos with thumbnail images that open in a popup player when clicked.

**Why this priority**: Videos complement photos as primary media content and provide rich user engagement. Equal priority with photos as core media library functionality.

**Independent Test**: Can be fully tested by adding videos through admin panel, verifying 6 videos appear on home page with default thumbnails, clicking a video to play in popup, and accessing full video gallery. Delivers independent media viewing value.

**Acceptance Scenarios**:

1. **Given** the videos section is visible on home page, **When** a visitor views the home page, **Then** they see 6 featured videos displayed with thumbnail images and a section title
2. **Given** videos are displayed with thumbnails, **When** a visitor clicks on any video thumbnail, **Then** a popup opens and plays the video with playback controls and navigation arrows
3. **Given** a video popup is open, **When** a visitor clicks the "next" arrow, **Then** the popup displays the next video without closing
4. **Given** the videos section is displayed, **When** a visitor clicks "View All Videos", **Then** they are taken to a dedicated page showing all videos in the gallery
5. **Given** the page is in Arabic mode, **When** a visitor views the videos section, **Then** all text is displayed in Arabic with RTL layout

---

### User Story 3 - Browse Partners from Home Page (Priority: P2)

Visitors can view partner organizations through a card-based slider on the home page, with each partner displayed as a clickable card showing their image, title, and direct link to their website.

**Why this priority**: Partners section provides business value but is secondary to primary media content. Can be developed independently after core media functionality.

**Independent Test**: Can be fully tested by adding partners through admin panel, verifying they appear in card-by-card slider on home page with image and title, clicking a partner card to visit their website, and accessing the "View All Partners" page. Delivers partnership visibility value independently.

**Acceptance Scenarios**:

1. **Given** the partners section is visible on home page, **When** a visitor views the home page, **Then** they see a card-based slider displaying partner image and title one card at a time
2. **Given** a partner card is displayed, **When** a visitor clicks on the partner card, **Then** they are redirected to the partner's website URL in a new tab/window
3. **Given** the partners slider is displayed, **When** a visitor interacts with the slider, **Then** they can navigate between partner cards using slider controls
4. **Given** the partners section is displayed, **When** a visitor clicks "View All Partners", **Then** they are taken to a dedicated page showing all partners
5. **Given** the page is in Arabic mode, **When** a visitor views the partners section, **Then** all partner titles are displayed in Arabic with RTL layout

---

### User Story 4 - Manage Media and Partners Content (Priority: P1)

Administrators can add, edit, and delete photos, videos, and partner information through the Admin Center, with content immediately reflected on the home page and gallery pages.

**Why this priority**: Content management is critical for maintaining fresh, relevant content. Required for all other user stories to function.

**Independent Test**: Can be fully tested by logging into Admin Center, creating/editing/deleting photos/videos/partners, and verifying changes appear correctly on home page and gallery pages. Delivers content control value.

**Acceptance Scenarios**:

1. **Given** an admin is logged into Admin Center, **When** they navigate to Photos management, **Then** they can add new photos with title (English & Arabic), image file, published date, featured checkbox, and visibility toggle
2. **Given** an admin creates a new photo, **When** they save it, **Then** the system automatically records created by, created date, and sets visibility based on the toggle
3. **Given** an admin is in Photos management, **When** they edit a photo, **Then** the system automatically updates the updated by and updated date fields
4. **Given** an admin edits or deletes a photo, **When** they save changes, **Then** the changes are immediately reflected on the home page and gallery
5. **Given** an admin is logged into Admin Center, **When** they navigate to Videos management, **Then** they can add new videos with title (English & Arabic), YouTube URL, thumbnail/background image, published date, featured checkbox, and visibility toggle
6. **Given** an admin marks a photo or video as featured, **When** they save, **Then** the item appears on the home page before non-featured items regardless of published date
7. **Given** an admin is in Videos management, **When** they edit or delete a video, **Then** the changes are immediately reflected on the home page and gallery
8. **Given** an admin toggles an item's visibility off, **When** they save, **Then** the item disappears from home page and gallery pages
9. **Given** an admin is logged into Admin Center, **When** they navigate to Partners management, **Then** they can add new partners with title (English & Arabic), logo/image upload, website URL, featured checkbox, and visibility toggle
10. **Given** an admin manages partners, **When** they save changes, **Then** the updates appear on the home page partners slider and full partners page with clickable cards
11. **Given** an admin adds a partner with a website URL, **When** visitors view the partner on home page, **Then** clicking the partner card redirects to the partner's website in a new tab
12. **Given** an admin is editing content, **When** they provide content in both languages, **Then** the system stores Arabic and English versions separately

---

### User Story 5 - Control Home Page Section Visibility (Priority: P2)

Administrators can control which sections (Photos, Videos, Partners) appear on the home page by toggling visibility checkboxes in the Admin Center, allowing flexible content display.

**Why this priority**: Provides administrative flexibility but can be added after core content management. Can default to "visible" initially and add toggle controls later.

**Independent Test**: Can be fully tested by accessing section visibility controls in Admin Center, toggling each section on/off, and verifying home page displays only visible sections. Delivers content control flexibility independently.

**Acceptance Scenarios**:

1. **Given** an admin is in Admin Center home sections settings, **When** they view the settings panel, **Then** they see visibility toggle checkboxes for Photos, Videos, and Partners sections
2. **Given** an admin is viewing Partners section settings, **When** they access partners display options, **Then** they can choose between "show all visible partners" or "limit to specific number" with a numeric input field
3. **Given** visibility toggles are displayed, **When** an admin unchecks the Photos section checkbox, **Then** the Photos section is hidden from the home page
4. **Given** a section is hidden, **When** an admin checks its visibility checkbox, **Then** the section reappears on the home page
5. **Given** an admin sets partners display to "limit to 8", **When** they save changes, **Then** only 8 partners appear on the home page slider using featured-first then most-recent logic
6. **Given** an admin toggles section visibility, **When** they save changes, **Then** the changes take effect immediately for all visitors
7. **Given** all sections are toggled off, **When** a visitor views the home page, **Then** none of the media library sections appear

---

### Edge Cases

- What happens when an admin uploads a photo/video but no content exists yet? The section should display an empty state or be automatically hidden until content is added
- How does the system handle very large image files? The system should validate file size limits (recommend 5MB for photos and video thumbnails) and display clear error messages
- What happens when an admin provides an invalid YouTube URL? The system should validate the URL format and display a clear error message before saving
- What happens when an admin provides an invalid partner website URL? The system should validate the URL format and require a valid HTTP/HTTPS URL
- What happens when a partner's website URL is broken or leads to a 404 page? The link should still be clickable but may lead to an error page (external to our system)
- What happens when an admin sets partners display limit to 0 or negative number? The system should validate and require a positive integer (minimum 1)
- What happens when an admin sets partners limit to 100 but only 5 partners exist? Display only the 5 available partners without empty placeholders
- What happens when a YouTube video is deleted or made private? The popup should show an error message indicating the video is unavailable
- What happens when a video fails to load in the popup? The popup should show an error message with option to retry or close
- How does the popup behave on mobile devices with limited screen space? The popup should be responsive and fill available screen space while maintaining aspect ratio
- What happens when a visitor clicks rapidly between photos/videos in popup mode? The popup should handle navigation smoothly without opening multiple popups
- What happens when viewing the first photo/video in popup and clicking "previous" arrow? The navigation should wrap to the last photo/video (circular navigation)
- What happens when viewing the last photo/video in popup and clicking "next" arrow? The navigation should wrap to the first photo/video (circular navigation)
- How do popup navigation arrows behave in Arabic/RTL mode? The arrows should reverse (left arrow = next, right arrow = previous) to match RTL reading direction
- What happens when using keyboard arrow keys to navigate within popup? Left/right arrow keys should navigate to previous/next items (reversed in RTL mode)
- How does the system handle missing video thumbnails? If no thumbnail is provided, display a default placeholder image
- What happens when an admin deletes a photo/video/partner that is currently marked as featured? The item is removed from the home page slider and system fills the slot with the next most recent published item
- What happens when more than 5 photos are marked as featured? The system shows the 5 most recently published featured photos on the home page
- What happens when no items are marked as featured? The system automatically displays the 5 most recently published photos (or 6 videos) based on published date
- What happens when an admin marks a photo as featured but it has a future published date? The item remains hidden until the published date arrives, then appears as featured
- What happens when an item's visibility is toggled off but it's marked as featured? Hidden items do not appear on home page regardless of featured status; system fills the slot with next available item
- How does RTL mode affect slider navigation controls? Slider arrows should reverse direction (right arrow goes to previous, left arrow goes to next) in Arabic mode
- What happens when there are fewer than 5 photos or 6 videos available? Display only the available items without empty placeholders
- What happens when all photos/videos/partners are marked as hidden? The section should display empty state or be automatically hidden
- How does the system handle published dates set in the future? Items with future published dates should remain hidden until that date is reached
- What happens when an admin edits an item but doesn't change the published date? The updated date should change but published date remains as originally set
- How does the system handle items created before the audit fields were implemented? Legacy items should display gracefully with "Unknown" or empty creator fields
- What happens when a partner card is clicked on mobile devices? The external link should open appropriately based on device capabilities (in-app browser or external browser)
- What happens when an admin changes partners display from "show all" (showing 20 partners) to "limit to 5"? The home page updates immediately to show only 5 partners using featured-first logic

## Requirements *(mandatory)*

### Functional Requirements

**Photos Section**:
- **FR-001**: System MUST display a Photos section on the home page with a configurable title in both English and Arabic
- **FR-002**: System MUST display exactly 5 featured photos in a slider/carousel format on the home page
- **FR-003**: System MUST select home page photos by showing items marked as "featured" first, then fill remaining slots with most recent published photos
- **FR-004**: System MUST provide "View All Photos" link/button that navigates to a dedicated photo gallery page
- **FR-005**: System MUST open clicked photos in a popup/modal overlay showing the full-size image
- **FR-006**: Photo popup MUST include previous/next navigation arrows to browse through all visible photos without closing the popup
- **FR-007**: Photo popup MUST include close functionality (X button, ESC key, click outside) to return to previous view
- **FR-008**: System MUST support standard image formats (JPEG, PNG, WebP, GIF)
- **FR-009**: Photos section MUST respect Arabic/RTL layout when language is set to Arabic

**Videos Section**:
- **FR-010**: System MUST display a Videos section on the home page with a configurable title in both English and Arabic
- **FR-011**: System MUST display exactly 6 featured videos with thumbnail images on the home page
- **FR-012**: System MUST select home page videos by showing items marked as "featured" first, then fill remaining slots with most recent published videos
- **FR-013**: System MUST provide "View All Videos" link/button that navigates to a dedicated video gallery page
- **FR-014**: System MUST open clicked videos in a popup/modal with embedded YouTube player controls (play, pause, volume, fullscreen)
- **FR-015**: Video popup MUST include previous/next navigation arrows to browse through all visible videos without closing the popup
- **FR-016**: Video popup MUST include close functionality to return to previous view
- **FR-017**: System MUST support video hosting via YouTube URLs provided by administrators
- **FR-018**: System MUST allow administrators to upload custom background/thumbnail images for each video
- **FR-019**: System MUST display default placeholder thumbnail when no custom thumbnail is provided for a video
- **FR-020**: System MUST validate YouTube URLs to ensure they are properly formatted
- **FR-021**: Videos section MUST respect Arabic/RTL layout when language is set to Arabic

**Partners Section**:
- **FR-022**: System MUST display a Partners section on the home page with a configurable title in both English and Arabic
- **FR-023**: System MUST display partner information in a card-based slider showing one partner card at a time
- **FR-024**: System MUST allow administrators to configure partners display mode: show all visible partners OR limit to a specified maximum number
- **FR-025**: When set to "show all visible", system MUST display all visible partners in the slider using featured-first then most-recent logic
- **FR-026**: When set to "limit to number", system MUST display only the specified number of partners using featured-first then most-recent logic
- **FR-027**: Default partners display mode MUST be "show all visible partners"
- **FR-028**: Each partner card MUST display partner image/logo and title in the current language (English or Arabic)
- **FR-029**: Partner cards MUST be clickable and redirect to the partner's website URL when clicked
- **FR-030**: Partner website links MUST open in a new tab/window to keep the main site accessible
- **FR-031**: Partner cards MUST include navigation controls (previous/next arrows, dots/indicators)
- **FR-032**: System MUST provide "View All Partners" link/button that navigates to a dedicated partners page
- **FR-033**: Partners section MUST respect Arabic/RTL layout when language is set to Arabic

**Admin Management**:
- **FR-034**: Admin Center MUST provide interface to add, edit, and delete photos with fields for title (English & Arabic), image upload, date published, featured checkbox, created by, created date, updated by, updated date, and visibility toggle
- **FR-035**: Admin Center MUST provide interface to add, edit, and delete videos with fields for title (English & Arabic), YouTube URL, thumbnail/background image upload, date published, featured checkbox, and visibility toggle
- **FR-036**: Admin Center MUST provide interface to add, edit, and delete partners with fields for title (English & Arabic), image/logo upload, website URL, featured checkbox, and visibility toggle
- **FR-037**: Admin Center MUST validate uploaded file types and sizes with clear error messages
- **FR-038**: Admin Center MUST validate YouTube URLs and partner website URLs for correct format before saving
- **FR-039**: Admin Center MUST provide visibility toggle checkboxes for each home section (Photos, Videos, Partners)
- **FR-040**: Admin Center MUST provide partners display settings: toggle between "show all visible" or "limit to specific number" with numeric input field
- **FR-041**: When admin selects "limit to specific number", system MUST validate the number is a positive integer
- **FR-042**: Section visibility toggles MUST immediately affect home page display when changed
- **FR-043**: Admin Center MUST support bilingual content entry (English and Arabic) for all media items
- **FR-044**: System MUST allow administrators to mark items as "featured" via checkbox to pin them to home page
- **FR-045**: Featured items MUST appear on home page before non-featured items regardless of published date
- **FR-046**: When fewer than required items are marked as featured, system MUST automatically fill remaining slots with most recent published items
- **FR-047**: System MUST automatically track created by and updated by fields with administrator user information
- **FR-048**: System MUST automatically set created date when item is first added
- **FR-049**: System MUST automatically update updated date when item is modified
- **FR-050**: Individual item visibility toggles MUST prevent hidden items from appearing on home page or gallery pages
- **FR-051**: System MUST allow administrators to set published date independently from created date for photos and videos

**Gallery Pages**:
- **FR-052**: Photo gallery page MUST display only visible photos in a grid or masonry layout
- **FR-053**: Photo gallery page MUST sort photos by published date in descending order (most recent first)
- **FR-054**: Video gallery page MUST display only visible videos with thumbnails in a grid layout
- **FR-055**: Video gallery page MUST sort videos by published date in descending order (most recent first)
- **FR-056**: Partners page MUST display only visible partners as clickable cards with image and title
- **FR-057**: Partners page MUST sort partners by created date in descending order (most recent first) since partners don't have published dates
- **FR-058**: Partner cards on the partners page MUST be clickable and redirect to partner websites
- **FR-059**: All gallery pages MUST support Arabic/RTL layout

**General**:
- **FR-060**: All user-facing text MUST be available in both English and Arabic
- **FR-061**: System MUST automatically switch to RTL layout when Arabic language is selected
- **FR-062**: All popups/modals MUST be keyboard accessible (ESC to close, tab navigation, arrow keys for navigation)
- **FR-063**: System MUST be responsive and functional on mobile, tablet, and desktop devices
- **FR-064**: External links (partner URLs) MUST open in new tabs with appropriate security attributes

### Key Entities

- **Photo**: Represents a photo item with title (English & Arabic), image file/URL, date published, created by (administrator), created date, updated by (administrator), updated date, featured checkbox (pins to home page), visibility toggle, and metadata (file size, dimensions)
- **Video**: Represents a video item with title (English & Arabic), YouTube URL, custom thumbnail/background image, date published, created by (administrator), created date, updated by (administrator), updated date, featured checkbox (pins to home page), visibility toggle, and metadata (thumbnail file size)
- **Partner**: Represents a partner organization with title/name (English & Arabic), logo/image, website URL (clickable hyperlink), created by (administrator), created date, updated by (administrator), updated date, featured checkbox (pins to home page), and visibility toggle
- **HomeSection**: Represents visibility and configuration settings for each home page section (Photos, Videos, Partners) including visibility toggle, section title, display order, and for Partners section: display mode (show all vs. limit to number) and maximum partners count

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors can view featured photos within 1 second of landing on the home page
- **SC-002**: Photo and video popups open in under 500 milliseconds after click
- **SC-003**: Administrators can add new media items (photos/videos/partners) in under 2 minutes including upload time
- **SC-004**: 100% of home page sections adapt correctly to Arabic/RTL mode without layout issues
- **SC-005**: Section visibility toggles take effect immediately (within 1 second) on the home page
- **SC-006**: Mobile users can view and interact with all media sections without horizontal scrolling
- **SC-007**: 95% of users successfully navigate to full gallery pages within one click from home page
- **SC-008**: All popups are dismissible via at least 3 methods (close button, ESC key, click outside)
- **SC-009**: Home page displays correctly with all three sections visible or any combination of sections hidden
- **SC-010**: Sliders function smoothly with less than 100ms delay between slide transitions

## Assumptions

- Users have stable internet connectivity sufficient for loading images and videos
- Administrators have appropriate permissions/roles to access Admin Center media management features
- The existing Admin Center navigation and authentication system will be extended to include media management sections
- Photo file size limit is 5MB per image
- Partner logo/image file size limit is 5MB per image
- Videos are hosted on YouTube and accessed via embed URLs - no video file storage required on the application server
- Default visibility state for all sections is "visible" (checkbox checked) when first configured
- Default visibility state for individual items (photos/videos/partners) is "visible" when created
- The existing language switching mechanism handles English/Arabic toggling and will be reused
- Video playback uses YouTube's embedded player with standard controls
- Video thumbnail images uploaded by administrators have similar size limits to photos (5MB)
- Partner cards are clickable and display: logo/image, title (bilingual), and direct link to partner's website
- Partner website URLs open in new tabs with security attributes (rel="noopener noreferrer")
- The existing News section implementation provides a pattern to follow for similar home page sections
- Mobile responsiveness follows existing project patterns and breakpoints
- Slider/carousel functionality will use a compatible library or custom implementation
- Gallery pages use pagination or lazy loading for large numbers of items (beyond 50-100 items)
- Photo and thumbnail uploads are stored using the existing upload infrastructure (Vercel Blob or similar)
- Featured items selection uses a hybrid approach: items marked with "featured" checkbox appear first on home page, remaining slots are automatically filled with most recent published items
- If more than 5 photos are marked as featured, the most recent featured photos are shown; same logic applies to videos (6 slots)
- For partners, "most recent" means most recently created since they don't have published dates
- Partners display defaults to "show all visible partners" but can be configured to limit to a specific number (e.g., 8, 10, 12)
- When partners display is set to "limit to number", the same featured-first then most-recent logic applies within that limit
- Gallery pages sort items by most recent first (descending by published date for photos/videos, descending by created date for partners)
- Photo and video popups support navigation between items using previous/next arrows without closing the popup
- Popup navigation wraps circularly (from last item, "next" goes to first item; from first item, "previous" goes to last item)
- Popup navigation arrows and keyboard controls respect RTL direction in Arabic mode
- Audit fields (created by, updated by, created date, updated date) are automatically managed by the system
- Published date defaults to current date/time when creating new items but can be manually set by administrators for photos and videos
- Partners do not require a published date (always shown based on visibility and featured status)
- The system has existing user/admin authentication that can be referenced for "created by" and "updated by" fields
- Items with future published dates are treated as drafts and hidden from public view until the published date arrives
