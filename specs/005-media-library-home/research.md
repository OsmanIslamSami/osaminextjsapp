# Research: Media Library Home Sections

**Feature**: 005-media-library-home  
**Created**: March 30, 2026  
**Purpose**: Technology decisions and best practices for Photos, Videos, and Partners sections

## Research Tasks

### 1. YouTube Video Embedding in Next.js

**Decision**: Use YouTube embed URLs with iframe approach, following React best practices for URL validation and responsive embeds.

**Rationale**:
- YouTube provides stable iframe API with standard playback controls
- No video storage required on our infrastructure (spec requirement)
- Responsive iframe patterns well-documented for Next.js
- Supports fullscreen, autoplay control, keyboard navigation

**Implementation Pattern**:
```typescript
// URL validation
const validateYouTubeUrl = (url: string): boolean => {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/
  ];
  return patterns.some(pattern => pattern.test(url));
};

// Extract video ID and create embed URL
const getYouTubeEmbedUrl = (url: string): string => {
  const videoId = extractVideoId(url);
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
};
```

**Best Practices**:
- Store original URL in database, convert to embed format in frontend
- Use `loading="lazy"` for iframe performance
- Include `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`
- Responsive aspect ratio using Tailwind: `aspect-video` class

**Alternatives Considered**:
- Self-hosted videos: Rejected due to storage costs and bandwidth (spec requirement is YouTube URLs)
- Third-party video players: Rejected - YouTube's native player is sufficient

---

### 2. Media File Upload with Vercel Blob

**Decision**: Use existing Vercel Blob infrastructure with @vercel/blob library, following the pattern established in News and SliderContent models.

**Rationale**:
- Already integrated in project (@vercel/blob 2.3.1 in package.json)
- News and SliderContent successfully use Vercel Blob (storage_type field pattern)
- Supports direct file uploads from browser with presigned URLs
- Handles CDN distribution automatically
- 5MB file size limit aligns with project standards

**Implementation Pattern** (from existing codebase):
```typescript
import { put } from '@vercel/blob';

// Upload handler in API route
const blob = await put(`photos/${file.name}`, file, {
  access: 'public',
  addRandomSuffix: true,
});

// Store in database
await prisma.photos.create({
  data: {
    image_url: blob.url,
    storage_type: 'blob',
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
  },
});
```

**Best Practices**:
- Validate file types: JPEG, PNG, WebP, GIF only
- Client-side file size check before upload (5MB limit)
- Server-side validation for security
- Store metadata (file_name, file_size, mime_type) for audit trail
- Use storage_type field for future flexibility (can support local storage later)

**Alternatives Considered**:
- Local file storage: Supported by schema (file_data BLOB field) but Vercel Blob preferred for production
- Other CDN services: Not needed - Vercel Blob integrated

---

### 3. Popup/Modal Navigation Patterns

**Decision**: Implement custom modal component with keyboard navigation, following accessibility best practices and React portal patterns.

**Rationale**:
- Need previous/next navigation within popup (spec FR-006, FR-015)
- Circular navigation (wrap from last to first) specified in edge cases
- Keyboard support (arrow keys, ESC) required (spec FR-062)
- RTL direction must reverse arrow behavior (spec clarification)

**Implementation Pattern**:
```typescript
interface PopupProps {
  items: PhotoItem[] | VideoItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  isRTL: boolean;
}

const MediaPopup: React.FC<PopupProps> = ({ items, currentIndex, onNavigate, isRTL }) => {
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': onClose(); break;
        case 'ArrowLeft': 
          onNavigate(isRTL ? 'next' : 'prev'); 
          break;
        case 'ArrowRight': 
          onNavigate(isRTL ? 'prev' : 'next'); 
          break;
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isRTL]);

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % items.length; // Circular
    onNavigate('next');
  };

  const goToPrev = () => {
    const prevIndex = (currentIndex - 1 + items.length) % items.length; // Circular
    onNavigate('prev');
  };
};
```

**Best Practices**:
- Use React Portal for modal rendering (body-level)
- Focus trap within modal for accessibility
- `aria-modal="true"` and proper ARIA labels
- Click-outside-to-close with backdrop
- Prevent body scroll when modal open
- Smooth transitions with `framer-motion` or CSS transitions

**Alternatives Considered**:
- Third-party modal libraries (react-modal, headlessui): Could work but custom gives full control over navigation logic
- Full-page navigation (URL-based): Rejected - popup specified in requirements

---

### 4. RTL Slider Implementation

**Decision**: Use CSS flexbox with `dir="rtl"` attribute and conditional Tailwind classes, following existing project patterns for Arabic support.

**Rationale**:
- Project already supports bilingual UI with language context
- CSS `dir` attribute automatically handles flex direction
- Slider arrows must reverse in RTL (spec edge case)
- Existing translation system can be leveraged

