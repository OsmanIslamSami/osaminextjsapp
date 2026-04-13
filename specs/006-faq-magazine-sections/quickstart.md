# Implementation Quickstart: FAQ and Magazine Sections

**Feature**: 006-faq-magazine-sections  
**Phase**: 1 (Design & Contracts)  
**Date**: April 13, 2026

## Overview

This guide provides practical implementation patterns and step-by-step instructions for developers building the FAQ and Magazine features.

## Prerequisites

- Next.js 16 App Router
- Prisma ORM with PostgreSQL (Neon)
- Clerk authentication configured
- Vercel Blob storage configured (`BLOB_READ_WRITE_TOKEN` env var)
- Tailwind CSS
- TypeScript

## Implementation Checklist

### Phase 1: Database Setup
- [ ] Add FAQ and Magazine models to `prisma/schema.prisma`
- [ ] Add relation fields to User model
- [ ] Run `npx prisma migrate dev --name add_faq_magazines`
- [ ] Verify migration success with `npx prisma db pull`
- [ ] Generate Prisma client with `npx prisma generate`

### Phase 2: API Routes
- [ ] Implement `/app/api/faq/route.ts` (GET, POST)
- [ ] Implement `/app/api/faq/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Implement `/app/api/magazines/route.ts` (GET, POST with file uploads)
- [ ] Implement `/app/api/magazines/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Test all endpoints with Postman/Thunder Client

### Phase 3: TypeScript Types
- [ ] Add FAQ and Magazine interfaces to `lib/types.ts`
- [ ] Add form data interfaces for client-side validation

### Phase 4: UI Components
- [ ] Create `lib/components/faq/FAQAccordionItem.tsx`
- [ ] Create `lib/components/faq/FAQForm.tsx`
- [ ] Create `lib/components/faq/FAQList.tsx`
- [ ] Create `lib/components/magazines/MagazineCard.tsx`
- [ ] Create `lib/components/magazines/MagazineForm.tsx`
- [ ] Create `lib/components/magazines/MagazineList.tsx`

### Phase 5: Admin Pages
- [ ] Create `/app/admin/faq/page.tsx` (list with pagination)
- [ ] Create `/app/admin/faq/add/page.tsx` (add form)
- [ ] Create `/app/admin/faq/[id]/edit/page.tsx` (edit form)
- [ ] Create `/app/admin/magazines/page.tsx` (list with pagination)
- [ ] Create `/app/admin/magazines/add/page.tsx` (add form with file uploads)
- [ ] Create `/app/admin/magazines/[id]/edit/page.tsx` (edit form)

### Phase 6: Public Pages
- [ ] Add FAQ section to `/app/page.tsx` (home page)
- [ ] Add Magazine section to `/app/page.tsx` (home page)
- [ ] Create `/app/faq/page.tsx` (dedicated FAQ page with pagination)
- [ ] Create `/app/magazines/page.tsx` (dedicated Magazine page with pagination)

### Phase 7: Testing & Polish
- [ ] Test bilingual content (English and Arabic)
- [ ] Test accordion interactions (single-open behavior)
- [ ] Test file uploads (cover images and PDFs)
- [ ] Test pagination on all admin and public pages
- [ ] Test responsive layouts (mobile, tablet, desktop)
- [ ] Verify soft-delete behavior
- [ ] Test "View All" links from home page sections

---

## Key Implementation Patterns

### 1. Prisma Query with Soft Delete Filter

**Always filter by `is_deleted = false`** in queries:

```typescript
// ✅ Correct
const faqs = await prisma.fAQ.findMany({
  where: { is_deleted: false },
  orderBy: { created_at: 'desc' }
});

// ❌ Wrong - returns deleted items
const faqs = await prisma.fAQ.findMany();
```

### 2. Clerk Authentication in API Routes

```typescript
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get user from database
  const user = await prisma.user.findUnique({
    where: { clerk_user_id: userId }
  });

  // 3. Check admin role
  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Proceed with CRUD operation
  const data = await request.json();
  const faq = await prisma.fAQ.create({
    data: {
      ...data,
      created_by: user.id,
      updated_by: user.id
    }
  });

  return NextResponse.json({ data: faq }, { status: 201 });
}
```

