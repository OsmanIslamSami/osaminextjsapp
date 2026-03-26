# Quickstart Guide: Mobile Responsive UI with Animations

**Feature**: 003-mobile-responsive-animations  
**Branch**: `003-mobile-responsive-animations`  
**Date**: March 26, 2026

## Overview

This guide helps developers implement mobile responsiveness, animations, bilingual support, and social media footer in the Next.js client management application.

---

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (Neon) accessible
- Clerk authentication configured
- Existing project running successfully
- Familiarity with Next.js App Router, Tailwind CSS, Prisma

---

## Getting Started

### 1. Pull Feature Branch

```bash
git checkout 003-mobile-responsive-animations
npm install  # Install any new dependencies (if added)
```

### 2. Database Migration

Run Prisma migration to add `SocialMediaLink` table:

```bash
npx prisma migrate dev --name add_social_media_links
npx prisma generate
```

Verify migration:
```bash
npx prisma studio
# Check that social_media_links table exists
```

### 3. Seed Social Media Links (Optional)

Create default social media links for testing:

```bash
npx tsx scripts/seed-social-media.ts
```

Or manually via Prisma Studio:
- Add records to `social_media_links` table
- Set platform, url, icon_path, display_order

---

## Implementation Checklist

### Phase 1: Database & API (Foundation)

- [ ] Create Prisma migration for `SocialMediaLink` model
- [ ] Add `SocialMediaLink` model to `prisma/schema.prisma`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Create API route: `app/api/social-media/route.ts` (GET, POST)
- [ ] Create API route: `app/api/social-media/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Test API endpoints with Postman or curl
- [ ] Add social media icons to `public/icons/` directory

### Phase 2: Internationalization (i18n)

- [ ] Create translation files: `lib/i18n/translations/en.json` and `ar.json`
- [ ] Create `LanguageContext.tsx` with LanguageProvider
- [ ] Create `useTranslation.ts` custom hook
- [ ] Wrap app in `LanguageProvider` in `app/layout.tsx`
- [ ] Add `<html lang={language} dir={direction}>` to layout
- [ ] Create `LanguageSwitcher` component
- [ ] Add LanguageSwitcher to header
- [ ] Test language switching and RTL layout

### Phase 3: Responsive Header & Navigation

- [ ] Modify `app/header.tsx`:
  - Remove Next.js logo
  - Add mobile menu button (hamburger icon)
  - Hide navigation links on mobile (<768px)
- [ ] Create `MobileMenu` component (slide-out drawer)
- [ ] Add LanguageSwitcher to header
- [ ] Test header on mobile, tablet, desktop breakpoints
- [ ] Verify touch target sizes (44x44px minimum)

### Phase 4: Responsive Pages

- [ ] Dashboard page (`app/dashboard/page.tsx`):
  - Stack metric cards vertically on mobile
  - Make charts responsive
  - Update component imports
- [ ] Clients list (`app/clients/page.tsx`):
  - Switch to card view on mobile or make table scrollable
  - Full-width search bar on mobile
- [ ] Client forms (`app/clients/add/page.tsx`, `[id]/edit/page.tsx`):
  - Full-width inputs on mobile
  - Adequate spacing for touch interaction
- [ ] Login page (`app/login/page.tsx`):
  - Center form on mobile
  - Full-width inputs
- [ ] Test all pages at 320px, 375px, 768px, 1024px widths

### Phase 5: Animations

- [ ] Add animation keyframes to `app/globals.css`
- [ ] Add `prefers-reduced-motion` media query
- [ ] Create `AnimatedPage` wrapper component (optional)
- [ ] Add page transition animations to route changes
- [ ] Add menu slide animation to `MobileMenu`
- [ ] Add hover/focus transitions to buttons and links
- [ ] Add stagger animation to dashboard metric cards (optional)
- [ ] Test animations perform at 60fps on mobile

### Phase 6: Footer

- [ ] Create `Footer` component in `lib/components/Footer.tsx`
- [ ] Fetch social media links via API
- [ ] Render social media icons dynamically
- [ ] Add footer to `app/layout.tsx`
- [ ] Make footer responsive (stack on mobile)
- [ ] Translate footer text using `useTranslation`
- [ ] Verify links open in new tabs with `rel="noopener noreferrer"`

### Phase 7: Testing & Refinement

- [ ] Test on actual mobile devices (iOS Safari, Android Chrome)
- [ ] Test with browser dev tools mobile emulation
- [ ] Verify RTL layout works correctly in Arabic
- [ ] Test all interactive elements with touch (not just mouse)
- [ ] Check accessibility (keyboard navigation, screen reader)
- [ ] Verify `prefers-reduced-motion` disables animations
- [ ] Test performance (Lighthouse mobile score)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

---

## Key File Locations

### New Files to Create

```
lib/i18n/
├── LanguageContext.tsx
├── useTranslation.ts
└── translations/
    ├── en.json
    └── ar.json

