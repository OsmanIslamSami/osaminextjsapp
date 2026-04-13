# Research: FAQ and Magazine Sections

**Feature**: 006-faq-magazine-sections  
**Phase**: 0 (Outline & Research)  
**Date**: April 13, 2026

## Purpose

Resolve all technical unknowns and document established patterns before implementation design (Phase 1).

## Research Tasks

### 1. Database Schema Patterns for FAQ and Magazine

**Question**: What Prisma schema patterns should be used for FAQ and Magazine models to align with existing project conventions?

**Research Findings**:

Examined existing models in `prisma/schema.prisma`:
- News model: Bilingual fields (`title_en`, `title_ar`, `description_en`, `description_ar`), storage patterns, soft deletes, audit trails
- Photos/Videos models: Similar bilingual + storage patterns with User FK relations
- Partners model: Same patterns with `is_visible`, `display_order`

**Decision**:

**FAQ Model**:
```prisma
model FAQ {
  id            String   @id @default(cuid())
  question_en   String   @db.VarChar(500)
  question_ar   String   @db.VarChar(500)
  answer_en     String   @db.Text
  answer_ar     String   @db.Text
  is_favorite   Boolean  @default(false)
  display_order Int      @default(0)        // For manual ordering if needed
  is_deleted    Boolean  @default(false)
  created_by    String                      // User.id FK
  updated_by    String                      // User.id FK
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  creator       User     @relation("FAQCreatedBy", fields: [created_by], references: [id])
  updater       User     @relation("FAQUpdatedBy", fields: [updated_by], references: [id])

  @@index([is_deleted, is_favorite, created_at])
  @@map("faq")
}
```

**Magazine Model**:
```prisma
model Magazine {
  id              String   @id @default(cuid())
  title_en        String   @db.VarChar(500)
  title_ar        String   @db.VarChar(500)
  description_en  String   @db.Text
  description_ar  String   @db.Text
  image_url       String                         // Cover image URL or identifier
  storage_type    String   @default("blob")      // 'blob' | 'local'
  file_data       Bytes?                         // Image data for local storage
  file_name       String?                        // Original filename
  file_size       Int?                           // File size in bytes
  mime_type       String?                        // Image MIME type
  download_link   String                         // PDF file URL (blob storage)
  published_date  DateTime @db.Timestamp(6)
  is_deleted      Boolean  @default(false)
  created_by      String                         // User.id FK
  updated_by      String                         // User.id FK
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  creator         User     @relation("MagazineCreatedBy", fields: [created_by], references: [id])
  updater         User     @relation("MagazineUpdatedBy", fields: [updated_by], references: [id])

  @@index([is_deleted, published_date(sort: Desc)])
  @@map("magazines")
}
```

