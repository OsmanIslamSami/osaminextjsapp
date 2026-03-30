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
  { path: '/admin/home-sections', labelKey: 'admin.tabs.homeSections' },
  { path: '/admin/users', labelKey: 'admin.tabs.users' },
  { path: '/admin/social', labelKey: 'admin.tabs.social' },
  { path: '/admin/style-library', labelKey: 'admin.tabs.styleLibrary' },
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
          className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-medium min-h-[48px]"
        >
          {adminTabs.map((tab) => (
            <option key={tab.path} value={tab.path}>
              {t(tab.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tabs Navigation */}
      <div className="hidden md:block border-b border-gray-200 dark:border-zinc-800 mb-8" dir={direction}>
        <nav className="flex flex-wrap gap-2">
          {adminTabs.map((tab) => (
            <Link
              key={tab.path}
              href={tab.path}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                pathname === tab.path
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                  : 'border-transparent text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:border-gray-300 dark:hover:border-zinc-700'
              }`}
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
