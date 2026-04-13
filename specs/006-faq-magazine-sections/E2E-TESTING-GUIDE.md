# End-to-End Testing Guide: FAQ and Magazine Features

**Feature**: 006-faq-magazine-sections  
**Date**: Generated from implementation  
**Purpose**: Manual testing checklist for FAQ and Magazine features

## Prerequisites

1. **Database seeded** with test data:
   ```bash
   npx tsx scripts/seed-faq-magazines.ts
   ```

2. **Admin user** exists with proper role:
 ```bash
   npx tsx scripts/seed-admin-user.ts
   ```

3. **Development server** running:
   ```bash
   npm run dev
   ```

4. **Two browser windows/tabs**:
   - Window 1: Admin view (logged in as admin)
   - Window 2: Public view (not logged in or regular user)

---

## Test Suite 1: FAQ Feature End-to-End

### Journey 1: Admin Creates FAQ → User Views on Home Page

**Steps**:

1. **Admin creates new FAQ**:
   - Navigate to `/admin/faq`
   - Click "Add New FAQ" button
   - Fill in form:
     - English Question: "What is the refund policy?"
     - Arabic Question: "ما هي سياسة الاسترداد؟"
     - English Answer: "Refunds are processed within 14 days of request."
     - Arabic Answer: "تتم معالجة المبالغ المستردة في غضون 14 يومًا من الطلب."
     - Mark as favorite: ✓ (checked)
   - Click "Save FAQ"
   - **Expected**: Toast notification "FAQ created successfully"
   - **Expected**: Redirected to `/admin/faq` list page
   - **Expected**: New FAQ appears in the list

2. **Verify FAQ appears on home page**:
   - In Window 2, navigate to `/` (home page)
   - Scroll to FAQ section
   - **Expected**: FAQ section visible
   - **Expected**: New FAQ "What is the refund policy?" appears
   - **Expected**: FAQ is in accordion format (collapsed by default)
   - **Expected**: Click question to expand → answer appears
   - **Expected**: Click again → accordion collapses
   - **Expected**: Only one accordion item expanded at a time

3. **Verify bilingual content**:
   - Click language toggle (English ↔ Arabic)
   - **Expected**: FAQ question/answer switch to Arabic
   - **Expected**: Text direction changes to RTL
   - **Expected**: Icons/buttons flip for RTL layout

4. **Verify favorite prioritization**:
   - In Window 1 (admin), create another FAQ without marking as favorite
   - Refresh Window 2 (home page)
   - **Expected**: Favorite FAQ appears before non-favorite FAQ

---

### Journey 2: Admin Edits FAQ → Changes Reflected

**Steps**:

1. **Admin edits FAQ**:
   - Navigate to `/admin/faq`
   - Find FAQ from Journey 1
   - Click "Edit" button
   - Change English Answer to "Refunds are processed within 7 business days."
   - Click "Save"
   - **Expected**: Toast notification "FAQ updated successfully"
   - **Expected**: Updated answer appears in FAQ list

2. **Verify changes on home page**:
   - In Window 2, refresh home page
   - Expand the FAQ accordion item
   - **Expected**: Answer shows "7 business days" (updated content)

---

### Journey 3: Admin Deletes FAQ → Removed from Home Page

**Steps**:

1. **Admin soft-deletes FAQ**:
   - Navigate to `/admin/faq`
   - Find FAQ from Journey 1
   - Click "Delete" button
   - **Expected**: Confirmation dialog appears
   - Click "Confirm"
   - **Expected**: Toast notification "FAQ deleted successfully"
   - **Expected**: FAQ removed from list

2. **Verify removal from home page**:
   - In Window 2, refresh home page
   - Scroll to FAQ section
   - **Expected**: Deleted FAQ no longer appears
   - **Expected**: Other FAQs still visible

---

### Journey 4: FAQ Pagination and Favorites Toggle

**Steps**:

1. **Test pagination**:
   - Navigate to `/admin/faq`
   - **Expected**: Pagination controls visible at bottom
   - **Expected**: "Showing 1-10 of X" text displays correctly
   - Click "Next" button
   - **Expected**: Moves to page 2
   - **Expected**: URL updates with `?page=2`
   - Click page size dropdown, select "20"
   - **Expected**: Displays 20 items per page
   - **Expected**: Total pages recalculated
   - Click "First" button
   - **Expected**: Returns to page 1

