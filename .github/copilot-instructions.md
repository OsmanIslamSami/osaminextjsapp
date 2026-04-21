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

### W3C HTML and Accessibility Standards

**All HTML must follow W3C standards and WCAG accessibility guidelines:**

**Heading Hierarchy:**
- **One `<h1>` per page**: Use only ONE `<h1>` tag as the main page heading (typically in hero/slider)
- **Logical hierarchy**: Follow proper nesting order (h1 → h2 → h3), never skip levels
- **Section titles**: Use `<h2>` for major section headings (News, Photos, Videos, Partners, etc.)
- **Subsections**: Use `<h3>` for items within sections (individual news titles, card titles, etc.)
- **Example structure**:
  ```typescript
  <h1>Main Page Title</h1>        // Hero/Slider (only one per page)
    <h2>Section Title</h2>         // News, Photos, Videos section
      <h3>Card Title</h3>          // Individual items
      <h3>Card Title</h3>
    <h2>Another Section</h2>
      <h3>Item Title</h3>
  ```

**Semantic HTML:**
- Use semantic elements: `<main>`, `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`
- Use `<button>` for actions, `<a>` for navigation
- Add `aria-label` for icon-only buttons
- Include `alt` text for all images (descriptive, not decorative)
- Use `<label>` elements for all form inputs

**Accessibility (WCAG 2.1 Level AA):**
- **Keyboard navigation**: All interactive elements must be keyboard accessible (Tab, Enter, Space)
- **Focus indicators**: Visible focus states for all focusable elements
- **Color contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **ARIA attributes**: Use `aria-label`, `aria-describedby`, `aria-hidden` appropriately
- **Form validation**: Clear error messages with `aria-invalid` and `aria-errormessage`
- **Skip links**: Add skip-to-content links for screen readers

**Examples:**
```typescript
// ✅ Correct heading hierarchy
<section>
  <h2>Latest News</h2>
  <article>
    <h3>News Item Title</h3>
    <p>Description...</p>
  </article>
</section>

// ❌ Wrong - multiple h1 tags
<h1>Hero Title</h1>
<section>
  <h1>Section Title</h1>  // Should be h2
</section>

// ✅ Semantic button with accessibility
<button 
  aria-label="Close dialog"
  className="rounded-full p-2"
>
  <XIcon className="w-5 h-5" />
</button>

// ✅ Proper image alt text
<img src="photo.jpg" alt="Team celebrating project launch in office" />
```

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

**Desktop (Windows) vs Mobile Layout Patterns:**

**Search/Filter Sections:**
- **Mobile**: Stack all elements vertically for easy thumb access
- **Desktop**: Single horizontal row with proper spacing and alignment
- **Pattern**: Use `flex-col` → `lg:flex-row` for major layout shifts
- **Alignment**: Use `lg:items-start` for top alignment, `lg:items-center` when appropriate

**Form Layouts:**
- **Mobile**: Full-width inputs and buttons (`w-full`)
- **Desktop**: Constrained width inputs (`lg:max-w-md`) with auto-width buttons (`sm:w-auto`)
- **Spacing**: `gap-2` on mobile, increase to `gap-4` on desktop (`lg:gap-4`)

**Card Grids:**
- **Mobile**: 1 column (`grid-cols-1`)
- **Tablet**: 2 columns (`sm:grid-cols-2`)
- **Desktop**: 3-4 columns (`lg:grid-cols-3` or `lg:grid-cols-4`)
- **Gap**: Consistent `gap-6` or `gap-8` across breakpoints

**Navigation and Pagination:**
- **Mobile**: Centered, stacked elements with proper touch targets (min 44×44px)
- **Desktop**: Horizontal row with `md:contents` to flatten wrapper divs
- **Centering**: Use `md:items-center md:justify-center` for desktop alignment

### Responsive Table Design Standards

**All tables MUST be responsive with both desktop and mobile views:**

**CRITICAL REQUIREMENTS:**
- **NEVER use horizontal scrolling** for tables on mobile
- **Always provide two layouts**: Desktop table view + Mobile card view
- **Hide desktop table on mobile**: Use `hidden md:block` on table wrapper
- **Show mobile cards on mobile**: Use `md:hidden` on card wrapper
- **Maintain functionality**: Both views must have all actions (edit, delete, etc.)

**Standard Responsive Table Pattern:**

