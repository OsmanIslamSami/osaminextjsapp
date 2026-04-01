// Theme Configuration System
export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary colors
  secondary: string;
  secondaryHover: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceHover: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Border colors
  border: string;
  borderHover: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Accent colors
  accent: string;
  accentLight: string;
}

export interface Theme {
  id: string;
  name: string;
  nameAr: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export const themes: Record<string, Theme> = {
  default: {
    id: 'default',
    name: 'Default',
    nameAr: 'افتراضي',
    light: {
      primary: '#2563eb', // blue-600
      primaryHover: '#1d4ed8', // blue-700
      primaryLight: '#dbeafe', // blue-50
      primaryDark: '#1e40af', // blue-800
      secondary: '#64748b', // slate-600
      secondaryHover: '#475569', // slate-700
      background: '#ffffff',
      backgroundSecondary: '#f8fafc', // slate-50
      surface: '#ffffff',
      surfaceHover: '#f1f5f9', // slate-100
      textPrimary: '#0f172a', // slate-900
      textSecondary: '#475569', // slate-600
      textTertiary: '#94a3b8', // slate-400
      border: '#e2e8f0', // slate-200
      borderHover: '#cbd5e1', // slate-300
      success: '#16a34a', // green-600
      warning: '#ea580c', // orange-600
      error: '#dc2626', // red-600
      info: '#0891b2', // cyan-600
      accent: '#7c3aed', // violet-600
      accentLight: '#ede9fe', // violet-50
    },
    dark: {
      primary: '#3b82f6', // blue-500
      primaryHover: '#60a5fa', // blue-400
      primaryLight: '#1e3a8a', // blue-900
      primaryDark: '#2563eb', // blue-600
      secondary: '#94a3b8', // slate-400
      secondaryHover: '#cbd5e1', // slate-300
      background: '#0f172a', // slate-900
      backgroundSecondary: '#1e293b', // slate-800
      surface: '#1e293b', // slate-800
      surfaceHover: '#334155', // slate-700
      textPrimary: '#f1f5f9', // slate-100
      textSecondary: '#cbd5e1', // slate-300
      textTertiary: '#64748b', // slate-600
      border: '#334155', // slate-700
      borderHover: '#475569', // slate-600
      success: '#22c55e', // green-500
      warning: '#f97316', // orange-500
      error: '#ef4444', // red-500
      info: '#06b6d4', // cyan-500
      accent: '#a78bfa', // violet-400
      accentLight: '#5b21b6', // violet-800
    },
  },
  
  modern: {
    id: 'modern',
    name: 'Modern',
    nameAr: 'عصري',
    light: {
      primary: '#0ea5e9', // sky-500
      primaryHover: '#0284c7', // sky-600
      primaryLight: '#e0f2fe', // sky-50
      primaryDark: '#075985', // sky-800
      secondary: '#6366f1', // indigo-500
      secondaryHover: '#4f46e5', // indigo-600
      background: '#ffffff',
      backgroundSecondary: '#f0fdfa', // teal-50
      surface: '#ffffff',
      surfaceHover: '#ecfeff', // cyan-50
      textPrimary: '#0c4a6e', // sky-900
      textSecondary: '#0369a1', // sky-700
      textTertiary: '#7dd3fc', // sky-300
      border: '#bae6fd', // sky-200
      borderHover: '#7dd3fc', // sky-300
      success: '#14b8a6', // teal-500
      warning: '#f59e0b', // amber-500
      error: '#ef4444', // red-500
      info: '#06b6d4', // cyan-500
      accent: '#8b5cf6', // violet-500
      accentLight: '#ede9fe', // violet-50
    },
    dark: {
      primary: '#38bdf8', // sky-400
      primaryHover: '#7dd3fc', // sky-300
      primaryLight: '#0c4a6e', // sky-900
      primaryDark: '#0ea5e9', // sky-500
      secondary: '#818cf8', // indigo-400
      secondaryHover: '#a5b4fc', // indigo-300
      background: '#0c4a6e', // sky-900
      backgroundSecondary: '#075985', // sky-800
      surface: '#075985', // sky-800
      surfaceHover: '#0369a1', // sky-700
      textPrimary: '#f0f9ff', // sky-50
      textSecondary: '#bae6fd', // sky-200
      textTertiary: '#0369a1', // sky-700
      border: '#0369a1', // sky-700
      borderHover: '#0284c7', // sky-600
      success: '#2dd4bf', // teal-400
      warning: '#fbbf24', // amber-400
      error: '#f87171', // red-400
      info: '#22d3ee', // cyan-400
      accent: '#a78bfa', // violet-400
      accentLight: '#5b21b6', // violet-800
    },
  },
  
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    nameAr: 'أنيق',
    light: {
      primary: '#7c3aed', // violet-600
      primaryHover: '#6d28d9', // violet-700
      primaryLight: '#f5f3ff', // violet-50
      primaryDark: '#5b21b6', // violet-800
      secondary: '#db2777', // pink-600
      secondaryHover: '#be185d', // pink-700
      background: '#ffffff',
      backgroundSecondary: '#faf5ff', // purple-50
      surface: '#ffffff',
      surfaceHover: '#faf5ff', // purple-50
      textPrimary: '#18181b', // zinc-900
      textSecondary: '#52525b', // zinc-600
      textTertiary: '#a1a1aa', // zinc-400
      border: '#e4e4e7', // zinc-200
      borderHover: '#d4d4d8', // zinc-300
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      error: '#dc2626', // red-600
      info: '#7c3aed', // violet-600
      accent: '#ec4899', // pink-500
      accentLight: '#fce7f3', // pink-50
    },
    dark: {
      primary: '#a78bfa', // violet-400
      primaryHover: '#c4b5fd', // violet-300
      primaryLight: '#4c1d95', // violet-900
      primaryDark: '#7c3aed', // violet-600
      secondary: '#f472b6', // pink-400
      secondaryHover: '#f9a8d4', // pink-300
      background: '#18181b', // zinc-900
      backgroundSecondary: '#27272a', // zinc-800
      surface: '#27272a', // zinc-800
      surfaceHover: '#3f3f46', // zinc-700
      textPrimary: '#fafafa', // zinc-50
      textSecondary: '#d4d4d8', // zinc-300
      textTertiary: '#71717a', // zinc-500
      border: '#3f3f46', // zinc-700
      borderHover: '#52525b', // zinc-600
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#f87171', // red-400
      info: '#a78bfa', // violet-400
      accent: '#f472b6', // pink-400
      accentLight: '#831843', // pink-900
    },
  },
  
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    nameAr: 'بسيط',
    light: {
      primary: '#171717', // neutral-900
      primaryHover: '#262626', // neutral-800
      primaryLight: '#fafafa', // neutral-50
      primaryDark: '#0a0a0a', // neutral-950
      secondary: '#525252', // neutral-600
      secondaryHover: '#404040', // neutral-700
      background: '#ffffff',
      backgroundSecondary: '#fafafa', // neutral-50
      surface: '#ffffff',
      surfaceHover: '#f5f5f5', // neutral-100
      textPrimary: '#171717', // neutral-900
      textSecondary: '#525252', // neutral-600
      textTertiary: '#a3a3a3', // neutral-400
      border: '#e5e5e5', // neutral-200
      borderHover: '#d4d4d4', // neutral-300
      success: '#171717', // neutral-900
      warning: '#525252', // neutral-600
      error: '#171717', // neutral-900
      info: '#404040', // neutral-700
      accent: '#171717', // neutral-900
      accentLight: '#f5f5f5', // neutral-100
    },
    dark: {
      primary: '#f5f5f5', // neutral-100
      primaryHover: '#e5e5e5', // neutral-200
      primaryLight: '#262626', // neutral-800
      primaryDark: '#fafafa', // neutral-50
      secondary: '#a3a3a3', // neutral-400
      secondaryHover: '#d4d4d4', // neutral-300
      background: '#0a0a0a', // neutral-950
      backgroundSecondary: '#171717', // neutral-900
      surface: '#171717', // neutral-900
      surfaceHover: '#262626', // neutral-800
      textPrimary: '#fafafa', // neutral-50
      textSecondary: '#d4d4d4', // neutral-300
      textTertiary: '#737373', // neutral-500
      border: '#262626', // neutral-800
      borderHover: '#404040', // neutral-700
      success: '#f5f5f5', // neutral-100
      warning: '#a3a3a3', // neutral-400
      error: '#f5f5f5', // neutral-100
      info: '#d4d4d4', // neutral-300
      accent: '#f5f5f5', // neutral-100
      accentLight: '#404040', // neutral-700
    },
  },
  
  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    nameAr: 'نابض',
    light: {
      primary: '#f97316', // orange-500
      primaryHover: '#ea580c', // orange-600
      primaryLight: '#ffedd5', // orange-100
      primaryDark: '#c2410c', // orange-700
      secondary: '#ec4899', // pink-500
      secondaryHover: '#db2777', // pink-600
      background: '#ffffff',
      backgroundSecondary: '#fef3c7', // amber-100
      surface: '#ffffff',
      surfaceHover: '#fef9c3', // yellow-100
      textPrimary: '#78350f', // amber-900
      textSecondary: '#92400e', // amber-800
      textTertiary: '#fbbf24', // amber-400
      border: '#fde68a', // amber-200
      borderHover: '#fcd34d', // amber-300
      success: '#10b981', // emerald-500
      warning: '#eab308', // yellow-500
      error: '#f43f5e', // rose-500
      info: '#06b6d4', // cyan-500
      accent: '#8b5cf6', // violet-500
      accentLight: '#fae8ff', // fuchsia-50
    },
    dark: {
      primary: '#fb923c', // orange-400
      primaryHover: '#fdba74', // orange-300
      primaryLight: '#7c2d12', // orange-900
      primaryDark: '#f97316', // orange-500
      secondary: '#f472b6', // pink-400
      secondaryHover: '#f9a8d4', // pink-300
      background: '#451a03', // orange-950
      backgroundSecondary: '#7c2d12', // orange-900
      surface: '#7c2d12', // orange-900
      surfaceHover: '#9a3412', // orange-800
      textPrimary: '#ffedd5', // orange-100
      textSecondary: '#fed7aa', // orange-200
      textTertiary: '#c2410c', // orange-700
      border: '#9a3412', // orange-800
      borderHover: '#c2410c', // orange-700
      success: '#34d399', // emerald-400
      warning: '#facc15', // yellow-400
      error: '#fb7185', // rose-400
      info: '#22d3ee', // cyan-400
      accent: '#a78bfa', // violet-400
      accentLight: '#86198f', // fuchsia-800
    },
  },
  
  nature: {
    id: 'nature',
    name: 'Nature',
    nameAr: 'طبيعة',
    light: {
      primary: '#16a34a', // green-600
      primaryHover: '#15803d', // green-700
      primaryLight: '#dcfce7', // green-100
      primaryDark: '#14532d', // green-900
      secondary: '#65a30d', // lime-600
      secondaryHover: '#4d7c0f', // lime-700
      background: '#ffffff',
      backgroundSecondary: '#f7fee7', // lime-50
      surface: '#ffffff',
      surfaceHover: '#ecfccb', // lime-100
      textPrimary: '#14532d', // green-900
      textSecondary: '#166534', // green-800
      textTertiary: '#4ade80', // green-400
      border: '#bbf7d0', // green-200
      borderHover: '#86efac', // green-300
      success: '#16a34a', // green-600
      warning: '#ca8a04', // yellow-600
      error: '#dc2626', // red-600
      info: '#0891b2', // cyan-600
      accent: '#84cc16', // lime-500
      accentLight: '#ecfccb', // lime-100
    },
    dark: {
      primary: '#22c55e', // green-500
      primaryHover: '#4ade80', // green-400
      primaryLight: '#14532d', // green-900
      primaryDark: '#16a34a', // green-600
      secondary: '#84cc16', // lime-500
      secondaryHover: '#a3e635', // lime-400
      background: '#052e16', // green-950
      backgroundSecondary: '#14532d', // green-900
      surface: '#14532d', // green-900
      surfaceHover: '#166534', // green-800
      textPrimary: '#dcfce7', // green-100
      textSecondary: '#bbf7d0', // green-200
      textTertiary: '#15803d', // green-700
      border: '#166534', // green-800
      borderHover: '#15803d', // green-700
      success: '#4ade80', // green-400
      warning: '#facc15', // yellow-400
      error: '#f87171', // red-400
      info: '#22d3ee', // cyan-400
      accent: '#a3e635', // lime-400
      accentLight: '#365314', // lime-900
    },
  },
  
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    nameAr: 'غروب',
    light: {
      primary: '#f43f5e', // rose-500
      primaryHover: '#e11d48', // rose-600
      primaryLight: '#ffe4e6', // rose-100
      primaryDark: '#9f1239', // rose-800
      secondary: '#fb7185', // rose-400
      secondaryHover: '#f43f5e', // rose-500
      background: '#ffffff',
      backgroundSecondary: '#fff1f2', // rose-50
      surface: '#ffffff',
      surfaceHover: '#ffe4e6', // rose-100
      textPrimary: '#881337', // rose-900
      textSecondary: '#9f1239', // rose-800
      textTertiary: '#fda4af', // rose-300
      border: '#fecdd3', // rose-200
      borderHover: '#fda4af', // rose-300
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#dc2626', // red-600
      info: '#ec4899', // pink-500
      accent: '#f472b6', // pink-400
      accentLight: '#fce7f3', // pink-50
    },
    dark: {
      primary: '#fb7185', // rose-400
      primaryHover: '#fda4af', // rose-300
      primaryLight: '#4c0519', // rose-950
      primaryDark: '#f43f5e', // rose-500
      secondary: '#fda4af', // rose-300
      secondaryHover: '#fecdd3', // rose-200
      background: '#4c0519', // rose-950
      backgroundSecondary: '#881337', // rose-900
      surface: '#881337', // rose-900
      surfaceHover: '#9f1239', // rose-800
      textPrimary: '#ffe4e6', // rose-100
      textSecondary: '#fecdd3', // rose-200
      textTertiary: '#be123c', // rose-700
      border: '#9f1239', // rose-800
      borderHover: '#be123c', // rose-700
      success: '#34d399', // emerald-400
      warning: '#fbbf24', // amber-400
      error: '#f87171', // red-400
      info: '#f472b6', // pink-400
      accent: '#f9a8d4', // pink-300
      accentLight: '#831843', // pink-900
    },
  },
  
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    nameAr: 'محيط',
    light: {
      primary: '#0891b2', // cyan-600
      primaryHover: '#0e7490', // cyan-700
      primaryLight: '#cffafe', // cyan-100
      primaryDark: '#164e63', // cyan-900
      secondary: '#14b8a6', // teal-500
      secondaryHover: '#0d9488', // teal-600
      background: '#ffffff',
      backgroundSecondary: '#ecfeff', // cyan-50
      surface: '#ffffff',
      surfaceHover: '#cffafe', // cyan-100
      textPrimary: '#164e63', // cyan-900
      textSecondary: '#155e75', // cyan-800
      textTertiary: '#67e8f9', // cyan-300
      border: '#a5f3fc', // cyan-200
      borderHover: '#67e8f9', // cyan-300
      success: '#14b8a6', // teal-500
      warning: '#f59e0b', // amber-500
      error: '#dc2626', // red-600
      info: '#0891b2', // cyan-600
      accent: '#06b6d4', // cyan-500
      accentLight: '#cffafe', // cyan-100
    },
    dark: {
      primary: '#22d3ee', // cyan-400
      primaryHover: '#67e8f9', // cyan-300
      primaryLight: '#083344', // cyan-950
      primaryDark: '#0891b2', // cyan-600
      secondary: '#2dd4bf', // teal-400
      secondaryHover: '#5eead4', // teal-300
      background: '#083344', // cyan-950
      backgroundSecondary: '#164e63', // cyan-900
      surface: '#164e63', // cyan-900
      surfaceHover: '#155e75', // cyan-800
      textPrimary: '#ecfeff', // cyan-50
      textSecondary: '#cffafe', // cyan-100
      textTertiary: '#0e7490', // cyan-700
      border: '#155e75', // cyan-800
      borderHover: '#0e7490', // cyan-700
      success: '#5eead4', // teal-300
      warning: '#fbbf24', // amber-400
      error: '#f87171', // red-400
      info: '#22d3ee', // cyan-400
      accent: '#06b6d4', // cyan-500
      accentLight: '#134e4a', // teal-900
    },
  },
  
  royal: {
    id: 'royal',
    name: 'Royal',
    nameAr: 'ملكي',
    light: {
      primary: '#6366f1', // indigo-500
      primaryHover: '#4f46e5', // indigo-600
      primaryLight: '#e0e7ff', // indigo-100
      primaryDark: '#312e81', // indigo-900
      secondary: '#8b5cf6', // violet-500
      secondaryHover: '#7c3aed', // violet-600
      background: '#ffffff',
      backgroundSecondary: '#eef2ff', // indigo-50
      surface: '#ffffff',
      surfaceHover: '#e0e7ff', // indigo-100
      textPrimary: '#312e81', // indigo-900
      textSecondary: '#3730a3', // indigo-800
      textTertiary: '#a5b4fc', // indigo-300
      border: '#c7d2fe', // indigo-200
      borderHover: '#a5b4fc', // indigo-300
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#dc2626', // red-600
      info: '#6366f1', // indigo-500
      accent: '#a855f7', // purple-500
      accentLight: '#f3e8ff', // purple-50
    },
    dark: {
      primary: '#818cf8', // indigo-400
      primaryHover: '#a5b4fc', // indigo-300
      primaryLight: '#1e1b4b', // indigo-950
      primaryDark: '#6366f1', // indigo-500
      secondary: '#a78bfa', // violet-400
      secondaryHover: '#c4b5fd', // violet-300
      background: '#1e1b4b', // indigo-950
      backgroundSecondary: '#312e81', // indigo-900
      surface: '#312e81', // indigo-900
      surfaceHover: '#3730a3', // indigo-800
      textPrimary: '#e0e7ff', // indigo-100
      textSecondary: '#c7d2fe', // indigo-200
      textTertiary: '#4f46e5', // indigo-600
      border: '#3730a3', // indigo-800
      borderHover: '#4f46e5', // indigo-600
      success: '#34d399', // emerald-400
      warning: '#fbbf24', // amber-400
      error: '#f87171', // red-400
      info: '#818cf8', // indigo-400
      accent: '#c084fc', // purple-400
      accentLight: '#581c87', // purple-900
    },
  },
  
  warm: {
    id: 'warm',
    name: 'Warm',
    nameAr: 'دافئ',
    light: {
      primary: '#f59e0b', // amber-500
      primaryHover: '#d97706', // amber-600
      primaryLight: '#fef3c7', // amber-100
      primaryDark: '#78350f', // amber-900
      secondary: '#fb923c', // orange-400
      secondaryHover: '#f97316', // orange-500
      background: '#ffffff',
      backgroundSecondary: '#fffbeb', // amber-50
      surface: '#ffffff',
      surfaceHover: '#fef3c7', // amber-100
      textPrimary: '#78350f', // amber-900
      textSecondary: '#92400e', // amber-800
      textTertiary: '#fcd34d', // amber-300
      border: '#fde68a', // amber-200
      borderHover: '#fcd34d', // amber-300
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#dc2626', // red-600
      info: '#0891b2', // cyan-600
      accent: '#ef4444', // red-500
      accentLight: '#fee2e2', // red-100
    },
    dark: {
      primary: '#fbbf24', // amber-400
      primaryHover: '#fcd34d', // amber-300
      primaryLight: '#451a03', // amber-950
      primaryDark: '#f59e0b', // amber-500
      secondary: '#fdba74', // orange-300
      secondaryHover: '#fed7aa', // orange-200
      background: '#451a03', // amber-950
      backgroundSecondary: '#78350f', // amber-900
      surface: '#78350f', // amber-900
      surfaceHover: '#92400e', // amber-800
      textPrimary: '#fef3c7', // amber-100
      textSecondary: '#fde68a', // amber-200
      textTertiary: '#b45309', // amber-700
      border: '#92400e', // amber-800
      borderHover: '#b45309', // amber-700
      success: '#34d399', // emerald-400
      warning: '#fbbf24', // amber-400
      error: '#f87171', // red-400
      info: '#22d3ee', // cyan-400
      accent: '#f87171', // red-400
      accentLight: '#7f1d1d', // red-900
    },
  },
  
  professional: {
    id: 'professional',
    name: 'Professional',
    nameAr: 'احترافي',
    light: {
      primary: '#334155', // slate-700
      primaryHover: '#1e293b', // slate-800
      primaryLight: '#f1f5f9', // slate-100
      primaryDark: '#0f172a', // slate-900
      secondary: '#475569', // slate-600
      secondaryHover: '#334155', // slate-700
      background: '#ffffff',
      backgroundSecondary: '#f8fafc', // slate-50
      surface: '#ffffff',
      surfaceHover: '#f1f5f9', // slate-100
      textPrimary: '#0f172a', // slate-900
      textSecondary: '#475569', // slate-600
      textTertiary: '#94a3b8', // slate-400
      border: '#e2e8f0', // slate-200
      borderHover: '#cbd5e1', // slate-300
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      error: '#dc2626', // red-600
      info: '#0891b2', // cyan-600
      accent: '#1e40af', // blue-800
      accentLight: '#dbeafe', // blue-100
    },
    dark: {
      primary: '#cbd5e1', // slate-300
      primaryHover: '#e2e8f0', // slate-200
      primaryLight: '#020617', // slate-950
      primaryDark: '#f1f5f9', // slate-100
      secondary: '#94a3b8', // slate-400
      secondaryHover: '#cbd5e1', // slate-300
      background: '#020617', // slate-950
      backgroundSecondary: '#0f172a', // slate-900
      surface: '#0f172a', // slate-900
      surfaceHover: '#1e293b', // slate-800
      textPrimary: '#f8fafc', // slate-50
      textSecondary: '#e2e8f0', // slate-200
      textTertiary: '#64748b', // slate-500
      border: '#1e293b', // slate-800
      borderHover: '#334155', // slate-700
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#ef4444', // red-500
      info: '#06b6d4', // cyan-500
      accent: '#3b82f6', // blue-500
      accentLight: '#1e3a8a', // blue-900
    },
  },
  
  bold: {
    id: 'bold',
    name: 'Bold',
    nameAr: 'جريء',
    light: {
      primary: '#dc2626', // red-600
      primaryHover: '#b91c1c', // red-700
      primaryLight: '#fee2e2', // red-100
      primaryDark: '#7f1d1d', // red-900
      secondary: '#ea580c', // orange-600
      secondaryHover: '#c2410c', // orange-700
      background: '#ffffff',
      backgroundSecondary: '#fef2f2', // red-50
      surface: '#ffffff',
      surfaceHover: '#fee2e2', // red-100
      textPrimary: '#7f1d1d', // red-900
      textSecondary: '#991b1b', // red-800
      textTertiary: '#fca5a5', // red-300
      border: '#fecaca', // red-200
      borderHover: '#fca5a5', // red-300
      success: '#16a34a', // green-600
      warning: '#ea580c', // orange-600
      error: '#dc2626', // red-600
      info: '#0891b2', // cyan-600
      accent: '#f59e0b', // amber-500
      accentLight: '#fef3c7', // amber-100
    },
    dark: {
      primary: '#ef4444', // red-500
      primaryHover: '#f87171', // red-400
      primaryLight: '#450a0a', // red-950
      primaryDark: '#dc2626', // red-600
      secondary: '#fb923c', // orange-400
      secondaryHover: '#fdba74', // orange-300
      background: '#450a0a', // red-950
      backgroundSecondary: '#7f1d1d', // red-900
      surface: '#7f1d1d', // red-900
      surfaceHover: '#991b1b', // red-800
      textPrimary: '#fee2e2', // red-100
      textSecondary: '#fecaca', // red-200
      textTertiary: '#b91c1c', // red-700
      border: '#991b1b', // red-800
      borderHover: '#b91c1c', // red-700
      success: '#22c55e', // green-500
      warning: '#f97316', // orange-500
      error: '#ef4444', // red-500
      info: '#06b6d4', // cyan-500
      accent: '#fbbf24', // amber-400
      accentLight: '#78350f', // amber-900
    },
  },
  
  fresh: {
    id: 'fresh',
    name: 'Fresh',
    nameAr: 'منعش',
    light: {
      primary: '#84cc16', // lime-500
      primaryHover: '#65a30d', // lime-600
      primaryLight: '#ecfccb', // lime-100
      primaryDark: '#3f6212', // lime-800
      secondary: '#22c55e', // green-500
      secondaryHover: '#16a34a', // green-600
      background: '#ffffff',
      backgroundSecondary: '#f7fee7', // lime-50
      surface: '#ffffff',
      surfaceHover: '#ecfccb', // lime-100
      textPrimary: '#365314', // lime-900
      textSecondary: '#3f6212', // lime-800
      textTertiary: '#bef264', // lime-300
      border: '#d9f99d', // lime-200
      borderHover: '#bef264', // lime-300
      success: '#22c55e', // green-500
      warning: '#eab308', // yellow-500
      error: '#dc2626', // red-600
      info: '#14b8a6', // teal-500
      accent: '#10b981', // emerald-500
      accentLight: '#d1fae5', // emerald-100
    },
    dark: {
      primary: '#a3e635', // lime-400
      primaryHover: '#bef264', // lime-300
      primaryLight: '#1a2e05', // lime-950
      primaryDark: '#84cc16', // lime-500
      secondary: '#4ade80', // green-400
      secondaryHover: '#86efac', // green-300
      background: '#1a2e05', // lime-950
      backgroundSecondary: '#365314', // lime-900
      surface: '#365314', // lime-900
      surfaceHover: '#3f6212', // lime-800
      textPrimary: '#ecfccb', // lime-100
      textSecondary: '#d9f99d', // lime-200
      textTertiary: '#4d7c0f', // lime-700
      border: '#3f6212', // lime-800
      borderHover: '#4d7c0f', // lime-700
      success: '#4ade80', // green-400
      warning: '#facc15', // yellow-400
      error: '#f87171', // red-400
      info: '#2dd4bf', // teal-400
      accent: '#34d399', // emerald-400
      accentLight: '#064e3b', // emerald-900
    },
  },
  
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic',
    nameAr: 'كوني',
    light: {
      primary: '#581c87', // purple-900
      primaryHover: '#6b21a8', // purple-800
      primaryLight: '#f3e8ff', // purple-50
      primaryDark: '#3b0764', // purple-950
      secondary: '#4c1d95', // violet-900
      secondaryHover: '#5b21b6', // violet-800
      background: '#ffffff',
      backgroundSecondary: '#faf5ff', // purple-50
      surface: '#ffffff',
      surfaceHover: '#f3e8ff', // purple-100
      textPrimary: '#3b0764', // purple-950
      textSecondary: '#581c87', // purple-900
      textTertiary: '#c084fc', // purple-400
      border: '#e9d5ff', // purple-200
      borderHover: '#d8b4fe', // purple-300
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      error: '#dc2626', // red-600
      info: '#7c3aed', // violet-600
      accent: '#a855f7', // purple-500
      accentLight: '#f3e8ff', // purple-100
    },
    dark: {
      primary: '#c084fc', // purple-400
      primaryHover: '#d8b4fe', // purple-300
      primaryLight: '#1e1b4b', // indigo-950
      primaryDark: '#a855f7', // purple-500
      secondary: '#a78bfa', // violet-400
      secondaryHover: '#c4b5fd', // violet-300
      background: '#1e1b4b', // indigo-950
      backgroundSecondary: '#3b0764', // purple-950
      surface: '#3b0764', // purple-950
      surfaceHover: '#581c87', // purple-900
      textPrimary: '#f3e8ff', // purple-100
      textSecondary: '#e9d5ff', // purple-200
      textTertiary: '#7e22ce', // purple-700
      border: '#581c87', // purple-900
      borderHover: '#6b21a8', // purple-800
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#ef4444', // red-500
      info: '#8b5cf6', // violet-500
      accent: '#a855f7', // purple-500
      accentLight: '#4c1d95', // violet-900
    },
  },
  
  classic: {
    id: 'classic',
    name: 'Classic',
    nameAr: 'كلاسيكي',
    light: {
      primary: '#92400e', // amber-800
      primaryHover: '#78350f', // amber-900
      primaryLight: '#fef3c7', // amber-100
      primaryDark: '#451a03', // amber-950
      secondary: '#a16207', // yellow-700
      secondaryHover: '#854d0e', // yellow-800
      background: '#ffffff',
      backgroundSecondary: '#fefce8', // yellow-50
      surface: '#ffffff',
      surfaceHover: '#fef9c3', // yellow-100
      textPrimary: '#451a03', // amber-950
      textSecondary: '#78350f', // amber-900
      textTertiary: '#fbbf24', // amber-400
      border: '#fde68a', // amber-200
      borderHover: '#fcd34d', // amber-300
      success: '#15803d', // green-700
      warning: '#ca8a04', // yellow-600
      error: '#b91c1c', // red-700
      info: '#0e7490', // cyan-700
      accent: '#b45309', // amber-700
      accentLight: '#fed7aa', // orange-200
    },
    dark: {
      primary: '#fbbf24', // amber-400
      primaryHover: '#fcd34d', // amber-300
      primaryLight: '#422006', // orange-950
      primaryDark: '#f59e0b', // amber-500
      secondary: '#fcd34d', // amber-300
      secondaryHover: '#fde68a', // amber-200
      background: '#422006', // orange-950
      backgroundSecondary: '#451a03', // amber-950
      surface: '#451a03', // amber-950
      surfaceHover: '#78350f', // amber-900
      textPrimary: '#fef3c7', // amber-100
      textSecondary: '#fde68a', // amber-200
      textTertiary: '#b45309', // amber-700
      border: '#78350f', // amber-900
      borderHover: '#92400e', // amber-800
      success: '#22c55e', // green-500
      warning: '#facc15', // yellow-400
      error: '#f87171', // red-400
      info: '#22d3ee', // cyan-400
      accent: '#fdba74', // orange-300
      accentLight: '#7c2d12', // orange-900
    },
  },
};

