# Theme System Documentation

## Overview
The application now has a fully functional theme system with 5 pre-built themes that automatically adapt to light and dark modes.

## Available Themes

### 1. **Default** (افتراضي)
Classic and clean design with blue primary colors
- Primary: Blue (#2563eb / #3b82f6)
- Best for: Professional, corporate applications

### 2. **Modern** (عصري)
Contemporary and sleek with sky/cyan colors
- Primary: Sky Blue (#0ea5e9 / #38bdf8)
- Best for: Tech startups, innovative products

### 3. **Elegant** (أنيق)
Sophisticated and refined with violet/pink colors
- Primary: Violet (#7c3aed / #a78bfa)
- Best for: Premium brands, luxury services

### 4. **Minimal** (بسيط)
Simple and focused with neutral grayscale
- Primary: Neutral (#171717 / #f5f5f5)
- Best for: Content-focused apps, minimalist design

### 5. **Vibrant** (نابض)
Bold and colorful with orange/pink colors
- Primary: Orange (#f97316 / #fb923c)
- Best for: Creative agencies, fun applications

## How to Use

### Admin Configuration
1. Navigate to **Admin Panel** → **App Settings**
2. Click on the **Themes** tab
3. Select your desired theme
4. Changes apply instantly across the entire application

### Using Theme Colors in Components

#### Option 1: CSS Variables (Recommended)
```tsx
<div style={{ backgroundColor: 'var(--color-primary)' }}>
  <h1 style={{ color: 'var(--color-text-primary)' }}>Hello</h1>
</div>
```

#### Option 2: Utility Classes
Pre-built utility classes are available in globals.css:

```tsx
<div className="bg-themed-surface border-themed">
  <h1 className="text-themed-primary">Hello</h1>
  <button className="btn-themed-primary">Click Me</button>
</div>
```

#### Option 3: Inline Styles with TypeScript
```tsx
const root = document.documentElement;
const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary');
```

## Available CSS Variables

### Colors
- `--color-primary` - Main brand color
- `--color-primary-hover` - Hover state for primary
- `--color-primary-light` - Light variant of primary
- `--color-primary-dark` - Dark variant of primary
- `--color-secondary` - Secondary color
- `--color-secondary-hover` - Hover state for secondary

### Backgrounds
- `--color-background` - Main background
- `--color-background-secondary` - Secondary background
- `--color-surface` - Card/surface background
- `--color-surface-hover` - Hover state for surfaces

### Text
- `--color-text-primary` - Main text color
- `--color-text-secondary` - Secondary text
- `--color-text-tertiary` - Tertiary/muted text

### Borders
- `--color-border` - Default border color
- `--color-border-hover` - Hover border color

### Status
- `--color-success` - Success/positive states
- `--color-warning` - Warning/caution states
- `--color-error` - Error/danger states
- `--color-info` - Information states

### Accent
- `--color-accent` - Accent/highlight color
- `--color-accent-light` - Light accent variant

## Utility Classes Reference

### Background Classes
- `.bg-themed-primary` - Primary background color
- `.bg-themed-surface` - Surface background (with hover)
- `.bg-themed-bg-secondary` - Secondary background

### Text Classes
- `.text-themed-primary` - Primary text color
- `.text-themed-secondary` - Secondary text color
- `.text-themed-tertiary` - Tertiary text color
- `.text-themed-success` - Success text color
- `.text-themed-warning` - Warning text color
- `.text-themed-error` - Error text color
- `.text-themed-info` - Info text color

### Border Classes
- `.border-themed` - Themed border (with hover)

### Button Classes
- `.btn-themed-primary` - Primary button style
- `.btn-themed-secondary` - Secondary button style

## Dark Mode Support

Themes automatically adapt to the user's system preference:
- Light mode: Uses light color palette
- Dark mode: Uses dark color palette
- Automatic switching based on `prefers-color-scheme`

## Architecture

### Components
1. **ThemeApplier** (`/lib/components/ThemeApplier.tsx`)
   - Applies theme CSS variables based on selected theme
   - Automatically detects and responds to dark mode changes
   - Updates in real-time when theme changes

2. **AppSettingsContext** (`/lib/contexts/AppSettingsContext.tsx`)
   - Manages application settings including theme selection
   - Provides settings to all components via React Context

3. **Theme Configuration** (`/lib/themes/themeConfig.ts`)
   - Defines all theme color palettes
   - Exports theme data for preview and application

### Database
Theme preference is stored in the `app_settings` table:
```prisma
model app_settings {
  theme  String  @default("default")
  // ... other fields
}
```

## Adding New Themes

To add a new theme:

1. Add theme definition to `/lib/themes/themeConfig.ts`:
```typescript
export const themes: Record<string, Theme> = {
  // ... existing themes
  newTheme: {
    id: 'newTheme',
    name: 'New Theme',
    nameAr: 'قالب جديد',
    light: { /* light colors */ },
    dark: { /* dark colors */ }
  }
};
```

2. Add translation keys to translation files:
```json
{
  "admin": {
    "appSettings": {
      "themes": {
        "options": {
          "newTheme": "New Theme"
        },
        "descriptions": {
          "newTheme": "Description of the new theme"
        }
      }
    }
  }
}
```

3. Add theme to THEMES array in `/app/admin/app-settings/page.tsx`:
```typescript
const THEMES = [
  // ... existing themes
  { id: 'newTheme', name: 'New Theme', nameAr: 'قالب جديد' },
];
```

## Best Practices

1. **Use CSS Variables**: Always prefer CSS variables over hardcoded colors
2. **Semantic Naming**: Use semantic variable names (primary, success) not color names (blue, green)
3. **Consistent Application**: Apply theme colors consistently across all components
4. **Test Both Modes**: Always test your UI in both light and dark modes
5. **Accessibility**: Ensure sufficient contrast ratios in all themes

## Examples

### Themed Button Component
```tsx
function ThemedButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="px-4 py-2 rounded-lg font-semibold transition-colors"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-primary)';
      }}
    >
      {children}
    </button>
  );
}
```

### Themed Card Component
```tsx
function ThemedCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-6 border-themed"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <h3 style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--color-text-secondary)' }}>{children}</p>
    </div>
  );
}
```

## Troubleshooting

**Theme not applying?**
- Clear browser cache and reload
- Check browser console for errors
- Verify ThemeApplier is mounted in the component tree

**Colors look wrong?**
- Check if your component is using hardcoded colors instead of CSS variables
- Verify theme is saved correctly in database

**Dark mode not working?**
- Check system preferences (OS level dark mode setting)
- Verify theme has both light and dark color definitions