```typescript
{/* Desktop Table View */}
<div className="hidden md:block bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
  <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
    <thead className="bg-gray-50 dark:bg-zinc-800">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
          Column 1
        </th>
        {/* More columns */}
      </tr>
    </thead>
    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
      {items.map((item) => (
        <tr key={item.id}>
          <td className="px-6 py-4">{item.name}</td>
          {/* More cells */}
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Mobile Card View */}
<div className="md:hidden space-y-4">
  {items.map((item) => (
    <div
      key={item.id}
      className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4"
    >
      {/* Card header with icon/image */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded">
          {/* Icon or image */}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
            {item.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            {item.subtitle}
          </p>
        </div>
      </div>

      {/* Card content - display fields vertically */}
      <div className="space-y-2 mb-3">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
            Field Label
          </label>
          <p className="text-sm text-gray-900 dark:text-zinc-100 mt-1">
            {item.fieldValue}
          </p>
        </div>
        {/* More fields */}
      </div>

      {/* Action buttons - icon-only on mobile */}
      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-zinc-800">
        <button 
          className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full inline-flex items-center justify-center"
          aria-label={language === 'ar' ? 'تعديل' : 'Edit'}
          title={language === 'ar' ? 'تعديل' : 'Edit'}
        >
          <PencilIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </button>
        <button 
          className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full inline-flex items-center justify-center"
          aria-label={language === 'ar' ? 'حذف' : 'Delete'}
          title={language === 'ar' ? 'حذف' : 'Delete'}
        >
          <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  ))}
</div>
```

**Mobile Card Design Guidelines:**
- **Header section**: Icon/image + title + subtitle (horizontally aligned)
- **Content section**: Display each table column as labeled field (vertically stacked)
- **Action buttons**: Icon-only with bilingual `aria-label` and `title` attributes
- **Button sizing**: `flex-1` to share space equally, `px-4 py-2` for proper touch targets
- **Spacing**: Use `p-4` for card padding, `gap-3` between sections, `gap-2` for buttons
- **Borders**: Separate action buttons from content with `border-t`
- **Typography**: Use smaller text (`text-xs`, `text-sm`) to fit mobile screens
- **Accessibility**: Always include bilingual `aria-label` and `title` for icon-only buttons

**When to Use Each Approach:**
- **Desktop table**: Data with 4+ columns, comparison needed, bulk actions
- **Mobile cards**: Individual item focus, vertical reading flow, touch-friendly actions
- **Both required**: Always implement both for proper responsive behavior

**Common Mistakes to Avoid:**
- ❌ Using `overflow-x-auto` for horizontal scrolling on mobile
- ❌ Only providing desktop table view (not mobile-friendly)
- ❌ Making mobile cards too dense (hard to read/tap)
- ❌ Forgetting action buttons on mobile cards
- ❌ Not testing on actual mobile devices (use browser dev tools)

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

### Loading State Standards

**All loading states MUST use the LoadingSpinner component:**

```typescript
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';

// Full page loading
if (loading) return <LoadingSpinner className="min-h-screen" size="lg" />;

// Section loading
if (loading) return <LoadingSpinner className="py-12" size="md" />;

// Inline loading
{loading ? <LoadingSpinner size="sm" /> : <Content />}

// With custom message (avoid - use only if critical)
<LoadingSpinner message="Loading data..." size="md" />
```

**Requirements:**
- **Never use**: Text like "Loading...", "Loading slides...", custom spinner divs
- **Always import**: `import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';`
- **Size options**: `'sm'` (inline), `'md'` (section), `'lg'` (page/full screen)
- **Responsive**: Component handles dark mode automatically
- **Accessible**: Includes proper ARIA labels and semantic markup

**Standard patterns:**
```typescript
// Page-level loading
if (loading) {
  return <LoadingSpinner className="min-h-screen" size="lg" />;
}

// Component-level loading
{loading ? (
  <LoadingSpinner className="flex justify-center items-center py-12" size="lg" />
) : (
  <Content />
)}

// Grid/table loading
{loading ? (
  <LoadingSpinner className="py-8" size="md" />
) : items.length === 0 ? (
  <EmptyState />
) : (
  <ItemsGrid />
)}
```

### User Notification Standards

**All user notifications MUST use the Toast system:**

```typescript
import { useToast } from '@/lib/components/ToastContainer';

const { showSuccess, showError, showInfo } = useToast();

// Success notification
showSuccess('Operation completed successfully');
showSuccess(language === 'ar' ? 'تم بنجاح' : 'Success');

// Error notification
showError('Failed to save changes');
showError(language === 'ar' ? 'فشل الحفظ' : 'Failed to save');

// Info notification
showInfo('Processing your request...');
```

**Requirements:**
- **NEVER use**: `alert()`, `confirm()`, or `window.alert()`
- **Always use**: Toast system from `@/lib/components/ToastContainer`
- **Bilingual messages**: Provide both Arabic and English messages based on `language` state
- **Use cases**:
  - `showSuccess()` - Successful operations (save, delete, update)
  - `showError()` - Failed operations, validation errors
  - `showInfo()` - Informational messages, processing states
- **For confirmations**: Use `ConfirmDialog` component instead of `confirm()`

**Standard patterns:**
```typescript
// ✅ Correct - Using toast
try {
  const response = await fetch('/api/data', { method: 'POST' });
  if (!response.ok) throw new Error('Failed');
  showSuccess(language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully');
} catch (error) {
  showError(language === 'ar' ? 'فشل الحفظ' : 'Failed to save');
}

// ❌ Wrong - Using browser alert
alert('Data saved successfully');

// ✅ Correct - Using ConfirmDialog for confirmations
const [showConfirm, setShowConfirm] = useState(false);
<ConfirmDialog
  isOpen={showConfirm}
  title="Confirm Delete"
  message="Are you sure you want to delete this item?"
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>

// ❌ Wrong - Using browser confirm
if (confirm('Are you sure?')) { handleDelete(); }
```

