/**
 * RTL Direction Detection Hook
 * Detects if the current language requires right-to-left layout
 */

'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

/**
 * Hook to detect RTL direction based on current language
 * Returns true for Arabic ('ar'), false for English ('en')
 */
export function useRTLDirection(): boolean {
  const { language } = useLanguage();
  return language === 'ar';
}

/**
 * Hook to get the appropriate direction attribute value
 * Returns 'rtl' for Arabic, 'ltr' for English
 */
export function useDirection(): 'ltr' | 'rtl' {
  const isRTL = useRTLDirection();
  return isRTL ? 'rtl' : 'ltr';
}

/**
 * Hook to get RTL-aware positioning classes
 * Useful for absolute positioning that needs to swap sides in RTL
 */
export function useRTLPosition() {
  const isRTL = useRTLDirection();
  
  return {
    isRTL,
    left: isRTL ? 'right' : 'left',
    right: isRTL ? 'left' : 'right',
    leftClass: isRTL ? 'right-0' : 'left-0',
    rightClass: isRTL ? 'left-0' : 'right-0',
    leftPadding: isRTL ? 'pr' : 'pl',
    rightPadding: isRTL ? 'pl' : 'pr',
    leftMargin: isRTL ? 'mr' : 'ml',
    rightMargin: isRTL ? 'ml' : 'mr',
  };
}
