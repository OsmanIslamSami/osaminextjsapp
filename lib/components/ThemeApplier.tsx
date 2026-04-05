'use client';

import { useEffect, useState } from 'react';
import { useAppSettings } from '@/lib/contexts/AppSettingsContext';
import { getTheme, ThemeColors } from '@/lib/themes/themeConfig';

// Helper function to adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Adjust brightness
  const adjust = (value: number) => {
    const adjusted = value + (value * percent / 100);
    return Math.max(0, Math.min(255, Math.round(adjusted)));
  };
  
  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);
  
  // Convert back to hex
  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

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
    
    // Override with custom colors if they exist
    // custom_color_1 typically represents primary color
    // custom_color_2 typically represents secondary color
    // custom_color_3 typically represents accent color
    // custom_color_4 typically represents background color
    // custom_color_5 typically represents text color
    
    // Primary colors
    root.style.setProperty('--color-primary', settings.custom_color_1 || colors.primary);
    root.style.setProperty('--color-primary-hover', settings.custom_color_1 ? adjustBrightness(settings.custom_color_1, -10) : colors.primaryHover);
    root.style.setProperty('--color-primary-light', settings.custom_color_1 ? adjustBrightness(settings.custom_color_1, 40) : colors.primaryLight);
    root.style.setProperty('--color-primary-dark', settings.custom_color_1 ? adjustBrightness(settings.custom_color_1, -20) : colors.primaryDark);
    
    // Secondary colors
    root.style.setProperty('--color-secondary', settings.custom_color_2 || colors.secondary);
    root.style.setProperty('--color-secondary-hover', settings.custom_color_2 ? adjustBrightness(settings.custom_color_2, -10) : colors.secondaryHover);
    
    // Background colors
    root.style.setProperty('--color-background', settings.custom_color_4 || colors.background);
    root.style.setProperty('--color-background-secondary', settings.custom_color_4 ? adjustBrightness(settings.custom_color_4, isDark ? 5 : -5) : colors.backgroundSecondary);
    root.style.setProperty('--color-surface', settings.custom_color_4 || colors.surface);
    root.style.setProperty('--color-surface-hover', settings.custom_color_4 ? adjustBrightness(settings.custom_color_4, isDark ? 10 : -10) : colors.surfaceHover);
    
    // Text colors
    root.style.setProperty('--color-text-primary', settings.custom_color_5 || colors.textPrimary);
    root.style.setProperty('--color-text-secondary', settings.custom_color_5 ? adjustBrightness(settings.custom_color_5, isDark ? -20 : 20) : colors.textSecondary);
    root.style.setProperty('--color-text-tertiary', settings.custom_color_5 ? adjustBrightness(settings.custom_color_5, isDark ? -40 : 40) : colors.textTertiary);
    
    // Border colors
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-border-hover', colors.borderHover);
    
    // Status colors  
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-info', colors.info);
    
    // Accent colors
    root.style.setProperty('--color-accent', settings.custom_color_3 || colors.accent);
    root.style.setProperty('--color-accent-light', settings.custom_color_3 ? adjustBrightness(settings.custom_color_3, 40) : colors.accentLight);
    
    // Apply background to body
    document.body.style.backgroundColor = settings.custom_color_4 || colors.background;
    document.body.style.color = settings.custom_color_5 || colors.textPrimary;
    
  }, [settings, loading, isDark]);

  return null;
}