### 3. File Upload with Vercel Blob

```typescript
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  const formData = await request.formData();
  const coverImage = formData.get('cover_image') as File;
  const pdfFile = formData.get('pdf_file') as File;

  // Validate file formats
  const coverMime = coverImage.type;
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedImageTypes.includes(coverMime)) {
    return NextResponse.json(
      { error: 'Invalid image format. Only JPEG, PNG, WebP, GIF allowed' },
      { status: 400 }
    );
  }

  if (pdfFile.type !== 'application/pdf') {
    return NextResponse.json(
      { error: 'Invalid file format. Only PDF allowed for downloads' },
      { status: 400 }
    );
  }

  // Validate file sizes
  if (coverImage.size > 10 * 1024 * 1024) {  // 10MB
    return NextResponse.json(
      { error: 'Cover image too large. Max 10MB' },
      { status: 400 }
    );
  }

  if (pdfFile.size > 50 * 1024 * 1024) {  // 50MB
    return NextResponse.json(
      { error: 'PDF file too large. Max 50MB' },
      { status: 400 }
    );
  }

  // Upload to Vercel Blob
  const coverBlob = await put(
    `magazines/cover-${Date.now()}.${coverMime.split('/')[1]}`,
    coverImage,
    { access: 'public' }
  );

  const pdfBlob = await put(
    `magazines/pdf-${Date.now()}.pdf`,
    pdfFile,
    { access: 'public' }
  );

  // Create Magazine record
  const magazine = await prisma.magazine.create({
    data: {
      // ... form fields ...
      image_url: coverBlob.url,
      storage_type: 'blob',
      download_link: pdfBlob.url,
      created_by: user.id,
      updated_by: user.id
    }
  });

  return NextResponse.json({ data: magazine }, { status: 201 });
}
```

### 4. FAQ Accordion Component (Single-Open)

```typescript
'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { language, direction } = useTranslation();

  const toggleItem = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div dir={direction} className="space-y-2">
      {faqs.map(faq => {
        const question = faq[`question_${language}`];
        const answer = faq[`answer_${language}`];
        const isExpanded = expandedId === faq.id;

        return (
          <div key={faq.id} className="border border-gray-200 dark:border-zinc-700 rounded-lg">
            <button
              onClick={() => toggleItem(faq.id)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-zinc-100">
                {question}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isExpanded && (
              <div className="p-4 bg-gray-50 dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700">
                <p className="text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### 5. Magazine Card Component

```typescript
'use client';

import Image from 'next/image';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface MagazineCardProps {
  magazine: Magazine;
}

export default function MagazineCard({ magazine }: MagazineCardProps) {
  const { language, direction } = useTranslation();

  const title = magazine[`title_${language}`];
  const description = magazine[`description_${language}`];
  const publishedDate = new Date(magazine.published_date).toLocaleDateString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
      {/* Cover Image */}
      <div className="relative aspect-[3/4]">
        <Image
          src={magazine.image_url}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div dir={direction} className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-zinc-100">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-zinc-400 mb-4 line-clamp-3">
          {description}
        </p>

        {/* Published Date */}
        <div className={`flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-500 mb-4 ${
          language === 'ar' ? 'flex-row-reverse' : ''
        }`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{publishedDate}</span>
        </div>

        {/* Download Button */}
        <a
          href={magazine.download_link}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-center rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
        >
          {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
        </a>
      </div>
    </div>
  );
}
```

### 6. Pagination Component

```typescript
'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  language: 'en' | 'ar';
}