lib/components/
├── Footer.tsx
├── LanguageSwitcher.tsx
├── MobileMenu.tsx
└── AnimatedPage.tsx (optional)

app/api/social-media/
├── route.ts
└── [id]/
    └── route.ts

public/icons/
├── facebook.svg
├── twitter.svg
├── instagram.svg
├── linkedin.svg
├── youtube.svg
└── whatsapp.svg

prisma/migrations/
└── 20260326_add_social_media_links/
    └── migration.sql
```

### Files to Modify

```
app/
├── globals.css           # Add animations, responsive utilities
├── header.tsx            # Make responsive, add mobile menu, language switcher
├── layout.tsx            # Add LanguageProvider, Footer
├── page.tsx              # Responsive layout
├── dashboard/page.tsx    # Responsive metric cards
├── clients/page.tsx      # Responsive table/cards
├── clients/add/page.tsx  # Responsive forms
├── clients/[id]/edit/page.tsx  # Responsive forms
├── clients/[id]/view/page.tsx  # Responsive detail view
└── login/page.tsx        # Responsive login form

lib/components/dashboard/
├── MetricCard.tsx        # Responsive sizing
├── DonutChart.tsx        # Responsive chart
├── LatestClients.tsx     # Mobile-friendly list
└── RecentActivity.tsx    # Mobile-friendly list

lib/components/clients/
├── ClientTable.tsx       # Responsive table or card view
├── ClientCard.tsx        # Enhanced mobile spacing
└── ClientSearchBar.tsx   # Full-width on mobile

prisma/
└── schema.prisma         # Add SocialMediaLink model
```

---

## Common Tasks

### Add New Translation String

1. Open `lib/i18n/translations/en.json`
2. Add key-value pair in appropriate section:
   ```json
   {
     "buttons": {
       "newButton": "New Button"
     }
   }
   ```
3. Open `lib/i18n/translations/ar.json`
4. Add matching key with Arabic translation:
   ```json
   {
     "buttons": {
       "newButton": "زر جديد"
     }
   }
   ```
5. Use in component: `const { t } = useTranslation(); return <button>{t('buttons.newButton')}</button>;`

### Add New Social Media Platform

1. Download SVG icon, save to `public/icons/{platform}.svg`
2. Use Prisma Studio or API to create record:
   ```bash
   # Via API (POST /api/social-media)
   curl -X POST http://localhost:3000/api/social-media \
     -H "Content-Type: application/json" \
     -d '{
       "platform": "YouTube",
       "url": "https://youtube.com/@mycompany",
       "icon_path": "/icons/youtube.svg",
       "display_order": 5
     }'
   ```
3. Icon appears automatically in footer after page refresh

### Make Component Responsive

Use Tailwind mobile-first approach:

```typescript
// Before (desktop-only)
<div className="flex flex-row gap-4">
  <div className="w-1/3">...</div>
</div>

// After (mobile-first responsive)
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/3">...</div>
</div>
```

Common breakpoint prefixes:
- No prefix: 0-767px (mobile)
- `md:` 768px-1023px (tablet)
- `lg:` 1024px+ (desktop)

### Add RTL-Aware Styling

```typescript
// Auto-reverses in RTL (no extra work needed)
<div className="ml-4">  // Margin-left in LTR, margin-right in RTL

