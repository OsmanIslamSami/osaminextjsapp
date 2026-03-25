# Research: Clients Table with Action Icons

**Feature**: 002-clients-table-view  
**Phase**: 0 (Research & Decision Documentation)  
**Date**: March 25, 2026

## Overview

This document captures technical research and architectural decisions for implementing a striped table view with action icons, infinite scroll, and colored status badges for the clients page.

## Research Tasks & Decisions

### 1. Infinite Scroll Implementation

**Research Question**: How to implement infinite scroll for client table in React/Next.js?

**Approaches Considered**:
- **A. Intersection Observer API**: Native browser API, highly performant, widely supported
- **B. Third-party library (react-infinite-scroll-component)**: Pre-built solution, less control
- **C. Scroll event listener**: Manual implementation, potential performance issues
- **D. Server-side pagination only**: Simplified but less modern UX

**Decision**: Intersection Observer API (Option A)

**Rationale**:
- Native browser support in all modern browsers (95%+ coverage)
- Excellent performance with minimal overhead
- Clean React integration via useEffect hook
- No additional dependencies needed
- Matches spec requirement for "seamless modern UX"
- Constitution Principle VI (API-First) satisfied by cursor-based backend pagination

**Implementation Notes**:
- Place sentinel div at table bottom
- Trigger fetch when sentinel enters viewport
- Use cursor-based pagination (last client ID) to avoid offset issues with deletions
- Load 50 clients per batch (balances network requests vs. UX smoothness)
- Show loading spinner during fetch
- Handle edge cases: all loaded, error states, empty results

**Alternatives Considered**:
- React-infinite-scroll-component rejected: Adds 15KB dependency, less flexible for table layout
- Scroll events rejected: Performance concerns with frequent re-renders
- Server pagination rejected: Not aligned with spec requirement for "seamless" infinite scroll

---

### 2. Icon Library Selection

**Research Question**: Which icon library to use for View, Edit, Delete actions?

**Approaches Considered**:
- **A. Heroicons**: Tailwind's official icon set, SVG-based, tree-shakeable
- **B. FontAwesome**: Comprehensive, larger bundle size
- **C. Lucide React**: Modern fork of Feather icons, lightweight
- **D. Custom SVG icons**: Maximum control, maintenance overhead

**Decision**: Heroicons (Option A)

**Rationale**:
- Already using Tailwind CSS (per package.json)
- Zero config integration with Tailwind
- SVG-based (no font loading delay)
- Tree-shakeable (only import used icons)
- Consistent design language with existing UI
- Free and MIT licensed
- Icons needed: EyeIcon (view), PencilIcon (edit), TrashIcon (delete)

**Implementation Notes**:
```tsx
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
```
- Use 24px outline variants for consistency
- Apply hover states with Tailwind: `hover:text-blue-600`, `hover:text-red-600`
- Icon size: w-5 h-5 (20px) for table row density

**Alternatives Considered**:
- FontAwesome rejected: Heavier bundle, not native to Tailwind ecosystem
- Lucide rejected: Additional dependency when Heroicons already aligned
- Custom SVGs rejected: Maintenance overhead, reinventing wheel

---

### 3. Status Badge Styling

**Research Question**: How to implement colored status badges (green/Active, gray/Inactive)?

**Approaches Considered**:
- **A. Tailwind utility classes**: Inline with existing styling approach
- **B. CSS modules**: Separate styling, more verbose
- **C. styled-components**: Requires additional dependency
- **D. Custom badge component library**: Over-engineered for two states

**Decision**: Tailwind utility classes with dedicated StatusBadge component (Option A)

**Rationale**:
- Consistent with project's Tailwind CSS approach
- No additional dependencies
- Easily customizable and maintainable
- Accessible with proper contrast ratios
- Reusable component pattern

**Implementation Notes**:
```tsx
// StatusBadge.tsx
<span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
  status === 'Active' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-gray-100 text-gray-800'
}`}>
  {status}