2. **Test favorite toggle**:
   - Find any FAQ in the list
   - Click star icon (favorite button)
   - **Expected**: Star fills (becomes solid)
   - **Expected**: FAQ marked as favorite
   - Click star again
   - **Expected**: Star becomes outline (unfavorited)
   - Refresh page
   - **Expected**: Favorite state persists

---

### Journey 5: Dedicated FAQ Page

**Steps**:

1. **Navigate to `/faq`**:
   - From home page, click "View All FAQs" link
   - **Expected**: Redirected to `/faq`
   - **Expected**: All non-deleted FAQs displayed
   - **Expected**: Accordion format maintained
   - **Expected**: Pagination controls present
   - Test expanding/collapsing FAQs
   - **Expected**: Single-open behavior works

---

## Test Suite 2: Magazine Feature End-to-End

### Journey 6: Admin Creates Magazine → User Views on Home Page

**Steps**:

1. **Prepare test files**:
   - Create/download a test image: `magazine-cover.jpg` (max 10MB)
   - Create/download a test PDF: `magazine-sample.pdf` (max 50MB)

2. **Admin creates new Magazine**:
   - Navigate to `/admin/magazines`
   - Click "Add New Magazine" button
   - Fill in form:
     - English Title: "Tech Innovations 2024"
     - Arabic Title: "الابتكارات التقنية 2024"
     - English Description: "Explore the latest technology trends"
     - Arabic Description: "استكشف أحدث اتجاهات التكنولوجيا"
     - Published Date: Select today's date
     - Cover Image: Upload `magazine-cover.jpg`
     - PDF File: Upload `magazine-sample.pdf`
   - Click "Save Magazine"
   - **Expected**: Upload progress indicator appears
   - **Expected**: Toast notification "Magazine created successfully"
   - **Expected**: Redirected to `/admin/magazines` list
   - **Expected**: New magazine appears with thumbnail

3. **Verify Magazine appears on home page**:
   - In Window 2, navigate to `/` (home page)
   - Scroll to Magazine section
   - **Expected**: Magazine section visible
   - **Expected**: Grid layout (5 cards max on large screens)
   - **Expected**: Magazine card shows:
     - Cover image
     - Title: "Tech Innovations 2024"
     - Published date with calendar icon
     - "Download PDF" button

4. **Test PDF download**:
   - Click "Download PDF" button
   - **Expected**: PDF opens in new tab or downloads
   - **Expected**: Correct PDF file is retrieved

5. **Verify responsive layout**:
   - Resize browser window (mobile, tablet, desktop)
   - **Expected**:
     - Mobile (< 640px): 1 card per row
     - Tablet (640-768px): 2 cards per row
     - Desktop (1024px+): 5 cards per row
   - **Expected**: Cards maintain aspect ratio

---

### Journey 7: Admin Edits Magazine → Changes Reflected

**Steps**:

1. **Prepare new test image**:
   - Create/download different image: `magazine-cover-v2.jpg`

2. **Admin edits Magazine**:
   - Navigate to `/admin/magazines`
   - Find Magazine from Journey 6
   - Click "Edit" button
   - Change English Title to "Tech Innovations 2025"
   - Upload new cover image: `magazine-cover-v2.jpg`
   - Click "Save"
   - **Expected**: Toast notification "Magazine updated successfully"
   - **Expected**: Updated title and new image appear in list

3. **Verify changes on home page**:
   - In Window 2, refresh home page
   - Scroll to Magazine section
   - **Expected**: Title shows "Tech Innovations 2025"
   - **Expected**: New cover image displayed

---

### Journey 8: Admin Deletes Magazine → Removed from Home Page

**Steps**:

1. **Admin soft-deletes Magazine**:
   - Navigate to `/admin/magazines`
   - Find Magazine from Journey 6
   - Click "Delete" button
   - **Expected**: Confirmation dialog appears
   - Click "Confirm"
   - **Expected**: Toast notification "Magazine deleted successfully"
   - **Expected**: Magazine removed from list

2. **Verify removal from home page**:
   - In Window 2, refresh home page
   - Scroll to Magazine section
   - **Expected**: Deleted Magazine no longer appears
   - **Expected**: Remaining magazines still visible

---

### Journey 9: Magazine Pagination

**Steps**:

