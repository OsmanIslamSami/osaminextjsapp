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
    <footer className="w-full bg-gray-50 dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 py-8 px-4 md:px-8" dir={direction}>
      <div className="max-w-7xl mx-auto">
        {/* Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand/Info */}
          <div className={`text-center ${direction === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">
              {t('footer.appName')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              {t('footer.contact')}
            </p>
            <p className="text-sm text-gray-600 dark:text-zinc-400" dir="ltr">
              {t('footer.email')}
            </p>
          </div>

          {/* Social Media Links */}
          {!loading && socialLinks.length > 0 && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                {t('footer.followUs')}
              </p>
              <div className="flex items-center gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
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
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800 text-center">
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            © {currentYear} {t('footer.appName')}. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
