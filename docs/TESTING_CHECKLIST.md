# 🧪 Testing & Quality Assurance Checklist

**Project**: Client Management System  
**Last Updated**: April 13, 2026  
**Target**: Production-ready with 90+ Lighthouse score and WCAG 2.1 AA compliance

---

## 📋 **Testing Overview**

| Test Type | Priority | Time Estimate | Status |
|-----------|----------|---------------|--------|
| Lighthouse Audit | ⭐⭐⭐ Critical | 2 hours | Pending |
| Accessibility Testing | ⭐⭐⭐ Critical | 3 hours | Pending |
| Cross-Browser Testing | ⭐⭐ High | 2 hours | Pending |
| Mobile Device Testing | ⭐⭐ High | 2 hours | Pending |
| Performance Optimization | ⭐⭐ High | 1 hour | Pending |
| Admin CRUD Testing | ⭐ Medium | 1 hour | Pending |
| **TOTAL** | | **11 hours** | **0% Complete** |

---

## 🚦 **1. Lighthouse Audit Checklist**

**Goal**: Achieve 90+ scores in all categories on all major pages

### **Pages to Test**
- [ ] Home Page (`/`)
- [ ] News Page (`/news`)
- [ ] Photos Gallery (`/photos`)
- [ ] Videos Gallery (`/videos`)
- [ ] Partners Page (`/partners`)
- [ ] Dashboard (`/dashboard`)
- [ ] Admin Panel (`/admin`)

### **Performance Metrics (Target: 90+)**
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Total Blocking Time (TBT) < 200ms
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Speed Index < 3.4s

### **Accessibility Metrics (Target: 100)**
- [ ] All images have alt text
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Form labels associated with inputs
- [ ] Color contrast ratios meet WCAG AA (4.5:1)
- [ ] ARIA attributes used correctly
- [ ] Keyboard navigation works

### **Best Practices (Target: 100)**
- [ ] HTTPS enforced
- [ ] No console errors
- [ ] Images properly sized
- [ ] No deprecated APIs
- [ ] Secure headers configured

### **SEO Metrics (Target: 100)**
- [ ] Meta descriptions present
- [ ] Title tags descriptive
- [ ] Valid structured data
- [ ] Robots.txt configured
- [ ] Sitemap.xml available

### **Action Items from Lighthouse**
```bash
# Run Lighthouse locally
npm install -g lighthouse
lighthouse http://localhost:3000 --view

# Run on all pages
lighthouse http://localhost:3000 --view
lighthouse http://localhost:3000/news --view
lighthouse http://localhost:3000/photos --view
lighthouse http://localhost:3000/videos --view
lighthouse http://localhost:3000/partners --view
```

---

## ♿ **2. Accessibility Testing (WCAG 2.1 Level AA)**

### **2.1 Keyboard Navigation**
Test every interactive element can be accessed via keyboard:

**Navigation**:
- [ ] Tab through header navigation
- [ ] `Tab` moves forward, `Shift+Tab` moves backward
- [ ] Focus indicators visible on all elements
- [ ] `Enter` activates links and buttons
- [ ] `Space` activates buttons
- [ ] `Esc` closes modals and dropdowns

**Forms**:
- [ ] All form inputs accessible via Tab
- [ ] Error messages announced to screen readers
- [ ] Submit with Enter on text inputs
- [ ] Radio buttons/checkboxes work with arrow keys

**Admin Panel**:
- [ ] Tab through all admin tabs
- [ ] Table rows keyboard accessible
- [ ] Modal dialogs trap focus
- [ ] File upload accessible

### **2.2 Screen Reader Testing**
**Tools**: NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)

**Test Cases**:
- [ ] Page title announced on navigation
- [ ] Headings properly announced (level + text)
- [ ] Images alt text read aloud
- [ ] Form labels associated and read
- [ ] ARIA live regions work (toasts, errors)
- [ ] Link purpose clear from context
- [ ] Table headers properly announced