1. **Test pagination**:
   - Navigate to `/admin/magazines`
   - **Expected**: Pagination controls visible at bottom
   - **Expected**: "Showing 1-10 of X" text displays correctly
   - Click "Next" button
   - **Expected**: Moves to page 2
   - Click page size dropdown, select "50"
   - **Expected**: Displays up to 50 items per page
   - Click "Last" button
   - **Expected**: Jumps to final page
   - Click "Previous" button
   - **Expected**: Moves back one page

---

### Journey 10: Dedicated Magazine Page

**Steps**:

1. **Navigate to `/magazines`**:
   - From home page, click "View All Magazines" link (if hasMore is true)
   - **Expected**: Redirected to `/magazines`
   - **Expected**: All non-deleted magazines displayed
   - **Expected**: Grid layout maintained
   - **Expected**: Pagination controls present
   - Test download links
   - **Expected**: All PDF downloads work correctly

---

## Test Suite 3: Animations and Performance

### Journey 11: Scroll Animations

**Steps**:

1. **Test FAQ section animations**:
   - Navigate to home page
   - Scroll down slowly to FAQ section
   - **Expected**: Section fades in and slides up when 20% visible
   - **Expected**: Background shapes move at different speed (parallax)
   - **Expected**: FAQ accordion items appear one by one (stagger animation)
   - **Expected**: Animations smooth (60fps)

2. **Test Magazine section animations**:
   - Continue scrolling to Magazine section
   - **Expected**: Section fades in and slides up
   - **Expected**: Background decorative elements move with parallax
   - **Expected**: Magazine cards appear sequentially with stagger
   - **Expected**: Hover over card → subtle scale and shadow animation

3. **Test reduced motion preference**:
   - Enable "Reduce motion" in OS accessibility settings
   - Refresh home page
   - Scroll to FAQ and Magazine sections
   - **Expected**: Animations either disabled or simplified
   - **Expected**: Content still visible and functional

---

## Test Suite 4: Accessibility

### Journey 12: Keyboard Navigation

**Steps**:

1. **FAQ Accordion keyboard navigation**:
   - Navigate to home page FAQ section
   - Use Tab key to focus FAQ accordion buttons
   - **Expected**: Visible focus indicator (ring)
   - Press Enter or Space on focused button
   - **Expected**: Accordion expands
   - Press Enter/Space again
   - **Expected**: Accordion collapses
   - Use arrow keys (Down/Up)
   - **Expected**: Focus moves between accordion items

2. **Magazine cards keyboard navigation**:
   - Tab to Magazine cards
   - **Expected**: Focus indicator visible on "Download PDF" buttons
   - Press Enter on focused button
   - **Expected**: PDF downloads/opens

3. **Admin forms keyboard navigation**:
   - Navigate to `/admin/faq/add`
   - Use Tab to move through form fields
   - **Expected**: Logical tab order (top to bottom, left to right)
   - Fill form using only keyboard
   - Press Tab to "Save" button
   - Press Enter
   - **Expected**: Form submits successfully

---

### Journey 13: Screen Reader Testing

**Steps** (with screen reader enabled):

1. **FAQ Section**:
   - Navigate to home page
   - Use screen reader to navigate to FAQ section
   - **Expected**: Section announced as "FAQ Section" (aria-label)
   - Tab to accordion button
   - **Expected**: Announces "Question: [question text]"
   - **Expected**: Announces "Expanded" or "Collapsed" state (aria-expanded)
   - Activate button
   - **Expected**: Content region announced with answer text

2. **Magazine Section**:
- Use screen reader to navigate to Magazine section
   - **Expected**: Section announced as "Magazine Section"
   - Tab to "Download PDF" button
   - **Expected**: Announces "Download [Magazine Title] PDF"
   - **Expected**: Button purpose clear

---

## Test Suite 5: Error Handling

### Journey 14: Error Boundaries

**Steps**:

1. **Test FAQ section error recovery** (requires dev tools):
   - Open browser DevTools Console
   - Navigate to home page
   - Scroll to FAQ section
   - In console, type: `throw new Error('Test error')` (if FAQ section is client component)
   - **Expected**: Error boundary catches error
   - **Expected**: Fallback UI displays: "Failed to Load FAQ Section"
   - **Expected**: "Try Again" button visible
   - Click "Try Again"
   - **Expected**: Section reloads successfully