### Action Button Standards

**All action buttons MUST use icon-only format with Heroicons and proper accessibility:**

**CRITICAL REQUIREMENTS:**
- **ALWAYS use Heroicons** from `@heroicons/react/24/outline` - NEVER use custom SVG paths
- **NEVER use text labels** - Use icons only (icon-only buttons)
- **Mandatory attributes**: Every icon-only button MUST have `aria-label` and `title` for accessibility
- **Bilingual support**: Use conditional `language === 'ar' ? 'النص العربي' : 'English Text'` for aria-label and title
- **Icon switching**: Icons and colors must change based on state (visible/hidden, favorite/not-favorite, etc.)
- **Minimum touch target**: `min-w-[44px] min-h-[44px]` for mobile accessibility
- **Loading state**: Show `<LoadingSpinner size="sm" />` during async operations
- **Consistent sizing**: Use `w-5 h-5` for all action icons (or `w-4 h-4` for very compact layouts)
- **Consistent styling**: Use `inline-flex items-center justify-center` for proper icon centering

**STANDARDIZED ICONS (from @heroicons/react/24/outline):**

**1. Edit Actions:**
```typescript
import { PencilIcon } from '@heroicons/react/24/outline';

<PencilIcon className="w-5 h-5" />
// Color: Inherits from button text color (blue-600 typically)
```

**2. Delete Actions:**
```typescript
import { TrashIcon } from '@heroicons/react/24/outline';

<TrashIcon className="w-5 h-5" />
// Color: Inherits from button text color (red-600 typically)
```

**3. Visibility Toggle (with state-based color and icon switching):**
```typescript
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// Visible state (green):
<EyeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />

// Hidden state (grey/dimmed):
<EyeSlashIcon className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
```

**4. Favorite/Featured Toggle (with state-based color and fill):**
```typescript
import { StarIcon } from '@heroicons/react/24/outline';

// Active/Favorite state (yellow with fill):
<StarIcon className="w-5 h-5 text-yellow-500 fill-yellow-500" />

// Inactive state (grey outline only):
<StarIcon className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
```

**5. Restore Actions:**
```typescript
import { ArrowPathIcon } from '@heroicons/react/24/outline';

<ArrowPathIcon className="w-5 h-5" />
// Color: Inherits from button text color (green-600 typically)
```

**COMPLETE IMPLEMENTATION PATTERNS:**

```typescript
// ✅ CORRECT - Icon-only Edit button
import { PencilIcon } from '@heroicons/react/24/outline';

<button
  onClick={() => handleEdit(item)}
  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400"
  aria-label={language === 'ar' ? 'تعديل' : 'Edit'}
  title={language === 'ar' ? 'تعديل' : 'Edit'}
>
  <PencilIcon className="w-5 h-5" />
</button>

// ✅ CORRECT - Icon-only Delete button with loading state
import { TrashIcon } from '@heroicons/react/24/outline';

<button
  onClick={() => handleDelete(item.id)}
  disabled={deletingId === item.id}
  className="px-4 py-2 border-2 border-red-300 dark:border-red-800 rounded-full text-red-600 dark:text-red-400 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center"
  aria-label={language === 'ar' ? 'حذف' : 'Delete'}
  title={language === 'ar' ? 'حذف' : 'Delete'}
>
  {deletingId === item.id ? (
    <LoadingSpinner size="sm" />
  ) : (
    <TrashIcon className="w-5 h-5" />
  )}
</button>

// ✅ CORRECT - Visibility toggle (switches icon AND color based on state)
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

<button
  onClick={() => handleToggleVisible(item.id, item.is_visible)}
  disabled={togglingId === item.id}
  className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 transition-all inline-flex items-center justify-center"
  aria-label={item.is_visible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
  title={item.is_visible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
>
  {togglingId === item.id ? (
    <LoadingSpinner size="sm" />
  ) : item.is_visible ? (
    <EyeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
  ) : (
    <EyeSlashIcon className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
  )}
</button>

// ✅ CORRECT - Favorite toggle (switches fill and color based on state)
import { StarIcon } from '@heroicons/react/24/outline';

<button
  onClick={() => handleToggleFavorite(item.id, item.is_favorite)}
  disabled={togglingId === item.id}
  className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 transition-all inline-flex items-center justify-center"
  aria-label={item.is_favorite ? (language === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites') : (language === 'ar' ? 'إضافة إلى المفضلة' : 'Add to favorites')}
  title={item.is_favorite ? (language === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites') : (language === 'ar' ? 'إضافة إلى المفضلة' : 'Add to favorites')}
>
  {togglingId === item.id ? (
    <LoadingSpinner size="sm" />
  ) : (
    <StarIcon className={`w-5 h-5 ${item.is_favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 dark:text-zinc-500'}`} />
  )}
</button>

// ✅ CORRECT - Restore button
import { ArrowPathIcon } from '@heroicons/react/24/outline';

