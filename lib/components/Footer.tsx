'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import Image from 'next/image';

interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
  icon_path: string;
  display_order: number;
}

export default function Footer() {
  const { t, direction } = useTranslation();
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSocialLinks() {
      try {
        const response = await fetch('/api/social-media');
        if (response.ok) {
          const data = await response.json();
          setSocialLinks(data);
        }
      } catch (error) {
        console.error('Error fetching social media links:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSocialLinks();
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
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
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

          {/* Social Media Links */}
          {!loading && socialLinks.length > 0 && (
            <div className="flex flex-col items-center gap-3">
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
                    className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300"
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
