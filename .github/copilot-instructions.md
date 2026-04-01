# Client Management System - Workspace Instructions

## Architecture Overview

**Next.js 16 app** with feature-based component organization, Clerk authentication synced to Neon Postgres, and bilingual (English/Arabic) support.

**Key architectural decisions:**
- **Auth pattern**: Clerk handles authentication; custom DB schema handles authorization, audit trails, and soft deletes
- **User sync**: [lib/components/UserSyncHandler.tsx](../lib/components/UserSyncHandler.tsx) in root layout syncs Clerk users to DB
- **Pagination**: Cursor-based with `hasMore` indicator (see [app/api/clients/route.ts](../app/api/clients/route.ts))
- **Theme/i18n**: Context-based at root ([lib/contexts/AppSettingsContext.tsx](../lib/contexts/AppSettingsContext.tsx), [lib/i18n/LanguageContext.tsx](../lib/i18n/LanguageContext.tsx))

## Code Standards

### Clean Code Principles

**All code must follow clean code practices:**
- **Meaningful names**: Use descriptive variable, function, and component names
- **Single Responsibility**: Each function/component does one thing well
- **DRY (Don't Repeat Yourself)**: Extract reusable logic into utilities/hooks
- **Small functions**: Keep functions focused and concise (ideally < 50 lines)
- **Consistent formatting**: Follow ESLint rules (`npm run lint`)
- **Type safety**: Use TypeScript types, avoid `any` unless absolutely necessary

### Responsive UI Requirements

**All UI components MUST be responsive:**
- **Mobile-first approach**: Design for mobile (320px+), then enhance for larger screens
- **Breakpoints**: Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
  - `sm`: 640px (small tablets)
  - `md`: 768px (tablets)
  - `lg`: 1024px (small laptops)
  - `xl`: 1280px (desktops)
- **Touch targets**: Minimum 44x44px for buttons/interactive elements
- **Flexible layouts**: Use flexbox/grid, avoid fixed widths
- **Test on multiple viewports**: Verify on mobile (375px), tablet (768px), desktop (1440px)

**Example responsive pattern:**
```typescript
// ✅ Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>

// ✅ Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// ✅ Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
```

### TypeScript Standards

- Use **explicit types** for function parameters and return values
- Define **interfaces/types** in `lib/types.ts` or co-located with components
- Use **strict mode** (enabled in tsconfig.json)
- Prefer **type** over **interface** for simple object shapes
- Use **const assertions** (`as const`) for literal types

### Component Standards

- Use **functional components** with hooks
- Add `'use client'` directive for interactive components
- Extract complex logic into **custom hooks** ([lib/hooks/](../lib/hooks/))
- Use **React.memo** for expensive renders
- Handle loading and error states explicitly
- Implement proper **accessibility** (ARIA labels, keyboard navigation)

### Pagination UI Standards

**All pagination components MUST include:**
- **First Page** button (jump to page 1)
- **Previous** button (go to previous page)
- **Page numbers** (show current page and neighboring pages)
- **Next** button (go to next page)
- **Last Page** button (jump to final page)

**Requirements:**
- Disable First/Previous when on first page
- Disable Next/Last when on last page
- Highlight current page number
- Show ellipsis (...) for large page ranges
- Display total count when available (e.g., "Showing 1-10 of 100")

**Example:**
```typescript
<div className="flex items-center justify-center gap-2">
  <button disabled={currentPage === 1}>First</button>
  <button disabled={currentPage === 1}>Previous</button>
  
  {pageNumbers.map(page => (
    <button 
      key={page}
      className={page === currentPage ? 'bg-primary text-white' : ''}
    >
      {page}
    </button>
  ))}
  
  <button disabled={currentPage === totalPages}>Next</button>
  <button disabled={currentPage === totalPages}>Last</button>
</div>
```

## Build and Test

```bash
npm install              # Auto-runs prisma generate
npm run dev              # Start dev server
npm run build            # Prisma generate + Next build
npm test                 # Run Vitest (infrastructure ready, tests pending)
npm run seed-admin       # Create admin user
```

**Critical**: `DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `BLOB_READ_WRITE_TOKEN` must be set before build.

See [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) for full setup process.

## Code Conventions

### Database Patterns

**Always query with soft delete filter:**
```typescript
// ✅ Correct
const items = await prisma.news.findMany({ where: { is_deleted: false } });

// ❌ Missing - returns deleted items
const items = await prisma.news.findMany();
```

**Bilingual content** uses `_en` and `_ar` suffixes:
```typescript
{ title_en: "News", title_ar: "أخبار", description_en: "...", description_ar: "..." }
```

**Audit fields** are required on create/update:
```typescript
created_by: user.id, updated_by: user.id, created_at: now, updated_at: now
```

### File Uploads

**Primary storage**: Vercel Blob (required for production persistence)
- Local uploads don't persist on Vercel—disappear after restart
- Enable in Vercel Dashboard → Storage → Blob
- Maximum 50MB (Vercel body limit is 4.5MB by default)
- Diagnostics endpoint: `/api/style-library/diagnostics`

See [VERCEL_BLOB_SETUP.md](../VERCEL_BLOB_SETUP.md) and [UPLOAD_TROUBLESHOOTING.md](../UPLOAD_TROUBLESHOOTING.md) for details.

### Authentication

**In API routes:**
```typescript
const { userId } = await auth();
if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const user = await prisma.user.findUnique({ where: { clerk_user_id: userId } });
if (user?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

**In components:**
```typescript
const { user, isAdmin, isLoading } = useCurrentUser();
```

### Internationalization

```typescript
const { t, direction, language } = useTranslation();

// Usage
<div dir={direction}>
  <h1>{t('common.welcome')}</h1>
</div>
```

Translations in `lib/i18n/translations/en.json` and `lib/i18n/translations/ar.json` with dot-notation keys.

### Component Organization

- **Feature components**: [lib/components/{feature}](../lib/components/) (clients, admin, news, media, home)
- **Shared utilities**: [lib/components/](../lib/components/) root level (DeleteButton, ConfirmDialog, ExportButton, Toast)
- **UI primitives**: [lib/components/ui/](../lib/components/ui/)
- **All interactive components**: Use `'use client'` directive

### API Response Format

```typescript
// Success
return NextResponse.json({ data: result });

// Paginated
return NextResponse.json({ data: items, hasMore: boolean, nextCursor?: string });

// Error
return NextResponse.json({ error: "Message" }, { status: 400 });
```

## Common Pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| Soft-deleted items appear | Missing `is_deleted: false` filter | Add to all queries |
| File uploads disappear on Vercel | Using local storage | Switch to Vercel Blob |
| Wrong base URL in production | Hard-coded localhost | Use `getBaseUrl()` from [lib/utils/url.ts](../lib/utils/url.ts) |
| OG images fail in Teams | Dynamic API routes | Use file-based [app/opengraph-image.tsx](../app/opengraph-image.tsx) |
| News section empty on Vercel | HTTP fetch in server component | Query DB directly with Prisma |

See [TEAMS_PREVIEW_FIX.md](../TEAMS_PREVIEW_FIX.md) and [VERCEL_FIX_CHECKLIST.md](../VERCEL_FIX_CHECKLIST.md) for deployment-specific issues.

## Theme System

**5 themes** (Default, Modern, Elegant, Minimal, Vibrant) with light/dark variants.

Configuration: [lib/themes/themeConfig.ts](../lib/themes/themeConfig.ts)  
Storage: `app_settings` table  
Usage: CSS custom properties (`var(--color-primary)`, `var(--color-text-primary)`)  

See [THEME_SYSTEM.md](../THEME_SYSTEM.md) for full documentation.

## Project Structure

```
app/                    # Next.js App Router
  ├── api/             # API routes (feature-based)
  ├── admin/           # Admin dashboard pages
  ├── clients/         # Client management pages
  ├── news/            # News section pages
  └── ...
lib/
  ├── components/      # React components (feature-based)
  ├── contexts/        # React contexts (theme, i18n, app settings)
  ├── hooks/           # Custom React hooks
  ├── auth/            # Auth utilities (permissions, sync)
  ├── utils/           # Utility functions
  └── i18n/            # Internationalization
prisma/
  ├── schema.prisma    # Database schema
  └── migrations/      # Database migrations
scripts/               # Seed and utility scripts
specs/                 # Feature specifications (SpecKit workflow)
```

## Related Documentation

- [README.md](../README.md) - Project overview and quick start
- [CLIENTS_SETUP.md](../CLIENTS_SETUP.md) - Client management setup
- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) - Full deployment process
- [IMPLEMENTATION_PROGRESS.md](../IMPLEMENTATION_PROGRESS.md) - Feature implementation status
- [STYLE_LIBRARY.md](../STYLE_LIBRARY.md) - Style library documentation
- [Neon Postgres skill](./../.agents/skills/neon-postgres/SKILL.md) - Database-specific guidance
