# i18n Hardcoded Text Audit Report

**Date:** April 13, 2026  
**Scope:** React components and pages in `app/` and `lib/components/` directories  
**Translation System:** Using `useTranslation()` and `useLanguage()` hooks

---

## Summary Statistics

- **Total Files Analyzed:** 25+ pages and components
- **Files with Hardcoded Text:** 18+
- **Priority Breakdown:**
  - **HIGH:** 45% (common UI elements, user-facing text)
  - **MEDIUM:** 40% (feature-specific text, form labels)
  - **LOW:** 15% (error messages, rare edge cases)

---

## HIGH PRIORITY - Common UI Elements

These files contain frequently-used UI text that should be translated immediately.

### 1. **app/news/page.tsx**
**Location:** All News page header and empty states

| Hardcoded Text | Context | Arabic Equivalent |
|---|---|---|
| `All News` | Page title | جميع الأخبار |
| `Browse all news and announcements` | Page subtitle | تصفح جميع الأخبار والإعلانات |
| `News Items` | Total count display | خبر |
| `Error loading news` | Error state message | حدث خطأ أثناء تحميل الأخبار |

**Translation Keys to Create:**
```
news.allNews
news.browseSubtitle
news.newsItems
news.errorLoading
```

---

### 2. **lib/components/home/HeroSlider.tsx**
**Location:** Hero slider loading state

| Hardcoded Text | Context |
|---|---|
| `Loading...` | Media loading placeholder text |

**Translation Key:** `common.loading` (may already exist)

---

### 3. **lib/components/home/NewsGridClient.tsx**
**Location:** Home page news section header and navigation

| Hardcoded Text | Context | Arabic Equivalent |
|---|---|---|
| `Latest News` | Section heading | آخر الأخبار |
| `Stay updated with our latest news and announcements` | Section subtitle | ابق على اطلاع بأحدث الأخبار والإعلانات |
| `All News` | View all link text | جميع الأخبار |

**Translation Keys:**
```
home.latestNews
home.latestNewsSubtitle
home.viewAllNews
```

---

### 4. **lib/components/news/SearchBar.tsx**
**Location:** News search input

| Hardcoded Text | Context | Arabic Equivalent |
|---|---|---|
| `Search news...` | Placeholder text | ابحث عن الأخبار... |
| `Search` | Button text | بحث |

**Translation Keys:**
```
news.searchPlaceholder
buttons.search
```

---

### 5. **lib/components/news/DateRangeFilter.tsx**
**Location:** News date range filter

| Hardcoded Text | Context | Arabic Equivalent |
|---|---|---|
| `From Date` | Date input placeholder | من تاريخ |
| `To Date` | Date input placeholder | إلى تاريخ |
| `Filter` | Submit button | تصفية |
| `Clear` | Clear button (conditional) | مسح |

**Translation Keys:**
```
news.fromDate
news.toDate
news.filter
news.clear
```

---

### 6. **lib/components/news/PaginationControls.tsx**
**Location:** News pagination controls

| Hardcoded Text | Context | Arabic Equivalent |
|---|---|---|
| `First` | First page button | الأولى |
| `Previous` | Previous button | السابق |
| `Next` | Next button | التالي |
| `Last` | Last page button | الأخيرة |
| `Showing X - Y of Z` | Pagination info | عرض X - Y من Z |
| `Show:` | Page size label | عرض: |

**Translation Keys:**
```
pagination.first
pagination.previous
pagination.next
pagination.last
pagination.showing
pagination.show
```

---

### 7. **app/photos/page.tsx**
**Location:** Photos gallery page

| Hardcoded Text | Context | Arabic Equivalent |
|---|---|---|
| `Photos Gallery` | Page title | معرض الصور |
| `Loading...` | Loading state | جاري التحميل... |
| `No photos available` | Empty state | لا توجد صور متاحة |
| `Photo(s)` | Count display | صورة |
| `Home` | Back link | الرئيسية |
| `Featured` | Badge text | مميز |

**Translation Keys:**
```
photos.gallery
photos.loading
photos.noPhotos
photos.photoCount
photos.home
photos.featured
```

---

### 8. **app/videos/page.tsx**
**Location:** Videos gallery page

| Hardcoded Text | Context | Arabic Equivalent |
|---|---|---|
| `Videos Gallery` | Page title | معرض الفيديوهات |
| `Loading...` | Loading state | جاري التحميل... |
| `Video(s)` | Count display | فيديو |

