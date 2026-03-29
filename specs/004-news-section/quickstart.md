# Quick Start: News Section Development

**Feature**: News Section | **Last Updated**: March 29, 2026

## Overview

This guide helps developers set up, develop, and test the News Section feature locally. Follow these steps to get the feature running on your machine.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: Neon serverless database (or local Postgres 14+)
- **Clerk Account**: For authentication testing
- **Git**: For version control

**Verify Installation**:
```powershell
node --version  # Should show v18.x or higher
npm --version   # Should show v9.x or higher
```

---

## Initial Setup

### 1. Clone and Install Dependencies

```powershell
# Navigate to project root
cd d:\Projects\osaminextjsapp\osaminextjsapp

# Checkout feature branch
git checkout 004-news-section

# Install dependencies (if not already done)
npm install
```

### 2. Environment Configuration

Ensure `.env.local` contains:

```env
# Database
DATABASE_URL="postgresql://user:password@host/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Optional: Vercel Blob (for blob storage)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

**Get Clerk Keys**:
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Copy API keys from "API Keys" section

---

## Database Setup

### 1. Create News Table

Run the Prisma migration to create the `news` table:

```powershell
# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate dev --name add_news_table
```

**Expected Output**:
```
✔ Generated Prisma Client to .\node_modules\.prisma\client
✔ Applied migration: 20260329_add_news_table
```

### 2. Seed Sample Data (Optional)

Create test data for development:

```powershell
# Run seed script
npm run seed:news
```

**Seed Script** (`scripts/seed-news.ts`):
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding news data...');
  
  // Create sample news items
  const newsItems = await prisma.news.createMany({
    data: [
      {
        title_en: 'Company Milestone: 10,000 Clients',
        title_ar: 'إنجاز الشركة: 10,000 عميل',
        image_url: '/api/news/media/sample1', // Placeholder
        storage_type: 'local',
        published_date: new Date('2026-03-15'),
        is_visible: true,
      },
      {
        title_en: 'New Product Launch: Analytics Dashboard',
        title_ar: 'إطلاق منتج جديد: لوحة التحليلات',
        image_url: '/api/news/media/sample2',
        storage_type: 'local',
        published_date: new Date('2026-03-20'),
        is_visible: true,
      },
      {
        title_en: 'Team Expansion: Hiring Developers',
        title_ar: 'توسيع الفريق: توظيف مطورين',
        image_url: '/api/news/media/sample3',
        storage_type: 'local',
        published_date: new Date('2026-03-25'),
        is_visible: true,
      },
    ],
  });
  
  console.log(`Created ${newsItems.count} news items`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Add to `package.json`**:
```json
{
  "scripts": {
    "seed:news": "ts-node scripts/seed-news.ts"
  }
}
```

---

## Development Workflow

### 1. Start Development Server

```powershell
npm run dev
```

Server starts at: `http://localhost:3000`

### 2. Access Key Pages

