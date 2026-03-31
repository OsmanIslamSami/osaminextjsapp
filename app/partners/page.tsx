/**
 * Partners Directory Page
 * 
 * Displays all partner organizations in a card grid layout
 * Each card shows logo, name, and clickable website link
 * 
 * Features:
 * - Responsive grid layout (1/2/3/4 columns)
 * - Clickable partner cards
 * - External links open in new tabs
 * - Loading and empty states
 * - RTL support
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowTopRightOnSquareIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRTLDirection } from '@/lib/hooks/useRTLDirection';

interface PartnerItem {
  id: string;
  title_en: string;
  title_ar: string;
  url?: string | null;
  image_url: string;
}

/**
 * Partners Directory Page Component
 * 
 * Public-facing page displaying all visible partners.
 * Partners are shown in a grid with their logos and names.
 * Clicking a partner opens their website (if provided).
 */
export default function PartnersDirectoryPage() {
  const { language } = useLanguage();
  const isRTL = useRTLDirection();
  
  // Component state
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Page title in current language
  const title = language === 'ar' ? 'شركاؤنا' : 'Our Partners';

  /**
   * Fetch all visible partners from API
   */
  useEffect(() => {
    async function fetchPartners() {
      setLoading(true);
      try {
        const response = await fetch('/api/partners?context=gallery');
        const data = await response.json();
        
        if (data.success) {
          setPartners(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPartners();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{title}</h1>

        {/* Empty State */}
        {partners.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <BuildingOfficeIcon className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">
              {language === 'ar' ? 'لا يوجد شركاء متاحون' : 'No partners available'}
            </p>
          </div>
        ) : (
          <>
            {/* Partners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {partners.map((partner) => {
                const partnerName = language === 'ar' ? partner.title_ar : partner.title_en;
                
                /**
                 * Partner Card Component
                 * Displays logo, name, and optional website link
                 */
                const CardContent = (
                  <>
                    {/* Partner Logo */}
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-white p-6 shadow-md group-hover:shadow-xl transition-shadow duration-300">
                      <Image
                        src={partner.image_url}
                        alt={partnerName}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>

                    {/* Partner Info */}
                    <div className="mt-4">
                      <h3 
                        className="font-bold text-center mb-2 group-hover:transition-colors"
                        style={{ color: 'var(--color-text-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-primary)';
                        }}
                      >
                        {partnerName}
                      </h3>
                      
                      {/* Website Link Badge (if URL provided) */}
                      {partner.url && (
                        <div className="flex items-center justify-center gap-1 text-sm" style={{ color: 'var(--color-primary)' }}>
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          <span>{language === 'ar' ? 'زيارة الموقع' : 'Visit Website'}</span>
                        </div>
                      )}
                    </div>
                  </>
                );

                // If partner has URL, make entire card clickable
                if (partner.url) {
                  return (
                    <a
                      key={partner.id}
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group cursor-pointer"
                    >
                      {CardContent}
                    </a>
                  );
                }

                // Otherwise, render non-clickable card
                return (
                  <div key={partner.id} className="group">
                    {CardContent}
                  </div>
                );
              })}
            </div>

            {/* Total Count */}
            <div className="mt-12 text-center text-gray-600">
              <p>
                {language === 'ar' 
                  ? `إجمالي الشركاء: ${partners.length}` 
                  : `Total Partners: ${partners.length}`}
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
