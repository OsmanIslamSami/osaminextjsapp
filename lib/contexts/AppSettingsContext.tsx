'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logger } from '@/lib/utils/logger';

interface AppSettings {
  id: string;
  arabic_font: string;
  english_font: string;
  theme: string;
  custom_color_1?: string | null;
  custom_color_2?: string | null;
  custom_color_3?: string | null;
  custom_color_4?: string | null;
  custom_color_5?: string | null;
  site_logo_url?: string | null;
  site_favicon_url?: string | null;
  site_title_en?: string | null;
  site_title_ar?: string | null;
  verify_html_url?: string | null;
  verify_css_url?: string | null;
  verify_taw_url?: string | null;
}

interface AppSettingsContextValue {
  settings: AppSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/app-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      }
    } catch (error) {
      logger.error('Failed to load app settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <AppSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
}