<button
  onClick={() => handleRestore(item.id)}
  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
  aria-label={language === 'ar' ? 'استعادة' : 'Restore'}
  title={language === 'ar' ? 'استعادة' : 'Restore'}
>
  <ArrowPathIcon className="w-5 h-5" />
</button>

// ❌ WRONG - Text-only button (NO TEXT ALLOWED)
<button onClick={() => handleEdit(item)}>
  {language === 'ar' ? 'تعديل' : 'Edit'}
</button>

// ❌ WRONG - Icon+Text button (NO TEXT ALLOWED)
<button onClick={() => handleDelete(item.id)}>
  <TrashIcon className="w-4 h-4" />
  <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
</button>

// ❌ WRONG - Custom SVG instead of Heroicon
<button onClick={() => handleEdit(item)}>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6..." />
  </svg>
</button>

// ❌ WRONG - Missing aria-label and title
<button onClick={() => handleEdit(item)}>
  <PencilIcon className="w-5 h-5" />
</button>

// ❌ WRONG - Not switching icon based on state
<button onClick={() => handleToggleVisible(item.id)}>
  <EyeIcon className="w-5 h-5" /> 
  {/* Should switch to EyeSlashIcon when hidden */}
</button>
```

**Required Icon Imports:**
```typescript
import { 
  PencilIcon,      // Edit actions
  TrashIcon,       // Delete actions
  EyeIcon,         // Visible state
  EyeSlashIcon,    // Hidden state
  ArrowPathIcon,   // Restore actions
  StarIcon         // Favorite/Featured toggle
} from '@heroicons/react/24/outline';
```

**Icon Color Standards:**
- **Edit (PencilIcon)**: Blue tones (`text-blue-600 dark:text-blue-400`)
- **Delete (TrashIcon)**: Red tones (`text-red-600 dark:text-red-400`)
- **Visible (EyeIcon)**: **Green** (`text-green-600 dark:text-green-400`)
- **Hidden (EyeSlashIcon)**: **Grey/dimmed** (`text-gray-400 dark:text-zinc-500`)
- **Favorite Active (StarIcon)**: **Yellow with fill** (`text-yellow-500 fill-yellow-500`)
- **Favorite Inactive (StarIcon)**: **Grey outline** (`text-gray-400 dark:text-zinc-500`)
- **Restore (ArrowPathIcon)**: Green tones (`text-green-600 dark:text-green-400`)

### Pagination UI Standards

**All pagination components MUST include:**
- **Page Size Selector** (dropdown with options: 10, 20, 50, 100, 500)
- **First Page** button (jump to page 1)
- **Previous** button (go to previous page)
- **Page numbers** (show current page and neighboring pages)
- **Next** button (go to next page)
- **Last Page** button (jump to final page)
- **"Showing X-Y of Z" text** (displays current range and total count)

**Requirements:**
- **Always display pagination** (remove conditional rendering - show even when totalPages === 1)
- Use **modern pill-shaped design** (`rounded-full` buttons)
- **Element order** (both mobile and desktop):
  1. Navigation buttons (First, Previous, Page numbers, Next, Last) at the beginning
  2. "Showing X-Y of Z" text at the end
  3. Page size selector at the end
- **Responsive layout**:
  - Mobile: All elements stack vertically (each row centered)
  - Desktop (md+): All elements in one horizontal row (centered)
  - Use `md:contents` on inner wrapper divs to flatten structure on desktop
- **Styling consistency**:
  - Buttons: `px-4 py-2`, `border-2`, `rounded-full`, `font-medium text-sm`
  - Current page: `bg-gray-900 dark:bg-white text-white dark:text-gray-900`
  - Inactive pages: `border-2 border-gray-300 dark:border-zinc-600`
  - Disabled state: `disabled:opacity-50 disabled:cursor-not-allowed`
- Disable First/Previous when on first page
- Disable Next/Last when on last page
- Show ellipsis (...) for large page ranges
- Reset to page 1 when changing page size

**Standard Implementation Pattern:**
```typescript
<div className="flex flex-col gap-4">
  {/* All pagination elements */}
  <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-2">
    {/* First and Previous */}
    <div className="flex items-center justify-center gap-2 md:contents">
      <button 
        disabled={currentPage === 1}
        className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
      >
        First
      </button>
      <button 
        disabled={currentPage === 1}
        className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
      >
        Previous
      </button>
    </div>

    {/* Page Numbers */}
    <div className="flex flex-wrap items-center justify-center gap-1 md:contents">
      {pageNumbers.map(page => (
        <button 
          key={page}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
            page === currentPage
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300'
          }`}
        >
          {page}
        </button>
      ))}
    </div>

    {/* Next and Last */}
    <div className="flex items-center justify-center gap-2 md:contents">
      <button 
        disabled={currentPage === totalPages}
        className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
      >
        Next
      </button>
      <button 
        disabled={currentPage === totalPages}
        className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm text-gray-700 dark:text-zinc-300"
      >
        Last
      </button>
    </div>

    {/* Showing count info (at the end) */}
    <div className="flex items-center justify-center md:contents">
      <span className="text-sm text-gray-600 dark:text-zinc-400">
        {language === 'ar'
          ? `عرض ${start} - ${end} من ${total}`
          : `Showing ${start} - ${end} of ${total}`
        }
      </span>
    </div>

    {/* Page Size Selector (at the end) */}
    <div className="flex items-center justify-center gap-2 md:contents">
      <label className="text-sm text-gray-600 dark:text-zinc-400">
        {language === 'ar' ? 'عرض:' : 'Show:'}
      </label>
      <select
        value={pagination.limit}
        onChange={(e) => handleLimitChange(Number(e.target.value))}
        className="px-3 py-1.5 border-2 border-gray-300 dark:border-zinc-600 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all cursor-pointer"
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="500">500</option>
      </select>
    </div>
  </div>
</div>
```

### Search and Filter UI Standards

**All search/filter sections MUST be responsive:**

**Requirements:**
- **Container**: `bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 sm:p-6`
- **Layout**: Vertical stack on mobile → Horizontal row on desktop
- **Input height**: Consistent `min-h-[48px]` for all inputs and buttons
- **Modern styling**: `rounded-full` inputs and buttons, `border-2` borders

**Desktop Layout Pattern (lg+):**
```typescript
<div className="flex flex-col lg:flex-row lg:items-start gap-4">
  {/* Search section - constrained width */}
  <div className="flex-1 lg:max-w-md">
    <SearchBar />
  </div>
  
  {/* Filter section - takes remaining space */}
  <div className="flex-1">
    <DateRangeFilter />
  </div>
</div>
```

**SearchBar Component Pattern:**
- Mobile: Input stacks above button (`flex-col`)
- Tablet+: Input and button side-by-side (`sm:flex-row`)
- Button: `w-full sm:w-auto` with `whitespace-nowrap`
- Input: `min-h-[48px]` with icon positioned inside
- Search icon: `absolute` positioned right/left based on RTL

**DateRangeFilter Component Pattern:**
- Mobile: All elements stack vertically
- Tablet+: Dates + Buttons in single row
- Date inputs: `flex-1` to share space equally
- Buttons: `whitespace-nowrap` to prevent text wrapping
- Clear button: Only show when dates are set

### Home Page Sections UI Standards

**All home page sections MUST follow this consistent pattern:**

**Container Requirements:**
- **Max-width container**: Use `container mx-auto max-w-7xl` for consistent width
- **Section wrapper**: `<section className="py-16 px-4 bg-gray-50 dark:bg-zinc-950">`
- **Header alignment**: Title and description at top, "View All" button aligned to right
- **Bilingual support**: Display title/description/buttons in Arabic or English based on `language`
- **Theme integration**: Use `var(--color-primary)` for titles and buttons
- **Visibility control**: Each section has admin toggle via `home_sections` table

**Section Types and Content Limits:**
- **News**: Latest articles, horizontal carousel (3 cards per view)
- **Photos**: Featured photos, horizontal carousel (3 cards per view)  
- **Videos**: Featured videos, horizontal carousel (3 cards per view)
- **Partners**: Partner cards, horizontal carousel (responsive: 1/2/3/4 cards)
- **FAQ**: Top 5 questions, vertical accordion list (max-w-4xl centered)
- **Magazines**: Latest publications, horizontal carousel (4 cards per view)

**Standard Carousel Section Structure:**
```typescript
<section className="py-16 px-4 bg-gray-50 dark:bg-zinc-950">
  <div className="container mx-auto max-w-7xl">
    {/* Header with title and "View All" button */}
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 transition-all duration-700 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
    }`}>
      <div>
        <h2 
          className="text-3xl md:text-4xl font-bold"
          style={{ color: 'var(--color-primary)' }}
        >
          {language === 'ar' ? 'العنوان بالعربية' : 'English Title'}
        </h2>
        <p className="text-gray-600 dark:text-zinc-400 mt-2">
          {language === 'ar' ? 'الوصف بالعربية' : 'English description'}
        </p>
      </div>
      {hasMore && (
        <Link
          href="/section-page"
          className="inline-block text-white px-6 py-2.5 rounded-full font-medium transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 whitespace-nowrap w-fit text-sm"
          style={{ backgroundColor: 'var(--color-primary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
          }}
        >
          {language === 'ar' ? 'جميع العناصر' : 'All Items'}
        </Link>
      )}
    </div>

    {/* Horizontal Scroll Carousel */}
    <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(${isRTL ? currentIndex * (100 / cardsPerView) : -currentIndex * (100 / cardsPerView)}%)`
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 px-2 md:px-4"
              style={{ width: `${100 / cardsPerView}%` }}
            >
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > cardsPerView && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-2' : 'left-2'} p-3 bg-white dark:bg-zinc-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all z-10`}
            aria-label={language === 'ar' ? 'السابق' : 'Previous'}
          >
            {isRTL ? (
              <ChevronRightIcon className="w-6 h-6 text-gray-700 dark:text-zinc-300" />
            ) : (
              <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-zinc-300" />
            )}
          </button>
          <button
            onClick={goToNext}
            className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-2' : 'right-2'} p-3 bg-white dark:bg-zinc-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all z-10`}
            aria-label={language === 'ar' ? 'التالي' : 'Next'}
          >
            {isRTL ? (
              <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-zinc-300" />
            ) : (
              <ChevronRightIcon className="w-6 h-6 text-gray-700 dark:text-zinc-300" />
            )}
          </button>
        </>
      )}
    </div>

    {/* Dots indicator */}
    {items.length > cardsPerView && (
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-gray-900 dark:bg-white'
                : 'bg-gray-400 dark:bg-zinc-600'
            }`}
            aria-label={`${language === 'ar' ? 'انتقل إلى الشريحة' : 'Go to slide'} ${index + 1}`}
          />
        ))}
      </div>
    )}
  </div>
</section>
```

**FAQ Section Pattern (Vertical List):**
```typescript
<section className="py-16 px-4 bg-gray-50 dark:bg-zinc-950">
  <div className="container mx-auto max-w-7xl">
    <div className="max-w-4xl mx-auto">
      {/* Header with title and button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {language === 'ar' ? 'الأسئلة المتكررة' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 mt-2">
            {language === 'ar' ? 'إجابات على الأسئلة الشائعة' : 'Find answers to common questions'}
          </p>
        </div>
        {hasMore && (
          <Link href="/faq" className="...">
            {language === 'ar' ? 'جميع الأسئلة' : 'All FAQs'}
          </Link>
        )}
      </div>
      
      {/* Vertical accordion list */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
        {faqs.map((faq) => (
          <FAQAccordionItem key={faq.id} faq={faq} />
        ))}
      </div>
    </div>
  </div>
</section>
```

**Admin Visibility Controls:**
- Access: `/admin/home-sections`
- Toggle visibility for: News, Photos, Videos, Partners, FAQ, Magazines
- Each section stored in `home_sections` table with `section_type` and `is_visible` fields
- Run seed script: `npx tsx scripts/add-faq-magazine-sections.ts` to initialize FAQ/Magazine sections

**Button Text Patterns:**
- **News**: `{language === 'ar' ? 'جميع الأخبار' : 'All News'}`
- **Photos**: `{language === 'ar' ? 'جميع الصور' : 'All Photos'}`
- **Videos**: `{language === 'ar' ? 'جميع الفيديوهات' : 'All Videos'}`
- **Partners**: `{language === 'ar' ? 'جميع الشركاء' : 'All Partners'}`
- **FAQs**: `{language === 'ar' ? 'جميع الأسئلة' : 'All FAQs'}`
- **Magazines**: `{language === 'ar' ? 'جميع المجلات' : 'All Magazines'}`

**Example Implementations:**
- [lib/components/home/NewsGridClient.tsx](../lib/components/home/NewsGridClient.tsx) - News carousel (3 cards)
- [lib/components/home/PhotosSection.tsx](../lib/components/home/PhotosSection.tsx) - Photos carousel (3 cards)
- [lib/components/home/VideosSection.tsx](../lib/components/home/VideosSection.tsx) - Videos carousel (3 cards)
- [lib/components/home/PartnersSection.tsx](../lib/components/home/PartnersSection.tsx) - Partners carousel (responsive)
- [lib/components/home/FAQSection.tsx](../lib/components/home/FAQSection.tsx) - Vertical accordion (top 5)
- [lib/components/home/MagazineSection.tsx](../lib/components/home/MagazineSection.tsx) - Magazines carousel (4 cards)

### Media Card UI Standards (Photos/Videos)

**All media cards MUST display published date:**

**Requirements:**
- **Always-visible gradient overlay**: `bg-gradient-to-t from-black/80 via-black/40 to-transparent`
- **Content at bottom**: Title and date always visible (not just on hover)
- **Calendar icon**: SVG icon with date text
- **Localized date format**: `toLocaleDateString()` with proper locale
- **RTL support**: Flex direction reverses for Arabic

**Standard Media Card Pattern:**
```typescript
<div className="relative aspect-square overflow-hidden rounded-lg">
  <Image src={url} alt={title} fill className="object-cover" />
  
  {/* Always-visible gradient */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
  
  {/* Enhanced hover gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

  {/* Content overlay at bottom */}
  <div className="absolute inset-x-0 bottom-0 p-4 text-white z-10">
    <h3 className="font-semibold line-clamp-2 mb-2 drop-shadow-lg">{title}</h3>
    
    <div className={`flex items-center gap-2 text-sm text-white/90 ${
      language === 'ar' ? 'flex-row-reverse justify-end' : ''
    }`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="drop-shadow-md">{publishedDate}</span>
    </div>
  </div>
</div>
```

**Date Formatting:**
```typescript
const publishedDate = new Date(item.published_date).toLocaleDateString(
  language === 'ar' ? 'ar-SA' : 'en-US',
  { year: 'numeric', month: 'long', day: 'numeric' }
);
```

**Type Conversion:**
- **API routes**: Dates auto-serialize through `NextResponse.json()` ✅
- **Server components**: Manually convert Prisma `Date` objects to ISO strings:
  ```typescript
  photos={photos.map(p => ({ ...p, published_date: p.published_date.toISOString() }))}
  ```
- **Interface**: `MediaItem.published_date: string` (not `Date`)

### Button and Input Design Standards

**All buttons and inputs MUST use modern design:**

**Button Styles:**
- **Primary**: `bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-6 py-3`
- **Secondary**: `border-2 border-gray-300 dark:border-zinc-600 rounded-full px-6 py-3`
- **Danger**: `border-2 border-red-300 text-red-600 rounded-full px-6 py-3` (bordered, not solid)
- **Size**: `min-h-[44px]` minimum for touch targets, `min-h-[48px]` for form inputs
- **Padding**: `px-4 py-2` for compact, `px-6 py-3` for standard, `px-8 py-3` for prominent

**Input Styles:**
- **Text inputs**: `rounded-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700`
- **File inputs**: `rounded-2xl` (slightly less rounded for better file display)
- **Select dropdowns**: `rounded-full` with `cursor-pointer`
- **Height**: Consistent `py-3` creates `min-h-[48px]` naturally

**Responsive Button Width:**
- Mobile: `w-full` for easy tapping
- Tablet+: `sm:w-auto` to fit content
- Add `whitespace-nowrap` to prevent text wrapping

### Animation Standards (Framer Motion)

**All animations MUST use Framer Motion** (v12.38.0 installed):

**When to Use Animations:**
- ✅ User interactions (hover, tap, drag)
- ✅ State changes (expand/collapse, show/hide)
- ✅ Page transitions and reveals
- ✅ Scroll-based effects (parallax, fade-in)
- ✅ Loading states and skeleton screens
- ❌ Avoid excessive animations that distract from content

**CRITICAL REQUIREMENTS:**
- **Always add `'use client'`** directive when using Framer Motion
- **Import from framer-motion**: `import { motion, AnimatePresence } from 'framer-motion';`
- **Use transform properties** (x, y, scale, rotate) instead of top/left for performance
- **Use opacity** for fade effects (GPU-accelerated)
- **Keep transitions short** (0.2-0.6s optimal, max 1s)
- **Test on lower-end devices** to ensure smooth performance

**Standard Animation Patterns:**

**1. Hover Effects (Interactive Elements):**
```typescript
import { motion } from 'framer-motion';

// Card hover - lift and scale
<motion.div
  whileHover={{ y: -8, scale: 1.02 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
  className="bg-white rounded-lg shadow-lg p-6"
>
  {/* Card content */}
</motion.div>

// Button hover and tap
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
  className="px-6 py-3 rounded-full"
>
  Click Me
</motion.button>
```

**2. Accordion/Collapse Animations:**
```typescript
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence initial={false}>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      {/* Collapsible content */}
    </motion.div>
  )}
</AnimatePresence>
```

**3. Scroll-Triggered Animations:**
```typescript
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ref = useRef(null);
const isInView = useInView(ref, { once: true, amount: 0.3 });

<motion.section
  ref={ref}
  initial={{ opacity: 0, y: 50 }}
  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  {/* Section content */}
</motion.section>
```

**4. Parallax Scroll Effects:**
```typescript
import { motion, useScroll, useTransform } from 'framer-motion';

const { scrollYProgress } = useScroll({
  target: sectionRef,
  offset: ["start end", "end start"]
});
const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

<motion.div
  style={{ y }}
  className="absolute inset-0 -z-10"
>
  {/* Background element */}
</motion.div>
```

**5. Stagger Children Animations:**
```typescript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
    >
      <ItemCard item={item} />
    </motion.div>
  ))}
</motion.div>
```

**6. Modal/Dialog Animations:**
```typescript
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop fade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50"
      />
      
      {/* Dialog scale and fade */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-0 flex items-center justify-center"
      >
        {/* Dialog content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

**Animation Property Reference:**

| Property | Purpose | Example |
|----------|---------|---------|
| `initial` | Starting state | `{ opacity: 0, y: 20 }` |
| `animate` | End state | `{ opacity: 1, y: 0 }` |
| `exit` | Exit animation (needs `AnimatePresence`) | `{ opacity: 0, scale: 0.9 }` |
| `whileHover` | Hover state | `{ scale: 1.05, y: -4 }` |
| `whileTap` | Click/tap state | `{ scale: 0.95 }` |
| `whileInView` | When in viewport | `{ opacity: 1, y: 0 }` |
| `transition` | Animation timing | `{ duration: 0.3, ease: "easeOut" }` |
| `variants` | Reusable animation states | See stagger example |

**Advanced Features:**

**Layout Animations (Auto-animate layout changes):**
```typescript
<motion.div layout>
  {/* Content that changes size/position */}
</motion.div>
```

**Drag and Drop:**
```typescript
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
  dragElastic={0.2}
  whileDrag={{ scale: 1.1 }}
>
  Drag me
</motion.div>
```

**Gesture Detection:**
```typescript
<motion.div
  whileTap={{ scale: 0.9 }}
  whileHover={{ scale: 1.1 }}
  onTap={() => console.log('Tapped')}
  onHoverStart={() => console.log('Hover started')}
  onHoverEnd={() => console.log('Hover ended')}
>
  Interactive element
</motion.div>
```

**Path Animations (SVG):**
```typescript
<motion.svg>
  <motion.path
    d="M 0 0 L 100 100"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 2 }}
  />
