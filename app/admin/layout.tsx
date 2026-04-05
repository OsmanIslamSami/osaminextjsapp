'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const adminTabs = [
  { path: '/admin', labelKey: 'admin.tabs.overview' },
  { path: '/admin/news', labelKey: 'admin.tabs.news' },
  { path: '/admin/slider', labelKey: 'admin.tabs.slider' },
  { path: '/admin/photos', labelKey: 'admin.tabs.photos' },
  { path: '/admin/videos', labelKey: 'admin.tabs.videos' },
  { path: '/admin/partners', labelKey: 'admin.tabs.partners' },
  { path: '/admin/users', labelKey: 'admin.tabs.users' },
  { path: '/admin/social', labelKey: 'admin.tabs.social' },
  { path: '/admin/style-library', labelKey: 'admin.tabs.styleLibrary' },
  { path: '/admin/app-settings', labelKey: 'admin.tabs.appSettings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const { t, direction } = useLanguage();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAdmin) {
        router.push('/dashboard');
      } else {
        setChecked(true);
      }
    }
  }, [isAdmin, isLoading, router]);

  const currentTab = adminTabs.find(tab => tab.path === pathname) || adminTabs[0];

  const handleMobileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(e.target.value);
  };

  if (isLoading || !checked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-zinc-100"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8" dir={direction}>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
          {t('admin.title')}
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-zinc-400">
          {t('admin.subtitle')}
        </p>
      </div>

      {/* Mobile Dropdown Navigation */}
      <div className="md:hidden mb-6">
        <select
          value={pathname}
          onChange={handleMobileSelect}
          className="w-full px-5 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-medium min-h-[48px] focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all"
        >
          {adminTabs.map((tab) => (
            <option key={tab.path} value={tab.path}>
              {t(tab.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tabs Navigation */}
      <div className="hidden md:block mb-8" dir={direction} style={{ borderBottom: '1px solid var(--color-border)' }}>
        <nav className="flex flex-wrap gap-2">
          {adminTabs.map((tab) => (
            <Link
              key={tab.path}
              href={tab.path}
              className="px-4 py-3 transition-colors whitespace-nowrap"
              style={{
                borderBottom: pathname === tab.path ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: pathname === tab.path ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: pathname === tab.path ? '500' : '400',
              }}
              onMouseEnter={(e) => {
                if (pathname !== tab.path) {
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                  e.currentTarget.style.borderBottomColor = 'var(--color-border-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== tab.path) {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }
              }}
            >
              {t(tab.labelKey)}
            </Link>
          ))}
        </nav>
      </div>

      {children}
    </div>
  );
}
