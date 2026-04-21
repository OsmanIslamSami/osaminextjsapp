'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logger } from '@/lib/utils/logger';

export type Language = 'en' | 'ar';

export interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  // Load translations on mount and language change
  useEffect(() => {
    import(`./translations/${language}.json`)
      .then(module => setTranslations(module.default))
      .catch(err => logger.error('Failed to load translations:', err));
  }, [language]);

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_language') as Language;
      if (saved === 'en' || saved === 'ar') {
        setLanguageState(saved);
        document.cookie = `app_language=${saved};path=/;max-age=31536000;SameSite=Lax`;
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', lang);
      document.cookie = `app_language=${lang};path=/;max-age=31536000;SameSite=Lax`;
    }
  };

  // Translation function with nested key support and parameter substitution
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: unknown = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Fallback to key if translation not found
      }
    }
    
    let result = typeof value === 'string' ? value : key;
    
    // Replace parameters in the format {paramName}
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }
    
    return result;
  };

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, direction }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