</motion.svg>
```

**View-Based Animations (Alternative to useInView):**
```typescript
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true, amount: 0.5 }}
  transition={{ duration: 0.5 }}
>
  Fade in when 50% visible
</motion.div>
```

**Performance Best Practices:**

1. ✅ **Prefer transform/opacity** - GPU accelerated properties
   - Use: `x`, `y`, `scale`, `rotate`, `opacity`
   - Avoid: `width`, `height`, `top`, `left`, `margin`

2. ✅ **Use will-change sparingly** - Only for complex animations
   ```typescript
   <motion.div style={{ willChange: 'transform' }} />
   ```

3. ✅ **Reduce motion for accessibility**
   ```typescript
   import { useReducedMotion } from 'framer-motion';
   
   const prefersReducedMotion = useReducedMotion();
   const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.5 };
   ```

4. ✅ **Use `layout` prop for content that changes dimensions**
   ```typescript
   <motion.div layout transition={{ duration: 0.3 }} />
   ```

5. ✅ **Optimize with `initial={false}`** when not needed
   ```typescript
   <AnimatePresence initial={false}>
   ```

6. ✅ **Use `once: true` for one-time scroll animations**
   ```typescript
   const isInView = useInView(ref, { once: true });
   ```

**Accessibility Considerations:**
- Always respect `prefers-reduced-motion` setting
- Ensure animations don't hide important content
- Keep animations smooth (no flashing/flickering)
- Don't rely solely on animation for critical feedback
- Provide alternative indicators for users who disable animations

**Examples in Codebase:**
- [FAQAccordionItem.tsx](../lib/components/faq/FAQAccordionItem.tsx) - Accordion animations
- [FAQSection.tsx](../lib/components/home/FAQSection.tsx) - Scroll parallax + stagger
- [MagazineCard.tsx](../lib/components/magazines/MagazineCard.tsx) - Hover and tap effects
- [MagazineSection.tsx](../lib/components/home/MagazineSection.tsx) - Scroll transforms

**Common Mistakes to Avoid:**
- ❌ Forgetting `'use client'` directive
- ❌ Using `left`/`top` instead of `x`/`y`
- ❌ Animations longer than 1 second
- ❌ Not testing on mobile devices
- ❌ Animating non-GPU properties (width, height, etc.)
- ❌ Missing `AnimatePresence` for exit animations
- ❌ Over-animating every element (use sparingly)

## Build and Test

```bash
npm install              # Auto-runs prisma generate
npm run dev              # Start dev server
npm run build            # Prisma generate + Next build
npm test                 # Run Vitest (infrastructure ready, tests pending)
npm run seed-admin       # Create admin user
```

**Critical**: `DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `BLOB_READ_WRITE_TOKEN` must be set before build.