**Rationale**:
- Follows existing bilingual content pattern (`_en` and `_ar` suffixes)
- Uses soft-delete pattern (`is_deleted` boolean)
- Includes audit trail fields (`created_by`, `updated_by`, timestamps)
- FAQ uses `is_favorite` for prioritization (per clarification #4)
- Magazine uses `published_date` for ordering (per clarification #5)
- Both use User FK relations (matching photos/videos/partners models)
- Storage type pattern matches existing News/SliderContent models
- Indexes optimize common queries (soft-delete + ordering)

---

### 2. File Upload Implementation (Images & PDFs)

**Question**: How should Magazine cover images and PDF downloads be uploaded and stored?

**Research Findings**:

Examined existing upload implementations:
- `/app/api/news/route.ts`: Uses `@vercel/blob` with `put()` method
- `/app/api/style-library/upload/route.ts`: Implements FormData handling with Blob storage
- Pattern: Check for `BLOB_READ_WRITE_TOKEN`, fallback to local storage if unavailable
- File size limit: 50MB default, 4.5MB Vercel request body limit (Hobby plan)

**Decision**:

**Cover Image Upload** (Magazine):
- **Format validation**: Accept only JPEG, PNG, WebP, GIF (per clarification #1)
- **Storage**: Vercel Blob (primary), local DB (fallback when Blob unavailable)
- **Max size**: 10MB (per success criteria SC-007)
- **Implementation**: Use `@vercel/blob` `put()` method, store URL in `image_url` field
- **Fallback**: Store base64-encoded Bytes in `file_data` if Blob fails, set `storage_type = 'local'`

**PDF Download Upload** (Magazine):
- **Format validation**: Accept only PDF files (per clarification #1)
- **Storage**: Vercel Blob only (no local fallback for downloads)
- **Max size**: 50MB (standard PDF limit)
- **Implementation**: Upload PDF to Blob, store URL in `download_link` field
- **Naming**: Use descriptive names like `magazine-{title-slug}-{timestamp}.pdf`

**Alternative Considered**: Using style library for Magazine images
**Rejected Because**: Magazine cover images are tightly coupled to Magazine entries; style library is for reusable assets. Direct upload is simpler and maintains data integrity.

---

### 3. Accordion UI Implementation (FAQ)

**Question**: What React pattern should be used for FAQ accordion with single-open behavior?

**Research Findings**:

- Requirement: Single-open accordion (per clarification #2)
- Interaction: <100ms response time (per SC-005)
- Pattern: Controlled component with React state tracking expanded item ID

**Decision**:

**Component Structure**:
```typescript
// FAQAccordion.tsx (container component)
const FAQAccordion = ({ faqs, language }: { faqs: FAQ[], language: 'en' | 'ar' }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return faqs.map(faq => (
    <FAQAccordionItem 
      key={faq.id}
      faq={faq}
      isExpanded={expandedId === faq.id}
      onToggle={() => toggleItem(faq.id)}
      language={language}
    />
  ));
};

// FAQAccordionItem.tsx (single item)
const FAQAccordionItem = ({ faq, isExpanded, onToggle, language }) => {
  const question = language === 'ar' ? faq.question_ar : faq.question_en;
  const answer = language === 'ar' ? faq.answer_ar : faq.answer_en;

  return (
    <div className="border-b">
      <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
        <span>{question}</span>
        <ChevronIcon className={isExpanded ? 'rotate-180' : ''} />
      </button>
      {isExpanded && (
        <div className="p-4 bg-gray-50 dark:bg-zinc-800">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};
```

**Rationale**:
- Single state variable (`expandedId`) ensures only one item open at a time
- onClick handler is fast (<100ms) - meets performance requirement
- Conditional rendering prevents rendering all answers upfront (performance)
- Language prop allows dynamic bilingual content switching

**Alternative Considered**: CSS-only accordion with `:checked` pseudo-class
**Rejected Because**: Requires complex markup, harder to control programmatically, less accessible

---

### 4. Pagination Implementation

**Question**: What pagination pattern should be used for FAQ and Magazine admin lists?

**Research Findings**:

Examined existing pagination in:
- `/app/api/news/route.ts`: Uses `skip` and `take` for offset-based pagination
- `/app/api/clients/route.ts`: Uses cursor-based pagination with `hasMore` indicator
- Standard pagination UI: First, Previous, Page Numbers, Next, Last buttons (per project standards)

**Decision**:

**Offset-based pagination** for FAQ and Magazine:
- **Query params**: `page` (1-indexed), `limit` (10, 20, 50, 100, 500 per FR-005/FR-018)
- **Prisma query**: 
  ```typescript
  const skip = (page - 1) * limit;
  const items = await prisma.faq.findMany({
    where: { is_deleted: false },
    skip,
    take: limit,
    orderBy: [
      { is_favorite: 'desc' },  // Favorites first (FAQ only)
      { created_at: 'desc' }
    ]
  });
  const totalCount = await prisma.faq.count({ where: { is_deleted: false } });
  const totalPages = Math.ceil(totalCount / limit);
  ```
- **Response**: `{ data: items[], totalCount, totalPages, currentPage, limit }`
- **UI**: Pill-shaped buttons with First/Previous/Pages/Next/Last + page size selector

**Rationale**:
- Offset pagination is simpler for small datasets (~20-100 items)
- Matches existing News pagination pattern
- Easier to implement page numbers UI (show pages 1,2,3...N)
- FAQ favorites prioritization requires custom ordering (not pure cursor-based)

**Alternative Considered**: Cursor-based pagination
**Rejected Because**: Harder to implement "jump to page N" and show page numbers. Offset is sufficient for FAQ/Magazine volumes.

---

### 5. Bilingual Content Display & RTL Support

**Question**: How should bilingual content be displayed with proper text direction (LTR/RTL)?

**Research Findings**:

Examined existing i18n implementation:
- `lib/i18n/LanguageContext.tsx`: Provides global language state ('en' | 'ar')
- `lib/i18n/useTranslation.ts`: Exports `{ t, language, direction }` hook
- Direction is auto-calculated: `'rtl'` for Arabic, `'ltr'` for English
- Use `dir={direction}` attribute on containers for RTL layout

**Decision**:

**Component Pattern**:
```typescript
const FAQSection = () => {
  const { language, direction } = useTranslation();

  const question = faq[`question_${language}`];  // faq.question_en or faq.question_ar
  const answer = faq[`answer_${language}`];

  return (
    <div dir={direction}>
      <h2>{language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h2>
      {/* Accordion items */}
    </div>
  );
};
```

**Key Patterns**:
- Use bracket notation for bilingual fields: `item[`field_${language}`]`
- Apply `dir={direction}` to section containers
- Flex layouts with `${language === 'ar' ? 'flex-row-reverse' : ''}` for icon positioning
- Text alignment: `text-${language === 'ar' ? 'right' : 'left'}`

**Rationale**:
- Follows existing project i18n patterns
- Automatic direction handling via `useTranslation` hook
- Consistent with existing bilingual pages (News, Photos, etc.)

---

### 6. PDF Download Implementation

**Question**: How should Magazine PDF downloads be triggered from the UI?

**Research Findings**:

Standard patterns for file downloads:
- Use `<a>` tag with `download` attribute pointing to Blob URL
- For Vercel Blob URLs, they're publicly accessible via HTTPS
- Browser handles download automatically when user clicks link

**Decision**:

**Download Button**:
```typescript
<a 
  href={magazine.download_link}
  download={`magazine-${magazine.title_en.replace(/\s+/g, '-').toLowerCase()}.pdf`}
  className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
  target="_blank"
  rel="noopener noreferrer"
>
  {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
</a>
```

**Key Pattern**:
- `href`: Points to Vercel Blob URL stored in `download_link`
- `download`: Suggests filename to browser (sanitized title + .pdf)
- `target="_blank"`: Opens in new tab (fallback if download doesn't work)
- `rel="noopener noreferrer"`: Security best practice for external links

**Rationale**:
- Simple and standard pattern (no custom download logic needed)
- Vercel Blob URLs are publicly accessible (no auth required for downloads)
- Browser handles progress indicator and file saving

**Alternative Considered**: Server-side proxy endpoint that streams PDF
**Rejected Because**: Adds complexity, increases server load. Direct Blob URL download is sufficient and faster.

---

## Research Summary

All technical decisions resolved:

1. ✅ **Database Schema**: Prisma models defined following existing patterns (bilingual, soft-delete, audit trail, User FK relations)
2. ✅ **File Uploads**: Vercel Blob for both images and PDFs, with local DB fallback for images only
3. ✅ **Accordion UI**: React controlled component with single state variable for expanded item ID
4. ✅ **Pagination**: Offset-based with page/limit query params, matches existing News pattern
5. ✅ **Bilingual/RTL**: Use existing `useTranslation` hook, bracket notation for bilingual fields, `dir={direction}` attribute
6. ✅ **PDF Downloads**: Direct `<a href={blobUrl} download>` pattern, no custom server logic needed

## Next Steps

Proceed to **Phase 1** (Design & Contracts):
1. Create `data-model.md` with detailed Prisma schema and entity relationships
2. Create `contracts/api-endpoints.md` documenting all API routes
3. Create `quickstart.md` with implementation guide and key patterns
4. Update Copilot agent context with new technology/patterns
