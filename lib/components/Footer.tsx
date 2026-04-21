'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useAppSettings } from '@/lib/contexts/AppSettingsContext';
import { logger } from '@/lib/utils/logger';

interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
  icon_path: string;
  display_order: number;
}

interface FooterNavItem {
  id: string;
  label_en: string;
  label_ar: string;
  url: string;
  type: string;
  target: string;
  items?: FooterNavItem[];
}

export default function Footer() {
  const { t, direction, language } = useTranslation();
  const { settings } = useAppSettings();
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [footerNav, setFooterNav] = useState<FooterNavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [socialRes, navRes] = await Promise.all([
          fetch('/api/social-media'),
          fetch('/api/navigation?location=footer'),
        ]);
        if (socialRes.ok) {
          const data = await socialRes.json();
          setSocialLinks(data);
        }
        if (navRes.ok) {
          const { data } = await navRes.json();
          setFooterNav(data || []);
        }
      } catch (error) {
        logger.error('Error fetching footer data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Intersection Observer for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const footerElement = document.querySelector('footer');
    if (footerElement) {
      observer.observe(footerElement);
    }

    return () => observer.disconnect();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-full py-8 px-4 relative overflow-hidden" 
      dir={direction}
      style={{
        background: 'linear-gradient(to top, var(--color-primary-dark), var(--color-primary))',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {/* Gradient Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Footer Content */}
        <div className={`transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Grid Layout: 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Column 1 & 2: Footer Navigation Sections */}
            {footerNav.length > 0 && (
              <>
                {footerNav.map((section) => {
                  // Section headers with child links
                  if (section.type === 'section-header' && section.items && section.items.length > 0) {
                    return (
                      <div key={section.id} className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                        <h4 className="text-base md:text-lg font-semibold uppercase tracking-wider mb-3 pb-2" style={{ color: 'white', borderBottom: '2px solid white' }}>
                          {language === 'ar' ? section.label_ar : section.label_en}
                        </h4>
                        <ul className="space-y-2">
                          {section.items.map((link) => (
                            <li key={link.id}>
                              <Link
                                href={link.url}
                                target={link.target}
                                className="text-base md:text-lg transition-colors hover:underline"
                                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'; }}
                              >
                                {language === 'ar' ? link.label_ar : link.label_en}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  // Standalone footer links (no parent)
                  if (section.type === 'link') {
                    return (
                      <div key={section.id} className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                        <Link
                          href={section.url}
                          target={section.target}
                          className="text-base md:text-lg transition-colors hover:underline"
                          style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'; }}
                        >
                          {language === 'ar' ? section.label_ar : section.label_en}
                        </Link>
                      </div>
                    );
                  }

                  return null;
                })}
              </>
            )}

            {/* Column 3: Contact Us + Social Media */}
            <div className="flex flex-col gap-8">
              {/* Contact Us */}
              <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                <p className="text-base md:text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  {t('footer.contact')}
                </p>
                <p className="text-base md:text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }} dir="ltr">
                  {t('footer.email')}
                </p>
              </div>

              {/* Social Media Links */}
              {!loading && socialLinks.length > 0 && (
                <div className="flex flex-col gap-3 animate-fade-in-up animate-delay-200">
                  <h4 className={`text-base md:text-lg font-semibold w-full ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ color: 'white' }}>
                    {t('footer.followUs')}
                  </h4>
                  <div className={`flex items-center gap-4 ${direction === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                    {socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-all duration-300 hover-lift button-press"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        aria-label={link.platform}
                      >
                        <img
                          src={link.icon_path}
                          alt={link.platform}
                          className="w-6 h-6 md:w-7 md:h-7 object-contain"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <p className={`text-sm ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            © {currentYear} {t('footer.appName')}. {t('footer.rights')}.
          </p>
        </div>

        {/* Verification Badges */}
        {(settings?.verify_html_url || settings?.verify_css_url || settings?.verify_taw_url) && (
          <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
            {settings.verify_html_url && (
              <a
                href={settings.verify_html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; }}
                aria-label={language === 'ar' ? 'التحقق من HTML' : 'HTML Validation'}
                title={language === 'ar' ? 'التحقق من HTML' : 'HTML Validation'}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4L5.5 18.5L12 21L18.5 18.5L20 4H4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 8H16L15.5 13H9L8.5 16L12 17L15.5 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>HTML</span>
              </a>
            )}
            {settings.verify_css_url && (
              <a
                href={settings.verify_css_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; }}
                aria-label={language === 'ar' ? 'التحقق من CSS' : 'CSS Validation'}
                title={language === 'ar' ? 'التحقق من CSS' : 'CSS Validation'}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4L5.5 18.5L12 21L18.5 18.5L20 4H4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 8H16L15 13H9.5L9 16L12 17L15 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>CSS</span>
              </a>
            )}
            {settings.verify_taw_url && (
              <a
                href={settings.verify_taw_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; }}
                aria-label={language === 'ar' ? 'التحقق من إمكانية الوصول - TAW' : 'TAW Accessibility Validation'}
                title={language === 'ar' ? 'التحقق من إمكانية الوصول - TAW' : 'TAW Accessibility Validation'}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5"/>
                  <path d="M12 7V7.5M9 10H15M10.5 10V16M13.5 10V16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>TAW</span>
              </a>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
