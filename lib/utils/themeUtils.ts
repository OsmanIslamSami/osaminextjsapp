// Helper function to get theme color with fallback
export function getThemeColor(varName: string, fallback: string = ''): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
}

// Theme-aware inline styles
export const themeStyles = {
  // Buttons
  primaryButton: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
  },
  primaryButtonHover: {
    backgroundColor: 'var(--color-primary-hover)',
  },
  
  // Backgrounds
  surface: {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
  },
  surfaceSecondary: {
    backgroundColor: 'var(--color-background-secondary)',
  },
  
  // Text
  textPrimary: {
    color: 'var(--color-text-primary)',
  },
  textSecondary: {
    color: 'var(--color-text-secondary)',
  },
  textTertiary: {
    color: 'var(--color-text-tertiary)',
  },
  
  // Borders
  border: {
    borderColor: 'var(--color-border)',
  },
  
  // Status
  success: {
    color: 'var(--color-success)',
  },
  warning: {
    color: 'var(--color-warning)',
  },
  error: {
    color: 'var(--color-error)',
  },
  info: {
    color: 'var(--color-info)',
  },
};

// Theme-aware class name builder
export function themeClasses(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
