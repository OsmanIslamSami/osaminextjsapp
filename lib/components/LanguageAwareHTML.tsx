'use client';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ReactNode } from 'react';

export function LanguageAwareHTML({ 
  children, 
  className 
}: { 
  children: ReactNode;
  className?: string;
}) {
  const { language, direction } = useLanguage();
  
  // Apply appropriate font based on language
  const fontClass = language === 'ar' ? 'font-cairo' : 'font-inter';
  
  return (
    <html lang={language} dir={direction} className={`${fontClass} ${className || ''}`}>
      {children}
    </html>
  );
}