**Example Test Script**:
```
1. Navigate to home page
2. Listen to page title: "Home | Client Management System"
3. Tab through navigation
4. Verify each link announces destination
5. Navigate to news section
6. Verify heading "Latest News" announced as H2
7. Tab through news cards
8. Verify each card announces title and date
```

### **2.3 Color Contrast**
**Tool**: axe DevTools Chrome Extension, WAVE

**Requirements** (WCAG AA):
- Normal text: 4.5:1 minimum
- Large text (18pt+ or 14pt+ bold): 3:1 minimum
- UI components: 3:1 minimum

**Elements to Check**:
- [ ] Body text on white background
- [ ] Body text on dark mode background
- [ ] Primary buttons (text on primary color)
- [ ] Secondary buttons
- [ ] Link text (default and visited)
- [ ] Disabled button text
- [ ] Form placeholder text
- [ ] Table header text
- [ ] Footer text on gradient background
- [ ] Admin panel text on dark backgrounds

**Test Command**:
```bash
# Install axe-core CLI
npm install -g @axe-core/cli

# Run accessibility audit
axe http://localhost:3000 --tags wcag2aa
```

### **2.4 Heading Hierarchy**
**Rule**: One H1 per page, logical nesting (no skipping levels)

**Pages to Check**:
- [ ] Home Page: `<h1>` in hero, `<h2>` for sections
- [ ] News Page: `<h1>` for page title, `<h2>` for filters, `<h3>` for articles
- [ ] Photos Page: `<h1>` for gallery title, `<h3>` for photo titles
- [ ] Videos Page: `<h1>` for gallery title, `<h3>` for video titles
- [ ] Partners Page: `<h1>` for page title, `<h3>` for partner names
- [ ] Admin Panel: `<h1>` per page, `<h2>` for sections

### **2.5 Form Accessibility**
**Admin Forms to Test**:
- [ ] News form: Labels, required fields, error messages
- [ ] Photo form: File upload accessible, alt text prompt
- [ ] Video form: URL validation announced
- [ ] Partner form: Logo upload accessible
- [ ] User form: Role dropdown accessible

**Requirements**:
- [ ] All inputs have associated `<label>`
- [ ] Required fields marked with `required` attribute
- [ ] Error messages announced (`aria-invalid`, `aria-errormessage`)
- [ ] Field hints provided (`aria-describedby`)
- [ ] Submit button clearly labeled

### **2.6 Focus Management**
**Modals/Dialogs**:
- [ ] Focus moves to modal on open
- [ ] Tab cycles within modal (focus trap)
- [ ] Esc closes modal
- [ ] Focus returns to trigger button on close
- [ ] Background content inert (`aria-hidden="true"`)

**Dynamic Content**:
- [ ] Toast notifications announced (ARIA live region)
- [ ] Lazy-loaded content announced
- [ ] Infinite scroll provides keyboard alternative

---

## 🌐 **3. Cross-Browser Testing**

**Target Browsers**:
- [ ] **Chrome** (Windows 11 + macOS)
- [ ] **Firefox** (Windows 11 + macOS)
- [ ] **Safari** (macOS + iOS)
- [ ] **Edge** (Windows 11)

### **Feature Compatibility**
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Grid | ✓ | ✓ | ✓ | ✓ |
| CSS Custom Props | ✓ | ✓ | ✓ | ✓ |
| Flexbox | ✓ | ✓ | ✓ | ✓ |
| Sticky Positioning | ✓ | ✓ | ✓ | ✓ |
| CSS Animations | ✓ | ✓ | ✓ | ✓ |
| IntersectionObserver | ✓ | ✓ | ✓ | ✓ |
| Fetch API | ✓ | ✓ | ✓ | ✓ |
| LocalStorage | ✓ | ✓ | ✓ | ✓ |

### **Testing Checklist per Browser**
- [ ] Page loads without errors
- [ ] Animations smooth (60fps)
- [ ] Forms submit correctly
- [ ] File uploads work
- [ ] Images display correctly
- [ ] Fonts load properly (Arabic + English)
- [ ] Theme switching works
- [ ] RTL layout correct (Arabic mode)
- [ ] Responsive breakpoints work