**Public Pages**:
- Home page (news section): [http://localhost:3000](http://localhost:3000)
- All News page: [http://localhost:3000/news](http://localhost:3000/news)

**Admin Pages**:
- Admin news management: [http://localhost:3000/admin/news](http://localhost:3000/admin/news)
- Login (Clerk): [http://localhost:3000/login](http://localhost:3000/login)

### 3. Admin Access Setup

**Create Admin User**:
```powershell
npm run seed:admin
```

This creates a test admin user in Clerk with permissions:
- `news:read`
- `news:write`
- `news:delete`

**Default Admin Credentials**:
- Email: `admin@example.com`
- Password: (set during Clerk setup)

---

## Testing

### 1. Unit Tests

Test API routes and components:

```powershell
# Run all tests
npm test

# Run news-specific tests
npm test -- news

# Watch mode
npm test -- --watch
```

**Example Test** (`app/api/news/route.test.ts`):
```typescript
import { GET, POST } from './route';
import { prisma } from '@/lib/db';

describe('GET /api/news', () => {
  it('should return visible news only', async () => {
    const request = new Request('http://localhost/api/news?page=1&limit=10');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.news).toBeInstanceOf(Array);
    expect(data.pagination.page).toBe(1);
  });
});

describe('POST /api/news', () => {
  it('should create news with valid data', async () => {
    const body = {
      title_en: 'Test News',
      title_ar: 'اختبار',
      image_url: 'https://example.com/image.jpg',
      storage_type: 'blob',
      published_date: new Date().toISOString(),
    };
    
    const request = new Request('http://localhost/api/news', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
  });
});
```

### 2. Integration Tests

Test full user workflows:

```powershell
# Run with Playwright (if configured)
npm run test:e2e
```

**Example E2E Test** (`tests/news.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test('Admin can create news', async ({ page }) => {
  // Login as admin
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Navigate to news admin
  await page.goto('http://localhost:3000/admin/news');
  
  // Create new news
  await page.click('text=Add News');
  await page.fill('input[name="title_en"]', 'E2E Test News');
  await page.fill('input[name="title_ar"]', 'اختبار E2E');
  await page.click('button[type="submit"]');
  
  // Verify creation
  await expect(page.locator('text=E2E Test News')).toBeVisible();
});

test('Public can view news', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Check news section exists
  await expect(page.locator('h2:has-text("News")')).toBeVisible();
  
  // Check news cards
  const newsCards = page.locator('.news-card');
  await expect(newsCards).toHaveCount(5); // Home page shows 5-6 items
});
```

### 3. Manual Testing Checklist

**News Display (Home Page)**:
- [ ] Home page shows 5-6 latest news items
- [ ] News cards display correct titles (English/Arabic based on language)
- [ ] Images load correctly (both blob and local storage)
- [ ] "All News" button navigates to `/news` page
- [ ] Responsive layout on mobile/tablet/desktop
- [ ] Gradient animations on hover (desktop only)

**All News Page**:
- [ ] Shows all visible news (paginated)
- [ ] Pagination controls work correctly
- [ ] URL updates with page number (`/news?page=2`)
- [ ] Back/forward browser buttons work
- [ ] Empty state shows when no news exists

**Admin Management**:
- [ ] Admin can create news with English/Arabic titles
- [ ] Can upload images (blob or local storage)
- [ ] Can edit existing news
- [ ] Can toggle visibility (show/hide)
- [ ] Can soft delete news
- [ ] Filter works (all/visible/hidden/deleted)
- [ ] Table sorting works
- [ ] Storage type badge displays correctly

**API Endpoints**:
- [ ] `GET /api/news` returns visible news only
- [ ] `GET /api/news/admin` requires authentication
- [ ] `POST /api/news` validates input correctly
- [ ] `PUT /api/news/[id]` updates news
- [ ] `DELETE /api/news/[id]` soft deletes
- [ ] `GET /api/news/media/[id]` serves local images
- [ ] `POST /api/news/upload` accepts image files

---

## Troubleshooting

### Issue: Images not loading

**Symptoms**: News cards show broken image icon

**Solution**:
1. Check `storage_type` in database:
   ```sql
   SELECT id, storage_type, image_url FROM news;
   ```
2. For `blob` type: Verify Vercel Blob token in `.env.local`
3. For `local` type: Ensure `/api/news/media/[id]` endpoint exists
4. Check browser console for CORS errors

### Issue: Migration fails

**Symptoms**: `npx prisma migrate dev` shows error

**Solution**:
```powershell
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Re-run migration
npx prisma migrate dev --name add_news_table
```

### Issue: Authentication errors in admin

**Symptoms**: 401 Unauthorized when accessing `/api/news/admin`

**Solution**:
1. Verify Clerk keys in `.env.local`
2. Check user has `news:read` permission:
   ```typescript
   // In Clerk Dashboard > Users > Select User > Metadata
   {
     "permissions": ["news:read", "news:write", "news:delete"]
   }
   ```
3. Clear browser cookies and re-login

### Issue: TypeScript errors

**Symptoms**: `Property 'news' does not exist on type 'PrismaClient'`

**Solution**:
```powershell
# Regenerate Prisma client
npx prisma generate

# Restart TypeScript server in VS Code
# Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

---

## Development Best Practices

### 1. Database Queries

**Use select to avoid loading large binary data**:
```typescript
// ❌ Bad: Loads entire file_data into memory
const news = await prisma.news.findMany();

// ✅ Good: Excludes binary data
const news = await prisma.news.findMany({
  select: {
    id: true,
    title_en: true,
    title_ar: true,
    image_url: true,
    storage_type: true,
    published_date: true,
    // Exclude: file_data (can be MB large)
  },
});
```

### 2. Image Serving

**Cache locally-served images**:
```typescript
// In /api/news/media/[id]/route.ts
return new Response(news.file_data, {
  headers: {
    'Content-Type': news.mime_type,
    'Cache-Control': 'public, max-age=31536000, immutable',
    // Browser cache for 1 year (images are immutable)
  },
});
```

### 3. Responsive Design

**Test at all breakpoints**:
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1280px (MacBook)
- Large: 1920px (Full HD)

**Use Chrome DevTools**:
1. Press F12
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select device from dropdown

### 4. Gradient Animations

**Optimize performance**:
```css
/* ✅ Good: GPU-accelerated properties */
.news-card {
  transition: transform 0.3s, opacity 0.3s;
}

.news-card:hover {
  transform: translateY(-4px) scale(1.05);
}

/* ❌ Bad: Triggers layout recalculation */
.news-card:hover {
  margin-top: -4px; /* Causes reflow */
}
```

---

## Useful Commands

```powershell
# Database
npx prisma studio             # Open database GUI (http://localhost:5555)
npx prisma db push            # Push schema without migration (dev only)
npx prisma migrate status     # Check migration status

# Development
npm run dev                   # Start dev server
npm run build                 # Production build
npm run start                 # Start production server
npm run lint                  # Run ESLint
npm run type-check            # Run TypeScript checks

# Testing
npm test                      # Run unit tests
npm run test:watch            # Watch mode
npm run test:coverage         # Generate coverage report
npm run test:e2e              # Run end-to-end tests

# Debugging
npx prisma db seed            # Run seed scripts
npm run clean                 # Clean build artifacts
npm run reset                 # Reset database and seed
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Run `npm run build` successfully
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Environment variables set in Vercel
- [ ] Clerk production keys configured
- [ ] Vercel Blob token configured (if using blob storage)
- [ ] Test on staging environment
- [ ] Performance audit (Lighthouse score >90)
- [ ] Accessibility audit (WCAG AA)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## Next Steps

After completing local development:

1. **Code Review**: Submit PR for team review
2. **Staging Deployment**: Deploy to staging environment
3. **QA Testing**: Run full testing suite
4. **Production Deployment**: Deploy via Vercel
5. **Monitoring**: Watch error logs and performance metrics

---

## Resources

**Internal Documentation**:
- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api-contracts.md)

**External Resources**:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

**Support**:
- Team Slack: #news-feature-dev
- Issues: GitHub Issues
- Questions: Ask in daily standup

---

**Last Updated**: March 29, 2026  
**Maintained By**: Development Team