// Color Palettes from ColorHunt.co
const COLOR_PALETTES: Record<string, { colors: string[]; name: string; nameAr: string }> = {
  'palette-1': { colors: ['#222831', '#393E46', '#00ADB5', '#EEEEEE'], name: 'Dark & Teal', nameAr: 'داكن وأزرق مخضر' },
  'palette-2': { colors: ['#CBF1F5', '#A6E3E9', '#71C9CE', '#0AA1DD'], name: 'Ocean Breeze', nameAr: 'نسيم المحيط' },
  'palette-3': { colors: ['#E8E2E2', '#C2BBF0', '#8FB8ED', '#62CDFF'], name: 'Navy & Violet', nameAr: 'أزرق غامق وبنفسجي' },
  'palette-4': { colors: ['#FFEAA7', '#FDCB6E', '#FD79A8', '#6C5CE7'], name: 'Warm Sunset', nameAr: 'غروب دافئ' },
  'palette-5': { colors: ['#F8EDE3', '#DFD3C3', '#D0B8A8', '#8D7B68'], name: 'Mint Fresh', nameAr: 'نعناع منعش' },
  'palette-6': { colors: ['#D8B5FF', '#EFC3E6', '#F0C1E1', '#FDDBBB'], name: 'Purple Dream', nameAr: 'حلم بنفسجي' },
  'palette-7': { colors: ['#222831', '#31363F', '#76ABAE', '#EEEEEE'], name: 'Forest Green', nameAr: 'أخضر الغابة' },
  'palette-8': { colors: ['#FFE6E6', '#F9D5D3', '#E68369', '#FFFFFF'], name: 'Coral Reef', nameAr: 'شعاب المرجان' },
  'palette-9': { colors: ['#04364A', '#176B87', '#64CCC5', '#DAFFFB'], name: 'Royal Blue', nameAr: 'أزرق ملكي' },
  'palette-10': { colors: ['#FFFBF5', '#F7EFE5', '#C3ACD0', '#7743DB'], name: 'Sunny Day', nameAr: 'يوم مشمس' },
  'palette-11': { colors: ['#FFE6F7', '#F5C6EC', '#C8A1E0', '#674188'], name: 'Cotton Candy', nameAr: 'حلوى قطنية' },
  'palette-12': { colors: ['#FFF8E8', '#FFD1E3', '#FF90BC', '#C63D2F'], name: 'Vintage Rose', nameAr: 'وردة عتيقة' },
  'palette-13': { colors: ['#FFF6E9', '#FFE6C7', '#F7DCB9', '#D5B895'], name: 'Peachy Keen', nameAr: 'دراقي لطيف' },
  'palette-14': { colors: ['#BBDEFA', '#96C7F2', '#6FA3EC', '#4A7BB7'], name: 'Sky Blue', nameAr: 'أزرق سماوي' },
  'palette-15': { colors: ['#EEE4E1', '#E7D4E8', '#D4B2D8', '#AF9BB6'], name: 'Lavender Fields', nameAr: 'حقول خزامى' },
  'palette-16': { colors: ['#F2D8D8', '#BFD8D5', '#A7C4BC', '#87A8A4'], name: 'Minty Green', nameAr: 'أخضر نعناعي' },
  'palette-17': { colors: ['#FFF2F2', '#FFE5F1', '#E8A0BF', '#BA90C6'], name: 'Sunset Glow', nameAr: 'توهج الغروب' },
  'palette-18': { colors: ['#0B2447', '#19376D', '#576CBC', '#A5D7E8'], name: 'Deep Ocean', nameAr: 'محيط عميق' },
  'palette-19': { colors: ['#EAD196', '#C4A77D', '#70483C', '#454545'], name: 'Earthy Tones', nameAr: 'ألوان ترابية' },
  'palette-20': { colors: ['#FFF9F9', '#FFE6E6', '#FFAAAA', '#EE6F6F'], name: 'Blush Pink', nameAr: 'وردي خجول' },
  'palette-21': { colors: ['#1E3A5F', '#4A90E2', '#E4E9F2', '#FFFFFF'], name: 'Clean Blue', nameAr: 'أزرق نظيف' },
  'palette-22': { colors: ['#1B5E20', '#28A745', '#D4EDDA', '#FFFFFF'], name: 'Fresh Green', nameAr: 'أخضر منعش' },
  'palette-23': { colors: ['#4C1D95', '#7C3AED', '#E9E4F7', '#FFFFFF'], name: 'Soft Purple', nameAr: 'بنفسجي ناعم' },
  'palette-24': { colors: ['#B54708', '#FF8C42', '#FFE8CC', '#FFFFFF'], name: 'Warm Orange', nameAr: 'برتقالي دافئ' },
  'palette-25': { colors: ['#343A40', '#6C757D', '#E9ECEF', '#FFFFFF'], name: 'Cool Gray', nameAr: 'رمادي بارد' },
  'palette-26': { colors: ['#006064', '#00BCD4', '#CCFBFF', '#FFFFFF'], name: 'Bright Cyan', nameAr: 'سيان ساطع' },
  'palette-27': { colors: ['#3F6212', '#84CC16', '#E8FFB7', '#FFFFFF'], name: 'Lime Fresh', nameAr: 'ليموني منعش' },
  'palette-28': { colors: ['#880E4F', '#E91E63', '#FFD6E0', '#FFFFFF'], name: 'Rose Quartz', nameAr: 'كوارتز وردي' },
  'palette-29': { colors: ['#1A237E', '#3F51B5', '#E0E3F5', '#FFFFFF'], name: 'Indigo Wave', nameAr: 'موجة نيلية' },
  'palette-30': { colors: ['#B45309', '#FFC107', '#FFF3CD', '#FFFFFF'], name: 'Amber Glow', nameAr: 'توهج كهرماني' },
};