See [DEPLOYMENT_CHECKLIST.md](../docs/DEPLOYMENT_CHECKLIST.md) for full setup process.

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

See [VERCEL_BLOB_SETUP.md](../docs/VERCEL_BLOB_SETUP.md) and [UPLOAD_TROUBLESHOOTING.md](../docs/UPLOAD_TROUBLESHOOTING.md) for details.

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
| Wrong base URL in production | Hard-coded localhost | Use environment variables and process.env |
| OG images fail in Teams | Dynamic API routes | Use file-based [app/opengraph-image.tsx](../app/opengraph-image.tsx) |
| News section empty on Vercel | HTTP fetch in server component | Query DB directly with Prisma |

See [TEAMS_PREVIEW_FIX.md](../docs/TEAMS_PREVIEW_FIX.md) and [VERCEL_FIX_CHECKLIST.md](../docs/VERCEL_FIX_CHECKLIST.md) for deployment-specific issues.

## Theme System

**5 themes** (Default, Modern, Elegant, Minimal, Vibrant) with light/dark variants.

Configuration: [lib/themes/themeConfig.ts](../lib/themes/themeConfig.ts)  
Storage: `app_settings` table  
Usage: CSS custom properties (`var(--color-primary)`, `var(--color-text-primary)`)  

See [THEME_SYSTEM.md](../docs/THEME_SYSTEM.md) for full documentation.

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
- [CLIENTS_SETUP.md](../docs/CLIENTS_SETUP.md) - Client management setup
- [DEPLOYMENT_CHECKLIST.md](../docs/DEPLOYMENT_CHECKLIST.md) - Full deployment process
- [IMPLEMENTATION_PROGRESS.md](../docs/IMPLEMENTATION_PROGRESS.md) - Feature implementation status
- [STYLE_LIBRARY.md](../docs/STYLE_LIBRARY.md) - Style library documentation
- [Neon Postgres skill](./../.agents/skills/neon-postgres/SKILL.md) - Database-specific guidance
