'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XMarkIcon, ChartBarIcon, UsersIcon, Cog6ToothIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { UserButton } from '@clerk/nextjs';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

interface NavItem {
  id: string;
  label_en: string;
  label_ar: string;
  url: string;
  type: string;
  items?: NavItem[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { t, direction, language } = useTranslation();
  const { isAdmin } = useCurrentUser();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Fetch header navigation for mobile
  useEffect(() => {
    async function fetchNav() {
      try {
        const res = await fetch('/api/navigation?location=header');
        if (res.ok) {
          const { data } = await res.json();
          setNavItems(data || []);
        }
      } catch {
        // Silent fail for mobile nav
      }
    }
    fetchNav();
  }, []);
  
  // Close menu when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[100] mobile-menu-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className={direction === 'rtl' 
        ? 'fixed top-0 left-0 h-full w-64 bg-white dark:bg-zinc-950 shadow-lg z-[110] mobile-menu-drawer'
        : 'fixed top-0 right-0 h-full w-64 bg-white dark:bg-zinc-950 shadow-lg z-[110] mobile-menu-drawer'
      }>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
            {t('common.menu')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all hover:scale-105"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-5 h-5 text-gray-700 dark:text-zinc-300" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all font-medium text-sm ${
                  pathname === '/dashboard'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                    : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:scale-105'
                }`}
              >
                <ChartBarIcon className="w-4 h-4" />
                <span>{t('nav.dashboard')}</span>
              </Link>
            </li>
            <li>
              <Link
                href="/clients"
                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all font-medium text-sm ${
                  pathname === '/clients'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                    : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:scale-105'
                }`}
              >
                <UsersIcon className="w-4 h-4" />
                <span>{t('nav.clients')}</span>
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all font-medium text-sm ${
                    pathname.startsWith('/admin')
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                      : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:scale-105'
                  }`}
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  <span>{t('nav.admin')}</span>
                </Link>
              </li>
            )}

            {/* Dynamic Navigation Items */}
            {navItems.length > 0 && (
              <li>
                <hr className="my-2 border-gray-200 dark:border-zinc-800" />
              </li>
            )}
            {navItems.map((item) => {
              if (item.type === 'dropdown' && item.items && item.items.length > 0) {
                const isOpen = openDropdown === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : item.id)}
                      className="flex items-center justify-between w-full px-5 py-3 rounded-full transition-all font-medium text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900"
                    >
                      <span>{language === 'ar' ? item.label_ar : item.label_en}</span>
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <ul className="mt-1 space-y-1" style={{ paddingInlineStart: '1rem' }}>
                        {item.items.map((subItem) => (
                          <li key={subItem.id}>
                            <Link
                              href={subItem.url}
                              className="block px-5 py-2 rounded-full text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all"
                            >
                              {language === 'ar' ? subItem.label_ar : subItem.label_en}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              // Regular link
              return (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all font-medium text-sm ${
                      pathname === item.url
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                        : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:scale-105'
                    }`}
                  >
                    <span>{language === 'ar' ? item.label_ar : item.label_en}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <UserButton />
            <span className="text-sm text-gray-600 dark:text-zinc-400">{t('common.profile')}</span>
          </div>
        </div>
      </div>
    </>
  );
}