// Helper function to determine if a color is light or dark
function isLightColor(hex: string): boolean {
  const rgb = parseInt(hex.replace('#', ''), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma > 128;
}

// Helper function to darken a color
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1).toUpperCase();
}

// Helper function to lighten a color
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1).toUpperCase();
}

// Convert a 4-color palette to a full theme
function paletteToTheme(paletteId: string, palette: { colors: string[]; name: string; nameAr: string }): Theme {
  const [color1, color2, color3, color4] = palette.colors;
  // color1 = dark (text), color2 = bright accent (buttons), color3 = light tint, color4 = white background
  
  return {
    id: paletteId,
    name: palette.name,
    nameAr: palette.nameAr,
    light: {
      primary: color2,                    // Bright accent for buttons
      primaryHover: darkenColor(color2, 10),
      primaryLight: lightenColor(color2, 40),
      primaryDark: darkenColor(color2, 20),
      secondary: color1,                  // Dark color for secondary elements
      secondaryHover: darkenColor(color1, 10),
      background: color4,                 // White background
      backgroundSecondary: color3,        // Light tint for subtle backgrounds
      surface: '#ffffff',
      surfaceHover: color3,
      textPrimary: color1,                // Dark text
      textSecondary: lightenColor(color1, 20),
      textTertiary: lightenColor(color1, 40),
      border: color3,
      borderHover: darkenColor(color3, 10),
      success: '#16a34a',
      warning: '#ea580c',
      error: '#dc2626',
      info: color2,
      accent: color2,                     // Bright accent
      accentLight: lightenColor(color2, 40),
    },
    dark: {
      primary: color2,                    // Bright accent for buttons
      primaryHover: lightenColor(color2, 15),
      primaryLight: darkenColor(color2, 30),
      primaryDark: color2,
      secondary: lightenColor(color1, 20),
      secondaryHover: lightenColor(color1, 30),
      background: color1,                 // Dark background
      backgroundSecondary: lightenColor(color1, 5),
      surface: lightenColor(color1, 8),
      surfaceHover: lightenColor(color1, 12),
      textPrimary: color4,                // White text on dark
      textSecondary: lightenColor(color4, -20),
      textTertiary: lightenColor(color3, -20),
      border: lightenColor(color1, 15),
      borderHover: lightenColor(color1, 20),
      success: '#22c55e',
      warning: '#f97316',
      error: '#ef4444',
      info: lightenColor(color2, 15),
      accent: color2,                     // Bright accent
      accentLight: darkenColor(color2, 20),
    },
  };
}

export function getTheme(themeId: string): Theme {
  // Check if it's a color palette
  if (themeId.startsWith('palette-') && COLOR_PALETTES[themeId]) {
    return paletteToTheme(themeId, COLOR_PALETTES[themeId]);
  }
  
  // Fall back to built-in themes or default
  return themes[themeId] || themes.default;
}