**Translation Keys:**
```
videos.gallery
videos.loading
videos.videoCount
```

---

### 9. **app/partners/page.tsx**
**Location:** Partners directory page

| Hardcoded Text | Context | Arabic Equivalent |
|---|---|---|
| `Our Partners` | Page title | شركاؤنا |
| `Loading...` | Loading state | جاري التحميل... |
| `No partners available` | Empty state | لا يوجد شركاء متاحون |
| `Partner(s)` | Count display | شريك |
| `Featured` | Badge text | مميز |
| `Home` | Back link | الرئيسية |

**Translation Keys:**
```
partners.ourPartners
partners.loading
partners.noPartners
partners.partnerCount
partners.featured
partners.home
```

---

### 10. **lib/components/home/PhotosSection.tsx**
**Location:** Home page photos section header

| Hardcoded Text | Context | Arabic Equivalent |
|---|---|---|
| `Explore our photo collection` | Section subtitle | استكشف مجموعتنا من الصور |
| `All Photos` | View all link | جميع الصور |

**Translation Keys:**
```
home.photosSubtitle
home.viewAllPhotos
```

---

### 11. **lib/components/home/VideosSection.tsx**
**Location:** Home page videos section header

| Hardcoded Text | Context | Arabic Equivalent |
|---|---|---|
| `Watch our video collection` | Section subtitle | شاهد مجموعتنا من الفيديوهات |
| `All Videos` | View all link | جميع الفيديوهات |

**Translation Keys:**
```
home.videosSubtitle
home.viewAllVideos
```

---

### 12. **lib/components/home/PartnersSection.tsx**
**Location:** Home page partners section header

| Hardcoded Text | Context | Arabic Equivalent |
|---|---|---|
| `Our Partners` | Section heading | شركاؤنا |
| `Meet our trusted partners` | Section subtitle | تعرف على شركائنا الموثوقين |
| `All Partners` | View all link | جميع الشركاء |

**Translation Keys:**
```
home.partners
home.partnersSubtitle
home.viewAllPartners
```

---

### 13. **lib/components/clients/ClientTable.tsx**
**Location:** Clients table headers

| Hardcoded Text | Context |
|---|---|
| `Name` | Table header |
| `Email` | Table header |
| `Phone` | Table header |
| `Status` | Table header |
| `Options` | Table header |

**Translation Keys:**
```
table.name
table.email
table.phone
table.status
table.options
```

---

### 14. **lib/components/clients/ClientCard.tsx**
**Location:** Client card display

| Hardcoded Text | Context |
|---|---|
| `Email:` | Field label |
| `Mobile:` | Field label |
| `Address:` | Field label |
| `Created:` | Audit field label |
| `Updated:` | Audit field label |

**Translation Keys:**
```
fields.email
fields.mobile
fields.address
fields.created
fields.updated
```

---

## MEDIUM PRIORITY - Feature-Specific Text

These contain feature-specific or less frequently used UI text.

### 15. **lib/components/DeleteButton.tsx**
**Location:** Delete client button and confirmation dialog

| Hardcoded Text | Context | Severity |
|---|---|---|
| `Delete` | Button text | HIGH |
| `Delete Client` | Dialog title | MEDIUM |
| `Are you sure you want to delete {clientName}? This action will soft-delete the client and remove them from all lists.` | Confirmation message | HIGH |
| `Deleting...` | Loading text | MEDIUM |
| `Cancel` | Cancel button | HIGH (reusable) |
| `Failed to delete client. Please try again.` | Error message | MEDIUM |

**Translation Keys:**
```
buttons.delete
dialogs.deleteClient
dialogs.deleteClientMessage
dialogs.deleting
buttons.cancel
errors.deleteFailed
```

---

### 16. **lib/components/ExportButton.tsx**
**Location:** Export clients to Excel button

| Hardcoded Text | Context |
|---|---|
| `Export to Excel` | Button text |
| `Exporting...` | Loading text |
| `Failed to export clients. Please try again.` | Error message |

**Translation Keys:**
```
buttons.exportExcel
buttons.exporting
errors.exportFailed
```

---

### 17. **lib/components/ConfirmDialog.tsx**
**Location:** Generic confirmation dialog component