2. **Test Magazine section error recovery**:
   - Repeat above steps for Magazine section
   - **Expected**: Similar error handling behavior

---

### Journey 15: Form Validation

**Steps**:

1. **Test FAQ form validation**:
   - Navigate to `/admin/faq/add`
   - Leave all fields empty
   - Click "Save"
   - **Expected**: Validation error messages appear
   - Enter question > 500 characters
   - **Expected**: Error message "Question must not exceed 500 characters"
   - Fill all fields correctly
   - Click "Save"
   - **Expected**: Form submits successfully

2. **Test Magazine form validation**:
   - Navigate to `/admin/magazines/add`
   - Try to upload image > 10MB
   - **Expected**: Error message about file size
   - Try to upload non-image file as cover
   - **Expected**: Error message about file format
   - Try to upload non-PDF as download file
   - **Expected**: Error message about PDF format
   - Fill all fields with valid data
   - Click "Save"
   - **Expected**: Form submits successfully

---

## Test Suite 6: Bilingual Support

### Journey 16: English/Arabic Switch

**Steps**:

1. **Test language toggle**:
   - Navigate to home page
   - Current language: English
   -FAQ section:
     - **Expected**: Questions/answers in English
     - **Expected**: Text aligned left (LTR)
     - **Expected**: "Frequently Asked Questions" heading
   - Magazine section:
     - **Expected**: Titles/descriptions in English
     - **Expected**: "Download PDF" button text in English
   - Click language toggle to Arabic
   - **Expected**: Page direction changes to RTL
   - FAQ section:
     - **Expected**: Questions/answers in Arabic
     - **Expected**: Text aligned right
     - **Expected**: "الأسئلة المتكررة" heading
   - Magazine section:
     - **Expected**: Titles/descriptions in Arabic
     - **Expected**: "تحميل PDF" button text
     - **Expected**: Icons flip to right side

2. **Test admin pages in Arabic**:
   - Switch to Arabic
   - Navigate to `/admin/faq`
   - **Expected**: Page title, buttons, labels in Arabic
   - **Expected**: Table headers in Arabic
   - **Expected**: Pagination controls in Arabic
   - Navigate to `/admin/magazines`
   - **Expected**: All UI text in Arabic

---

## Test Suite 7: Data Integrity

### Journey 17: Soft Delete Verification

**Steps**:

1. **Create test FAQ**:
   - Create a new FAQ with unique question
   - Note the FAQ ID

2. **Soft delete FAQ via admin**:
   - Delete the FAQ through admin interface
   - **Expected**: FAQ removed from `/admin/faq` list

3. **Verify FAQ not in public views**:
   - Navigate to home page
   - **Expected**: Deleted FAQ not in FAQ section
   - Navigate to `/faq`
   - **Expected**: Deleted FAQ not in full list

4. **Verify in database** (optional, via Prisma Studio):
   - Run `npx prisma studio`
   - Navigate to FAQ table
   - Find FAQ by ID
   - **Expected**: `is_deleted = true`
   - **Expected**: Record still exists (not hard deleted)

5. **Verify audit trail**:
   - Check `created_by`, `updated_by` fields
   - **Expected**: User IDs present
   - Check `created_at`, `updated_at` timestamps
   - **Expected**: Valid timestamps

---

## Test Suite 8: Performance

### Journey 18: Page Load Performance

**Steps**:

1. **Measure home page load time**:
   - Open DevTools → Network tab
   - Navigate to home page
   - **Expected**: Page loads < 2 seconds
   - **Expected**: FAQ/Magazine sections visible without blocking

2. **Measure admin list page load**:
   - Navigate to `/admin/faq`
   - **Expected**: List loads < 1 second
   - **Expected**: Pagination immediate

3. **Test scroll performance**:
   - Open DevTools → Performance tab
   - Start recording
   - Scroll through home page (FAQ and Magazine sections)
   - Stop recording
   - **Expected**: Frame rate stays at 60fps during scroll
   - **Expected**: No layout thrashing
   - **Expected**: Animations smooth

4. **Test large file upload** (Magazine):
   - Prepare 50MB PDF (maximum allowed)
   - Upload via `/admin/magazines/add`
   - **Expected**: Progress indicator shows upload status
   - **Expected**: Upload completes successfully
   - **Expected**: No timeout errors