</span>
```
- Active: bg-green-100 (light green bg), text-green-800 (dark green text)
- Inactive: bg-gray-100 (light gray bg), text-gray-800 (dark gray text)
- WCAG AA contrast compliant
- Pill-shaped (rounded-full) for visual distinction
- Small padding for table row density

**Alternatives Considered**:
- CSS Modules rejected: Unnecessary complexity for simple conditional styling
- styled-components rejected: Adds 15KB+ dependency, not aligned with Tailwind approach
- Badge library rejected: Over-engineered for two-state display

---

### 4. Table Striping Pattern

**Research Question**: How to implement alternating row colors for striped table?

**Approaches Considered**:
- **A. CSS :nth-child(even) pseudo-selector**: Native CSS, zero JS
- **B. Tailwind even: modifier**: Tailwind-native approach
- **C. Manual index-based className logic**: JavaScript conditional
- **D. CSS-in-JS striping**: Requires runtime styling

**Decision**: Tailwind even: modifier (Option B)

**Rationale**:
- Idiomatic Tailwind approach
- Compile-time utilities (no runtime cost)
- Clean JSX syntax
- Consistent with project styling patterns
- Accessibility-friendly (doesn't interfere with screen readers)

**Implementation Notes**:
```tsx
<tr className="even:bg-gray-50 hover:bg-gray-100 transition-colors">
```
- Even rows: bg-gray-50 (subtle gray)
- Odd rows: bg-white (default)
- Hover state: bg-gray-100 (darker gray) for both
- Smooth transition with transition-colors
- Maintains accessibility with sufficient contrast

**Alternatives Considered**:
- Pure CSS :nth-child rejected: Less integrated with Tailwind workflow
- Manual JS logic rejected: Unnecessary runtime overhead
- CSS-in-JS rejected: Not aligned with Tailwind approach

---

### 5. Delete Confirmation Dialog

**Research Question**: How to implement contextual delete confirmation with client name?

**Approaches Considered**:
- **A. Browser confirm() dialog**: Native, simple, but not customizable
- **B. Custom modal component**: Full control, better UX, matches design system
- **C. Third-party modal library**: Additional dependency
- **D. Inline confirmation (two-step delete)**: Less explicit, risk of accidents

**Decision**: Enhance existing ConfirmDialog component (Option B)

**Rationale**:
- Project already has ConfirmDialog.tsx component
- Better UX than native confirm() with brand-consistent styling
- Supports contextual messaging ("Delete [Name]?")
- Accessible (keyboard navigation, focus trap)
- Constitution Principle I (data integrity) requires explicit confirmation

**Implementation Notes**:
```tsx
// Enhance ConfirmDialog to accept custom message
<ConfirmDialog
  isOpen={showConfirm}
  title="Delete Client"
  message={`Are you sure you want to delete ${clientName}? This action cannot be undone.`}
  onConfirm={handleConfirmDelete}
  onCancel={() => setShowConfirm(false)}
/>
```
- Display client name prominently
- Include warning about irreversibility (even though soft-delete)
- Confirm button: red for danger
- Cancel button: gray for safety (default action)
- ESC key closes dialog (cancel action)

**Alternatives Considered**:
- Native confirm() rejected: Poor UX, no styling control, not mobile-friendly
- Third-party library rejected: Existing component already present
- Two-step delete rejected: Less explicit than modal, higher error risk

---

### 6. Database Migration Strategy

**Research Question**: How to add company and status fields to clients table safely?

**Approaches Considered**:
- **A. Additive migration with nullables**: Zero-downtime, backward compatible
- **B. Immediate non-null with defaults**: Requires backfill, potential locks
- **C. Multi-phase migration**: Complex, over-engineered for new fields
- **D. Direct schema modification**: Violates Constitution Principle III

**Decision**: Additive migration with nullable company and enum status (Option A)

**Rationale**:
- Constitution Principle III mandates zero-downtime migrations
- company: String? (nullable) allows gradual population
- status: ClientStatus enum with @default(Active) for existing records
- Creates enum type in PostgreSQL
- No data backfill required immediately
- Backward compatible (existing code won't break)
- Can be tested in Neon temporary branch

**Implementation Notes**:
```prisma
enum ClientStatus {
  Active
  Inactive
}

model clients {
  // ... existing fields
  company String? @db.VarChar(255)
  status  ClientStatus @default(Active)
}
```

Migration SQL:
```sql
-- Create enum type
CREATE TYPE "ClientStatus" AS ENUM ('Active', 'Inactive');

-- Add columns (nullable company, status with default)
ALTER TABLE "clients" 
  ADD COLUMN "company" VARCHAR(255),
  ADD COLUMN "status" "ClientStatus" NOT NULL DEFAULT 'Active'::"ClientStatus";

-- Add index for status filtering
CREATE INDEX "idx_clients_status" ON "clients"("status");
```

Rollback SQL:
```sql
-- Drop index
DROP INDEX IF EXISTS "idx_clients_status";

-- Drop columns
ALTER TABLE "clients" 
  DROP COLUMN IF EXISTS "status",
  DROP COLUMN IF EXISTS "company";

-- Drop enum type
DROP TYPE IF EXISTS "ClientStatus";
```

**Alternatives Considered**:
- Non-null company rejected: Forces immediate data entry, blocks migration
- Multi-phase rejected: Unnecessary complexity for two new fields
- Direct modification rejected: Violates governance, no rollback plan

---

## Summary of Technology Choices

| Component | Technology | Package/Library |
|-----------|-----------|-----------------|
| Infinite Scroll | Intersection Observer API | Native browser API |
| Icons | Heroicons | @heroicons/react |
| Status Badges | Tailwind utility classes | Tailwind CSS |
| Table Striping | Tailwind even: modifier | Tailwind CSS |
| Delete Confirmation | Enhanced ConfirmDialog | Custom component (existing) |
| Database Migration | Prisma migrate | @prisma/client |
| Enum Management | Prisma enum | PostgreSQL ENUM type |

## Implementation Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Large dataset performance | Slow infinite scroll | Limit batch size to 50, use cursor pagination, add database indices |
| Migration failure | Schema inconsistency | Test in Neon temp branch, include rollback SQL, verify in staging |
| Icon bundle size | Slower page load | Use Heroicons outline (tree-shakeable), lazy load if needed |
| Accessibility issues | Unusable for keyboard/screen reader users | Ensure focus states, ARIA labels, keyboard navigation |
| Browser compatibility | Intersection Observer unsupported | Provide fallback for old browsers (< 2% traffic), polyfill if needed |

## Next Steps (Phase 1)

1. ✅ Research complete
2. → Create data-model.md (database schema changes)
3. → Create contracts/api-clients.md (API pagination contract)
4. → Create quickstart.md (developer guide)
5. → Update .github/copilot-instructions.md (agent context)