### **Known Browser Issues to Check**
- **Safari**: Sometimes caches aggressively - test cache headers
- **Firefox**: Flexbox gap property support
- **Edge**: Check Vercel Blob URLs load correctly
- **Chrome**: Lighthouse scores may vary by version

---

## 📱 **4. Mobile Device Testing**

**Target Devices**:
- [ ] **iOS**: iPhone 12/13/14 (Safari)
- [ ] **Android**: Pixel 6/7, Samsung Galaxy S22 (Chrome)
- [ ] **Tablet**: iPad Pro, Samsung Galaxy Tab

### **Viewport Sizes to Test**
- [ ] **320px** - iPhone SE (smallest)
- [ ] **375px** - iPhone 12/13
- [ ] **414px** - iPhone 12 Pro Max
- [ ] **768px** - iPad portrait
- [ ] **1024px** - iPad landscape
- [ ] **1440px** - Desktop

### **Mobile-Specific Tests**
**Touch Interactions**:
- [ ] All buttons minimum 44×44px (WCAG AAA)
- [ ] Swipe gestures work (carousels)
- [ ] Pinch-to-zoom enabled (don't disable)
- [ ] Tap targets have spacing (not overlapping)

**Responsive Layouts**:
- [ ] Header collapses to mobile menu
- [ ] Tables convert to stacked layout
- [ ] Forms stack vertically
- [ ] Images scale properly (no overflow)
- [ ] Text readable without zooming (16px minimum)

**Performance on Mobile**:
- [ ] Images lazy load
- [ ] Animations smooth (no jank)
- [ ] Page load < 3s on 3G
- [ ] No horizontal scroll
- [ ] Viewport meta tag correct

**Orientation Handling**:
- [ ] Portrait mode works
- [ ] Landscape mode works
- [ ] Orientation change smooth (no layout shift)

---

## ⚡ **5. Performance Optimization**

### **5.1 Image Optimization**
- [ ] All images use Next.js `<Image>` component
- [ ] Proper `sizes` attribute for responsive images
- [ ] WebP format for modern browsers
- [ ] Lazy loading enabled (`loading="lazy"`)
- [ ] Blur-up placeholders (LQIP)
- [ ] Images compressed (TinyPNG, ImageOptim)

**Current Image Sizes**:
```bash
# Check current image sizes
du -sh public/placeholders/*
du -sh public/uploads/*

# Target sizes:
# - Hero images: < 200KB
# - Thumbnails: < 50KB
# - Icons: < 10KB
```

### **5.2 Code Splitting**
- [ ] Dynamic imports for heavy components
- [ ] Route-based code splitting (Next.js default)
- [ ] Lazy load admin panel components
- [ ] Defer non-critical JavaScript

**Bundle Analysis**:
```bash
# Analyze bundle size
npm run build
# Check .next/static/chunks for large files

# Target:
# - First Load JS: < 200KB
# - Main bundle: < 100KB
```

### **5.3 Caching Strategy**
- [ ] Static assets cached (images, fonts, CSS, JS)
- [ ] API responses cached (stale-while-revalidate)
- [ ] Vercel Blob images cached (1 year)
- [ ] Service worker for offline support (optional)

**Headers to Check**:
```
Cache-Control: public, max-age=31536000, immutable (static assets)
Cache-Control: public, s-maxage=60, stale-while-revalidate (API)
```

### **5.4 Database Query Optimization**
- [ ] Indexes on frequently queried fields (created_at, is_deleted, is_visible)
- [ ] Pagination uses cursor-based (not offset)
- [ ] Select only needed fields (avoid `SELECT *`)
- [ ] Connection pooling configured (Prisma)

**Slow Query Checklist**:
```sql
-- Check indexes exist
SHOW INDEX FROM news;
SHOW INDEX FROM photos;
SHOW INDEX FROM videos;

-- Should have indexes on:
-- - id (primary key)
-- - is_deleted, is_visible (filtered queries)
-- - published_date, created_at (ordering)
```

### **5.5 Font Loading**
- [ ] Fonts preloaded in `<head>`
- [ ] Font display: swap (avoid FOIT)
- [ ] Subset fonts to reduce size
- [ ] Use system fonts as fallback

**Current Fonts**:
- Inter (English)
- Cairo (Arabic)

---

## 🔧 **6. Admin CRUD Testing**

### **6.1 Slider Management**
- [ ] **Create**: Upload image/video/GIF
- [ ] **Create**: Set bilingual title and button text
- [ ] **Read**: View all slides (including hidden)
- [ ] **Update**: Edit slide content
- [ ] **Update**: Toggle visibility
- [ ] **Update**: Reorder slides (drag-drop)
- [ ] **Delete**: Soft delete slide
- [ ] **Upload**: Progress indicator works
- [ ] **Upload**: File type validation (client + server)
- [ ] **Upload**: File size limit (10MB)

### **6.2 News Management**
- [ ] **Create**: Add news with image
- [ ] **Create**: Set bilingual title and content
- [ ] **Read**: Paginated list with filters
- [ ] **Read**: Search by title
- [ ] **Read**: Filter by date range
- [ ] **Update**: Edit existing news
- [ ] **Update**: Toggle visibility
- [ ] **Delete**: Soft delete news
- [ ] **Bulk**: Select multiple items
- [ ] **Bulk**: Bulk delete confirmation
- [ ] **Export**: Export to CSV
- [ ] **Export**: Export to Excel

### **6.3 Photos Management**
- [ ] **Create**: Upload photo with bilingual title/description
- [ ] **Read**: Grid view with show hidden/deleted filters
- [ ] **Update**: Toggle featured status
- [ ] **Update**: Toggle visibility
- [ ] **Delete**: Soft delete photo
- [ ] **Restore**: Restore deleted photo
- [ ] **Bulk**: Bulk delete multiple photos
- [ ] **Pagination**: Navigate pages

### **6.4 Videos Management**
- [ ] **Create**: Add YouTube URL
- [ ] **Create**: Auto-extract video ID
- [ ] **Create**: Auto-generate thumbnail
- [ ] **Read**: Grid view with thumbnails
- [ ] **Update**: Edit video details
- [ ] **Update**: Toggle featured/visible
- [ ] **Delete**: Soft delete video
- [ ] **Preview**: Click to watch in popup

### **6.5 Partners Management**
- [ ] **Create**: Upload logo with title and URL
- [ ] **Read**: Grid view with partner cards
- [ ] **Update**: Edit partner details
- [ ] **Update**: Toggle featured/visible
- [ ] **Delete**: Soft delete partner
- [ ] **External**: Link opens in new tab

### **6.6 Users Management**
- [ ] **Read**: List all users
- [ ] **Update**: Change user role (admin/user)
- [ ] **Update**: Activate user
- [ ] **Update**: Deactivate user
- [ ] **Permissions**: Only admins can access
- [ ] **Sync**: Clerk users auto-sync to database

### **6.7 Social Media Management**
- [ ] **Create**: Add platform with icon and URL
- [ ] **Create**: Set display order
- [ ] **Read**: List social links
- [ ] **Update**: Edit platform details
- [ ] **Delete**: Remove social link
- [ ] **Icons**: Upload custom SVG/PNG icons
- [ ] **Footer**: Links display in footer

### **6.8 App Settings Management**
- [ ] **Home Sections**: Toggle visibility
- [ ] **Home Sections**: Reorder sections
- [ ] **Fonts**: Change Arabic font
- [ ] **Fonts**: Change English font
- [ ] **Themes**: Switch theme
- [ ] **Themes**: Apply color palette
- [ ] **Themes**: Custom colors
- [ ] **Site Info**: Update bilingual title/description
- [ ] **Site Info**: Upload logo
- [ ] **Site Info**: Upload favicon
- [ ] **Site Info**: Upload OG image

---

## 🛠️ **Tools & Extensions**

### **Lighthouse**
```bash
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

### **axe DevTools**
- Install: [Chrome Extension](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
- Run: Open DevTools → axe DevTools tab → Scan All of My Page

### **WAVE**
- Install: [Chrome Extension](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)
- Run: Click WAVE icon in toolbar

### **React Developer Tools**
- Install: [Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Use: Profile component rendering, check props

### **Responsive Design Mode**
- **Chrome**: F12 → Toggle Device Toolbar (Ctrl+Shift+M)
- **Firefox**: F12 → Responsive Design Mode (Ctrl+Shift+M)

### **Color Contrast Checker**
- Tool: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Use: Test foreground/background color combinations

---

## 📊 **Success Criteria**

### **Lighthouse Scores**
✅ **Performance**: 90+  
✅ **Accessibility**: 100  
✅ **Best Practices**: 100  
✅ **SEO**: 100

### **Accessibility**
✅ All pages keyboard navigable  
✅ Screen reader compatible  
✅ WCAG 2.1 Level AA compliant  
✅ Color contrast ratios meet standards  
✅ Proper heading hierarchy

### **Cross-Browser**
✅ Works on Chrome, Firefox, Safari, Edge  
✅ No console errors on any browser  
✅ Animations smooth on all browsers

### **Mobile**
✅ Responsive 320px to 2560px  
✅ Touch targets minimum 44×44px  
✅ No horizontal scroll  
✅ Fast load on mobile networks

### **Performance**
✅ First Load JS < 200KB  
✅ LCP < 2.5s  
✅ CLS < 0.1  
✅ Images optimized

### **Admin CRUD**
✅ All create operations work  
✅ All read operations work  
✅ All update operations work  
✅ All delete operations work  
✅ File uploads successful  
✅ Bulk operations function correctly

---

## 🚀 **Quick Start Testing**

```bash
# 1. Start development server
npm run dev

# 2. Open in browser
http://localhost:3000

# 3. Run Lighthouse audit
lighthouse http://localhost:3000 --view --chrome-flags="--headless"

# 4. Run accessibility audit
axe http://localhost:3000

# 5. Test admin panel (requires admin account)
# Visit: http://localhost:3000/admin
# Test all CRUD operations systematically

# 6. Test on mobile (Chrome DevTools)
# F12 → Toggle Device Toolbar
# Test on iPhone SE, iPhone 12, iPad, desktop viewports
```

---

## 📝 **Bug Tracking Template**

When bugs are found, document them:

```markdown
### **Bug #001: [Short Description]**

**Severity**: Critical / High / Medium / Low  
**Page**: /news  
**Browser**: Chrome 120 / Safari 17 / etc.  
**Device**: Desktop / iPhone 14 / etc.

**Steps to Reproduce**:
1. Navigate to /news
2. Click on news card
3. Observe error

**Expected Behavior**:
News detail page should open

**Actual Behavior**:
404 error displayed

**Screenshot**: [attach if available]

**Fix**: [Describe fix or reference PR]

**Status**: Open / In Progress / Fixed / Verified
```

---

## ✅ **Final Checklist Before Production**

- [ ] All Lighthouse scores 90+
- [ ] All accessibility tests passed
- [ ] All browsers tested
- [ ] All mobile viewports tested
- [ ] All admin CRUD tests passed
- [ ] No console errors
- [ ] No broken links
- [ ] Forms validate correctly
- [ ] Error messages display
- [ ] Success messages display
- [ ] Loading states work
- [ ] 404 page exists
- [ ] 500 error page exists
- [ ] Favicon loads
- [ ] OG images correct
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] SSL certificate valid
- [ ] Environment variables set (production)
- [ ] Database migrations run
- [ ] Vercel Blob configured
- [ ] Clerk webhooks configured

---

**Testing is critical for production readiness. Allocate sufficient time for each section and document all findings.**

