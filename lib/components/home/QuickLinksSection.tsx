'use client';

import { useEffect, useState, useRef } from 'react';
import QuickLinkCard from '@/lib/components/ui/QuickLinkCard';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function QuickLinksSection() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={sectionRef}
      className={`container mx-auto max-w-7xl py-16 px-4 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
          {t('home.welcomeTitle')}
        </h2>
        <p className="text-gray-600 dark:text-zinc-400 mt-2">
          {t('home.welcomeSubtitle')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          className={`transition-all duration-700 h-full ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <QuickLinkCard
            title={t('home.dashboardTitle')}
            description={t('home.dashboardDescription')}
            href="/dashboard"
            icon={
              <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
            }
          />
        </div>
        <div 
          className={`transition-all duration-700 h-full ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <QuickLinkCard
            title={t('home.searchClientsTitle')}
            description={t('home.searchClientsDescription')}
            href="/clients"
            icon={
              <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}
