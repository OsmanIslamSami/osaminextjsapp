'use client';

import { useEffect, useState } from 'react';
import { useAppSettings } from '@/lib/contexts/AppSettingsContext';
import { getTheme, ThemeColors } from '@/lib/themes/themeConfig';

export function ThemeApplier() {
  const { settings, loading } = useAppSettings();
  const [isDark, setIsDark] = useState(false);

  // Detect system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (loading || !settings) return;

    const theme = getTheme(settings.theme);
    const colors: ThemeColors = isDark ? theme.dark : theme.light;

    // Apply CSS variables to :root
    const root = document.documentElement;
    
    // Primary colors
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-hover', colors.primaryHover);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
    root.style.setProperty('--color-primary-dark', colors.primaryDark);
    
    // Secondary colors
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-secondary-hover', colors.secondaryHover);
    
    // Background colors
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-background-secondary', colors.backgroundSecondary);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-surface-hover', colors.surfaceHover);
    
    // Text colors
    root.style.setProperty('--color-text-primary', colors.textPrimary);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-text-tertiary', colors.textTertiary);
    
    // Border colors
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-border-hover', colors.borderHover);
    
    // Status colors
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-info', colors.info);
    
    // Accent colors
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-accent-light', colors.accentLight);
    
    // Apply background to body
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.textPrimary;
    
  }, [settings, loading, isDark]);

  return null;
}
