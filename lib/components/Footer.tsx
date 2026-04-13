'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';

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
        console.error('Error fetching footer data:', error);
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
      className="w-full py-8 px-4 md:px-8 relative overflow-hidden" 
      dir={direction}
      style={{
        background: 'linear-gradient(to top, var(--color-primary-dark), var(--color-primary))',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {/* Gradient Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Footer Content */}
        <div className={`flex flex-col md:flex-row justify-between items-start gap-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Brand/Info */}
          <div className={`text-center ${direction === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>
              {t('footer.appName')}
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {t('footer.contact')}
            </p>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }} dir="ltr">
              {t('footer.email')}
            </p>
          </div>

          {/* Dynamic Footer Navigation Sections */}
          {footerNav.length > 0 && (
            <div className="flex flex-wrap gap-8 md:gap-12">
              {footerNav.map((section) => {
                // Section headers with child links
                if (section.type === 'section-header' && section.items && section.items.length > 0) {
                  return (
                    <div key={section.id} className={`text-center ${direction === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
                      <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'white' }}>
                        {language === 'ar' ? section.label_ar : section.label_en}
                      </h4>
                      <ul className="space-y-2">
                        {section.items.map((link) => (
                          <li key={link.id}>
                            <Link
                              href={link.url}
                              target={link.target}
                              className="text-sm transition-colors hover:underline"
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
                    <div key={section.id} className={`text-center ${direction === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
                      <Link
                        href={section.url}
                        target={section.target}
                        className="text-sm transition-colors hover:underline"
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
            </div>
          )}

          {/* Social Media Links */}
          {!loading && socialLinks.length > 0 && (
            <div className="flex flex-col items-center gap-3 animate-fade-in-up animate-delay-200">
              <p className="text-sm font-medium" style={{ color: 'white' }}>
                {t('footer.followUs')}
              </p>
              <div className="flex items-center gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover-lift button-press"
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
                      className="w-5 h-5 object-contain"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <p className="text-sm text-center" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            © {currentYear} {t('footer.appName')}. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