// Explicit RTL override when needed
<div className="text-left rtl:text-right">

// Prevent element from flipping in RTL
<div className="ltr">
  <Image src="/logo.svg" alt="Logo" />
</div>
```

---

## Testing Guide

### Test Responsiveness

1. Open browser dev tools (F12)
2. Toggle device toolbar (Ctrl+Shift+M or Cmd+Shift+M)
3. Test these viewport widths:
   - 320px (iPhone SE)
   - 375px (iPhone 12/13)
   - 414px (iPhone 12 Pro Max)
   - 768px (iPad)
   - 1024px (Desktop)
4. Verify:
   - No horizontal scrolling
   - All buttons/links tappable (44x44px)
   - Text readable without zooming
   - Forms usable on mobile

### Test RTL Layout

1. Click language switcher to switch to Arabic
2. Verify:
   - Text aligns right
   - Layout mirrors (navigation, forms, etc.)
   - Logos/icons don't flip
   - All functionality works

### Test Animations

1. Navigate between pages
2. Verify smooth transitions (no jank)
3. Enable "Reduce Motion" in OS accessibility settings
4. Verify animations disabled or minimized

### Test API Endpoints

```bash
# Get all social links
curl http://localhost:3000/api/social-media

# Create new link (requires auth)
curl -X POST http://localhost:3000/api/social-media \
  -H "Content-Type: application/json" \
  -d '{"platform":"Facebook","url":"https://facebook.com","icon_path":"/icons/facebook.svg","display_order":1}'

# Update link (requires auth)
curl -X PUT http://localhost:3000/api/social-media/clx123 \
  -H "Content-Type: application/json" \
  -d '{"display_order":5}'

# Delete link (requires auth)
curl -X DELETE http://localhost:3000/api/social-media/clx123
```

---

## Troubleshooting

### Issue: Translations not working

**Symptoms**: Seeing translation keys (e.g., "nav.home") instead of translated text

**Solutions**:
- Verify `LanguageProvider` wraps app in `layout.tsx`
- Check translation files exist: `lib/i18n/translations/en.json` and `ar.json`
- Verify import paths in `LanguageContext.tsx`
- Check browser console for errors

### Issue: RTL layout not applying

**Symptoms**: Arabic text displays but layout doesn't mirror

**Solutions**:
- Verify `<html dir={direction}>` in layout
- Check `direction` is computed correctly in LanguageContext
- Clear browser cache and hard reload
- Ensure Tailwind CSS is processing RTL variants

### Issue: Mobile menu not opening

**Symptoms**: Clicking hamburger icon does nothing

**Solutions**:
- Check mobile menu state management (useState for open/close)
- Verify z-index is high enough (e.g., `z-50`)
- Check CSS transforms are applied correctly
- Verify click handler is attached to button

### Issue: Animations janky on mobile

**Symptoms**: Choppy, laggy animations on mobile devices

**Solutions**:
- Use only `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left` (CPU-intensive)
- Reduce animation duration (200-300ms)
- Test on actual device, not just emulator
- Check for JavaScript blocking main thread

### Issue: API endpoints return 401 Unauthorized

**Symptoms**: Cannot create/update/delete social media links

**Solutions**:
- Verify Clerk authentication is working
- Check auth token is included in request headers
- Verify user has admin role (for POST/PUT/DELETE)
- Check `auth()` is called in API route

---

## Performance Targets

- **Mobile Lighthouse Score**: 90+ (Performance)
- **Time to Interactive**: <3 seconds on 3G
- **Animation FPS**: 60fps on modern mobile devices
- **Bundle Size Increase**: <50KB gzipped (for i18n + animations)
- **API Response Time**: <200ms for social media endpoints

---

## Additional Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [RTL Styling Guide](https://rtlstyling.com/)

---

## Next Steps

After completing implementation:
1. Run `/speckit.tasks` to generate detailed task breakdown
2. Review `tasks.md` for implementation order
3. Create feature branch PR for review
4. Deploy to staging environment for QA testing
5. Collect user feedback on mobile UX