**Implementation Pattern**:
```typescript
// Component structure
import { useTranslation } from '@/lib/i18n/useTranslation';

const PhotosSection = () => {
  const { language, t } = useTranslation();
  const isRTL = language === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="slider-container">
      {/* Slider content */}
      <button 
        onClick={() => navigate('prev')}
        aria-label={isRTL ? t('slider.next') : t('slider.prev')}
        className={isRTL ? 'right-4' : 'left-4'}
      >
        {isRTL ? <RightArrow /> : <LeftArrow />}
      </button>
      <button 
        onClick={() => navigate('next')}
        aria-label={isRTL ? t('slider.prev') : t('slider.next')}
        className={isRTL ? 'left-4' : 'right-4'}
      >
        {isRTL ? <LeftArrow /> : <RightArrow />}
      </button>
    </div>
  );
};
```

**Best Practices**:
- Store bilingual content in database (title_en, title_ar pattern from News model)
- Use CSS logical properties (`margin-inline-start` instead of `margin-left`)
- Test slider navigation in both LTR and RTL modes
- Ensure slider dots/indicators reverse position

**Alternatives Considered**:
- Third-party RTL slider libraries: Not needed - CSS dir attribute handles layout automatically
- JavaScript-based RTL detection: CSS approach cleaner and more performant

---

### 5. Featured Item Selection Logic

**Decision**: Hybrid approach - featured items first (sorted by published date), then most recent non-featured items to fill remaining slots.

**Rationale**:
- Spec clarification: "Most recent by published date with optional featured flag override"
- Admins can pin important content via featured checkbox
- Automatic freshness when no featured items or fewer than required slots
- Clear, predictable behavior for content managers

**Implementation Pattern**:
```sql
-- Query for photos (5 items)
SELECT * FROM photos
WHERE is_deleted = false 
  AND is_visible = true
  AND published_date <= NOW()
ORDER BY 
  is_featured DESC,           -- Featured first
  published_date DESC          -- Then most recent
LIMIT 5;

-- Prisma implementation
const photos = await prisma.photos.findMany({
  where: {
    is_deleted: false,
    is_visible: true,
    published_date: { lte: new Date() },
  },
  orderBy: [
    { is_featured: 'desc' },
    { published_date: 'desc' },
  ],
  take: 5,
});
```

**Best Practices**:
- Index on (is_deleted, is_visible, is_featured, published_date DESC)
- Handle edge case: more than 5 featured items = show 5 most recent featured
- Handle edge case: 0 featured items = show 5 most recent published
- Admin UI clearly indicates featured status
- Future published dates: items remain hidden until publish date (spec requirement)

**Alternatives Considered**:
- Display order field only: Rejected - requires manual reordering for every addition
- Most recent only: Rejected - no way to pin important content
- Manual slot assignment: Rejected - too complex for admins

---

### 6. Partners Display Configuration

**Decision**: HomeSection table with partners-specific fields for display mode (show all vs. limit) and maximum count.

**Rationale**:
- Spec clarification: "Show all visible partners by default, with admin option to specify maximum number"
- Configuration stored per section, not per partner
- Flexible - can show 3 partners or 30 partners based on content strategy
- Default: show all (most permissive)

**Database Schema**:
```prisma
model HomeSection {
  id                String  @id @default(cuid())
  section_type      String  @unique // 'photos', 'videos', 'partners'
  is_visible        Boolean @default(true)
  title_en          String?
  title_ar          String?
  display_order     Int     @default(0)
  // Partners-specific
  partners_display_mode    String? @default("all") // 'all' | 'limit'
  partners_max_count       Int?    // Only used when mode = 'limit'
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
}
```

**Implementation Pattern**:
```typescript
// API to fetch partners for home page
const sectionConfig = await prisma.homeSection.findUnique({
  where: { section_type: 'partners' },
});

const query = {
  where: { is_visible: true, is_deleted: false },
  orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
};

if (sectionConfig?.partners_display_mode === 'limit' && sectionConfig.partners_max_count) {
  query.take = sectionConfig.partners_max_count;
}

const partners = await prisma.partners.findMany(query);
```

**Best Practices**:
- Admin UI provides toggle: "Show all partners" vs "Limit to X partners"
- Validate max_count is positive integer when mode = 'limit'
- Clear UI feedback showing how many partners will display
- Default configuration created on first access

**Alternatives Considered**:
- Fixed partner count: Rejected - too inflexible
- Per-partner "show on home" flag: Rejected - partners section uses featured flag for pinning, count is section-level config

---

## Summary of Technology Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Database | Prisma + Neon PostgreSQL | Existing infrastructure, type-safe ORM |
| File Storage | Vercel Blob | Existing infrastructure, proven pattern |
| Video Hosting | YouTube embed API | per spec requirement, no storage needed |
| UI Framework | React 19 + Tailwind CSS | Existing project stack |
| Modals | Custom React Portal components | Full control over navigation logic |
| RTL Support | CSS `dir` attribute + conditional Tailwind | Existing pattern, clean separation |
| Featured Logic | Database ORDER BY with multiple columns | Simple, efficient, predictable |
| Testing | Vitest + Testing Library | Existing test infrastructure |

All technology choices align with existing project patterns and constitution principles. No new dependencies required beyond what's already in package.json.