---

## Test Suite 9: Edge Cases

### Journey 19: Empty States

**Steps**:

1. **No FAQs exist**:
   - Delete all FAQs via admin
   - Navigate to home page
   - **Expected**: FAQ section does not render (returns null)
   - Navigate to `/faq`
   - **Expected**: Message "No FAQs available" or empty state UI

2. **No Magazines exist**:
   - Delete all Magazines via admin
   - Navigate to home page
   - **Expected**: Magazine section does not render
   - Navigate to `/magazines`
   - **Expected**: Message "No Magazines available" or empty state UI

3. **Exactly 5 FAQs/Magazines**:
   - Create exactly 5 FAQs
   - Navigate to home page
   - **Expected**: All 5 FAQs displayed
   - **Expected**: "View All FAQs" link NOT shown (hasMore = false)

4. **More than 5 FAQs/Magazines**:
   - Create 6 FAQs
   - Navigate to home page
   - **Expected**: First 5 FAQs displayed
   - **Expected**: "View All FAQs" link IS shown (hasMore = true)

---

### Journey 20: Home Sections Visibility Toggle

**Steps**:

1. **Admin toggles FAQ section visibility**:
   - Navigate to `/admin/home-sections`
   - Find "FAQ" section card
   - Click toggle to disable
   - **Expected**: Toggle changes to "Hidden" state
   - Navigate to home page
   - **Expected**: FAQ section does NOT render

2. **Admin re-enables FAQ section**:
   - Return to `/admin/home-sections`
   - Toggle FAQ section to enabled
   - Navigate to home page
   - **Expected**: FAQ section renders again

3. **Repeat for Magazine section**:
   - Test toggling Magazine section visibility
   - **Expected**: Same behavior

---

## Regression Testing Checklist

After all journeys complete, verify:

- [ ] All soft-deleted items remain hidden from public views
- [ ] All API routes require authentication
- [ ] Admin-only routes require admin role
- [ ] Bilingual content displays correctly in both languages
- [ ] All forms have proper validation
- [ ] All CRUD operations show toast notifications
- [ ] Pagination works across all list pages
- [ ] File uploads work for images and PDFs
- [ ] Error boundaries catch and display errors gracefully
- [ ] Accessibility attributes present (ARIA labels, roles, focus indicators)
- [ ] Keyboard navigation works throughout
- [ ] Animations respect reduced motion preference
- [ ] LoadingSpinner appears during async operations
- [ ] Responsive layout works on mobile, tablet, desktop
- [ ] Audit trail captured (created_by, updated_by, timestamps)

---

## Test Results Template

| Journey | Status | Issues Found | Notes |
|---------|--------|--------------|-------|
| J1: Admin Creates FAQ | ✅ / ❌ |  |  |
| J2: Admin Edits FAQ | ✅ / ❌ |  |  |
| J3: Admin Deletes FAQ | ✅ / ❌ |  |  |
| J4: FAQ Pagination | ✅ / ❌ |  |  |
| J5: Dedicated FAQ Page | ✅ / ❌ |  |  |
| J6: Admin Creates Magazine | ✅ / ❌ |  |  |
| J7: Admin Edits Magazine | ✅ / ❌ |  |  |
| J8: Admin Deletes Magazine | ✅ / ❌ |  |  |
| J9: Magazine Pagination | ✅ / ❌ |  |  |
| J10: Dedicated Magazine Page | ✅ / ❌ |  |  |
| J11: Scroll Animations | ✅ / ❌ |  |  |
| J12: Keyboard Navigation | ✅ / ❌ |  |  |
| J13: Screen Reader | ✅ / ❌ |  |  |
| J14: Error Boundaries | ✅ / ❌ |  |  |
| J15: Form Validation | ✅ / ❌ |  |  |
| J16: English/Arabic Switch | ✅ / ❌ |  |  |
| J17: Soft Delete | ✅ / ❌ |  |  |
| J18: Performance | ✅ / ❌ |  |  |
| J19: Edge Cases | ✅ / ❌ |  |  |
| J20: Visibility Toggle | ✅ / ❌ |  |  |

---

## Known Issues / Limitations

*(Document any known issues during testing)*

---

## Sign-Off

**Tested By**: _______________  
**Date**: _______________  
**Overall Status**: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL  
**Production Ready**: YES / NO