export default function Pagination({ currentPage, totalPages, onPageChange, language }: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Show first page, current page ± 1, last page
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      if (currentPage > 2) pages.push(currentPage - 1);
      if (currentPage !== 1 && currentPage !== totalPages) pages.push(currentPage);
      if (currentPage < totalPages - 1) pages.push(currentPage + 1);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-center md:gap-2">
        {/* First and Previous */}
        <div className="flex items-center justify-center gap-2 md:contents">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
          >
            {language === 'ar' ? 'الأول' : 'First'}
          </button>
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
          >
            {language === 'ar' ? 'السابق' : 'Previous'}
          </button>
        </div>

        {/* Page Numbers */}
        <div className="flex flex-wrap items-center justify-center gap-1 md:contents">
          {pageNumbers.map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2">...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  page === currentPage
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next and Last */}
        <div className="flex items-center justify-center gap-2 md:contents">
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
          >
            {language === 'ar' ? 'التالي' : 'Next'}
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
          >
            {language === 'ar' ? 'الأخير' : 'Last'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 7. Home Page Integration

```typescript
// app/page.tsx
import FAQSection from '@/lib/components/home/FAQSection';
import MagazineSection from '@/lib/components/home/MagazineSection';
import prisma from '@/lib/db';

export default async function HomePage() {
  // Fetch FAQ data (max 10, favorites first)
  const faqs = await prisma.fAQ.findMany({
    where: { is_deleted: false },
    orderBy: [
      { is_favorite: 'desc' },
      { created_at: 'desc' }
    ],
    take: 10
  });

  // Fetch Magazine data (max 8, recent first)
  const magazines = await prisma.magazine.findMany({
    where: { is_deleted: false },
    orderBy: { published_date: 'desc' },
    take: 8
  });

  const hasMoreFAQs = await prisma.fAQ.count({ where: { is_deleted: false } }) > 10;
  const hasMoreMagazines = await prisma.magazine.count({ where: { is_deleted: false } }) > 8;

  return (
    <main>
      {/* Other home page sections */}
      
      {/* FAQ Section */}
      <FAQSection faqs={faqs} hasMore={hasMoreFAQs} />
      
      {/* Magazine Section */}
      <MagazineSection magazines={magazines} hasMore={hasMoreMagazines} />
    </main>
  );
}
```

---

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Forgetting to Filter Soft-Deleted Items
```typescript
// Wrong
const faqs = await prisma.fAQ.findMany();
```
**Solution**: Always add `where: { is_deleted: false }`

### ❌ Pitfall 2: Not Handling File Upload Errors
```typescript
// Wrong
const blob = await put('file.jpg', file);  // Can throw error
```
**Solution**: Wrap in try-catch and return 500 error

### ❌ Pitfall 3: Hardcoding Language in Components
```typescript
// Wrong
<h2>Frequently Asked Questions</h2>
```
**Solution**: Use `useTranslation` hook and bilingual field access

### ❌ Pitfall 4: Not Validating File Formats
```typescript
// Wrong
const blob = await put('file', file);  // Accepts any file type
```
**Solution**: Check `file.type` against allowed MIME types before upload

### ❌ Pitfall 5: Missing Audit Trail Fields
```typescript
// Wrong
await prisma.fAQ.create({ data: formData });
```
**Solution**: Always include `created_by` and `updated_by` from authenticated user

---

## Testing Strategy

### Unit Tests (Vitest)
- Validate file format checking functions
- Test pagination logic (calculateSkip, calculateTotalPages)
- Test bilingual field access patterns

### Integration Tests
- Test API routes with authenticated requests
- Verify soft-delete behavior (items not returned in queries)
- Test file upload flow end-to-end

### Manual Testing
- [ ] Create FAQ via admin form
- [ ] Edit FAQ and verify changes persist
- [ ] Delete FAQ and verify it disappears from home page
- [ ] Toggle favorite status and verify home page ordering
- [ ] Create Magazine with cover image and PDF
- [ ] Download PDF from Magazine card
- [ ] Test on mobile, tablet, and desktop viewports
- [ ] Switch language and verify bilingual content displays correctly

---

## Deployment Notes

1. **Database Migration**: Run `npx prisma migrate deploy` on production
2. **Environment Variables**: Ensure `BLOB_READ_WRITE_TOKEN` is set in Vercel
3. **Blob Storage**: Enable Vercel Blob storage in project settings
4. **Build Verification**: Run `npm run build` locally before deployment
5. **Seed Data**: Optionally seed initial FAQ entries for better UX

---

## Next Steps

Now that Phase 1 (Design & Contracts) is complete:
1. ✅ Research completed (technical decisions)
2. ✅ Data model defined (Prisma schema)
3. ✅ API contracts documented (endpoints and formats)
4. ✅ Quickstart guide created (implementation patterns)

**Proceed to Phase 2**: Run `/speckit.tasks` to generate actionable implementation tasks