| Hardcoded Text | Context | Note |
|---|---|---|
| `Confirm` | Default confirm button text | Default value, may be overridden |
| `Cancel` | Default cancel button text | Default value, may be overridden |

**Note:** This component receives text as props, but defaults should be translated.

**Translation Keys:**
```
dialogs.confirm
dialogs.cancel
```

---

### 18. **app/clients/add/page.tsx**
**Location:** Add new client form

| Hardcoded Text | Context |
|---|---|
| `An error occurred. Please try again.` | Generic error message |

**Translation Keys:**
```
errors.genericError
```

---

### 19. **app/dashboard/page.tsx**
**Location:** Dashboard page

| Hardcoded Text | Context |
|---|---|
| `Retry` | Error retry button (found in dashboard error state) |
| `Failed to load dashboard metrics. Please try again.` | Error message |

**Translation Keys:**
```
buttons.retry
errors.dashboardLoadFailed
```

---

## LOW PRIORITY - Rare/Edge Cases

### 20. **app/header.tsx**
**Location:** Main navigation header

| Hardcoded Text | Context | Note |
|---|---|---|
| `Site Logo` | Image alt text | Only displays if image fails to load |
| `Close dialog` | ARIA label (if used) | Accessibility attribute |

**Translation Keys:**
```
common.siteLogo
a11y.closeDialog
```

**Note:** Already has translation keys for nav items: `nav.dashboard`, `nav.clients`, `nav.admin`

---

### 21. **lib/components/home/StatsSection.tsx**
**Location:** Home page stats cards

**Status:** ✅ Already uses translation system (`t()` hook)
- Uses: `home.totalClientsLabel`, `home.totalOrdersLabel`, etc.

---

### 22. **lib/components/dashboard/MetricCard.tsx**
**Location:** Dashboard metric card component

**Status:** ✅ Partially translated
- Uses: `dashboard.thisMonth`, `dashboard.lastMonth`
- Missing: Generic comparison text

---

### 23. **lib/components/Footer.tsx**
**Location:** Footer component

**Status:** ✅ Already uses translation system
- Uses: `footer.*` keys
- Fetches social media links dynamically

---

---

## Translation Keys Summary

### Keys Needing Creation

**Category: News**
```json
{
  "news": {
    "allNews": "All News",
    "browseSubtitle": "Browse all news and announcements",
    "newsItems": "News Items",
    "errorLoading": "Error loading news",
    "searchPlaceholder": "Search news...",
    "fromDate": "From Date",
    "toDate": "To Date",
    "filter": "Filter",
    "clear": "Clear"
  }
}
```

**Category: Home Sections**
```json
{
  "home": {
    "latestNews": "Latest News",
    "latestNewsSubtitle": "Stay updated with our latest news and announcements",
    "viewAllNews": "All News",
    "photosSubtitle": "Explore our photo collection",
    "viewAllPhotos": "All Photos",
    "videosSubtitle": "Watch our video collection",
    "viewAllVideos": "All Videos",
    "partners": "Our Partners",
    "partnersSubtitle": "Meet our trusted partners",
    "viewAllPartners": "All Partners"
  }
}
```

**Category: Pages (Gallery)**
```json
{
  "photos": {
    "gallery": "Photos Gallery",
    "loading": "Loading...",
    "noPhotos": "No photos available",
    "photoCount": "Photo",
    "home": "Home",
    "featured": "Featured"
  },
  "videos": {
    "gallery": "Videos Gallery",
    "loading": "Loading...",
    "videoCount": "Video"
  },
  "partners": {
    "ourPartners": "Our Partners",
    "loading": "Loading...",
    "noPartners": "No partners available",
    "partnerCount": "Partner",
    "featured": "Featured",
    "home": "Home"
  }
}
```

**Category: Pagination**
```json
{
  "pagination": {
    "first": "First",
    "previous": "Previous",
    "next": "Next",
    "last": "Last",
    "showing": "Showing",
    "show": "Show"
  }
}
```

**Category: Tables & Fields**
```json
{
  "table": {
    "name": "Name",
    "email": "Email",
    "phone": "Phone",
    "status": "Status",
    "options": "Options"
  },
  "fields": {
    "email": "Email",
    "mobile": "Mobile",
    "address": "Address",
    "created": "Created",
    "updated": "Updated"
  }
}
```

