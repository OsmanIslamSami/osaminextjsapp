'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAppSettings } from '@/lib/contexts/AppSettingsContext';

// Font mapping to Google Fonts URLs
const FONT_URLS: Record<string, string> = {
  // Arabic fonts
  'Cairo': 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap',
  'Amiri': 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
  'Tajawal': 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap',
  'Rubik': 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap',
  'Almarai': 'https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&display=swap',
  
  // English fonts
  'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap',
  'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
  'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
};

export function FontApplier() {
  const { language } = useLanguage();
  const { settings, loading } = useAppSettings();

  useEffect(() => {
    if (loading || !settings) return;

    const selectedFont = language === 'ar' ? settings.arabic_font : settings.english_font;
    const fontUrl = FONT_URLS[selectedFont];

    // Load the font if not already loaded
    if (fontUrl) {
      const linkId = `font-${selectedFont.replace(/\s+/g, '-')}`;
      
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    }

    // Apply the font to the body
    document.body.style.fontFamily = `"${selectedFont}", system-ui, -apple-system, sans-serif`;
    
    // Also update CSS variable for consistency
    document.documentElement.style.setProperty('--font-active', `"${selectedFont}"`);
    
  }, [language, settings, loading]);

  return null;
}