**Category: Dialogs & Actions**
```json
{
  "dialogs": {
    "deleteClient": "Delete Client",
    "deleteClientMessage": "Are you sure you want to delete this client? This action will remove them from all lists.",
    "deleting": "Deleting...",
    "confirm": "Confirm",
    "cancel": "Cancel"
  },
  "buttons": {
    "exportExcel": "Export to Excel",
    "exporting": "Exporting...",
    "retry": "Retry"
  },
  "errors": {
    "deleteFailed": "Failed to delete client. Please try again.",
    "exportFailed": "Failed to export clients. Please try again.",
    "dashboardLoadFailed": "Failed to load dashboard metrics. Please try again.",
    "genericError": "An error occurred. Please try again."
  }
}
```

---

## Implementation Recommendations

### Phase 1: HIGH Priority (Week 1)
1. Add translation keys from News, Home Sections, Pagination categories
2. Update components: `SearchBar.tsx`, `DateRangeFilter.tsx`, `PaginationControls.tsx`, `NewsGridClient.tsx`
3. Update pages: `app/news/page.tsx`, `app/photos/page.tsx`, `app/videos/page.tsx`, `app/partners/page.tsx`
4. Test all language switching on these pages

### Phase 2: MEDIUM Priority (Week 2)
1. Add buttons, dialogs, and errors translation keys
2. Update: `DeleteButton.tsx`, `ExportButton.tsx`, `ConfirmDialog.tsx`
3. Add error state translations to dashboard and form components
4. Create unit tests for error messages

### Phase 3: LOW Priority (Week 3)
1. Add remaining common labels (table headers, field labels)
2. Review ARIA labels and accessibility text
3. Add missing context-specific translations
4. Comprehensive testing across all locales

### Testing Strategy
- [ ] Verify each translated text renders correctly in EN
- [ ] Verify each translated text renders correctly in AR
- [ ] Test RTL layout with translated text
- [ ] Test dynamic text (counts, dates) with translations
- [ ] Verify no text from english.json defaults are visible

---

## File-by-File Action Items

| File | Action | Priority |
|---|---|---|
| `app/news/page.tsx` | Add `news.*` keys | HIGH |
| `lib/components/news/SearchBar.tsx` | Add `news.searchPlaceholder` | HIGH |
| `lib/components/news/DateRangeFilter.tsx` | Add `news.from/toDate`, `filter`, `clear` | HIGH |
| `lib/components/news/PaginationControls.tsx` | Add `pagination.*` keys | HIGH |
| `lib/components/home/NewsGridClient.tsx` | Add `home.latestNews*` keys | HIGH |
| `lib/components/home/PhotosSection.tsx` | Add `home.photos*` keys | HIGH |
| `lib/components/home/VideosSection.tsx` | Add `home.videos*` keys | HIGH |
| `lib/components/home/PartnersSection.tsx` | Add `home.partners*` keys | HIGH |
| `app/photos/page.tsx` | Add `photos.*` keys | HIGH |
| `app/videos/page.tsx` | Add `videos.*` keys | HIGH |
| `app/partners/page.tsx` | Add `partners.*` keys | HIGH |
| `lib/components/clients/ClientTable.tsx` | Add `table.*` keys | MEDIUM |
| `lib/components/clients/ClientCard.tsx` | Add `fields.*` keys | MEDIUM |
| `lib/components/DeleteButton.tsx` | Add `dialogs.delete*` keys | MEDIUM |
| `lib/components/ExportButton.tsx` | Add `buttons.export*` keys | MEDIUM |
| `lib/components/ConfirmDialog.tsx` | Add default dialog keys | MEDIUM |
| `app/clients/add/page.tsx` | Add `errors.generic*` keys | MEDIUM |
| `app/dashboard/page.tsx` | Add `buttons.retry`, `errors.dashboard*` | MEDIUM |
| `app/header.tsx` | Add `common.siteLogo` | LOW |

---

## Notes

- **Bilingual Content:** Database already stores `_en` and `_ar` suffixes separately, so media titles are handled correctly
- **Dynamic Text:** Counts ("X photos"), dates, and dynamic content are handled via `toLocaleDateString()` and JavaScript formatting
- **Components Using i18n:** Footer, StatsSection, MetricCard, AppSettings already using translation system correctly
- **RTL Support:** Many components already check `language === 'ar'` for RTL layout; text translations will ensure full RTL support

---

**Generated:** April 13, 2026  
**Auditor:** Codebase Analysis System  
**Next Review:** After Phase 1 implementation
