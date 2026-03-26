'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserButton } from '@clerk/nextjs';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { t, direction } = useTranslation();
  const { isAdmin } = useCurrentUser();
  
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
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-zinc-300" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900'
                }`}
              >
                {t('nav.dashboard')}
              </Link>
            </li>
            <li>
              <Link
                href="/clients"
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  pathname === '/clients'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900'
                }`}
              >
                {t('nav.clients')}
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    pathname.startsWith('/admin')
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  {t('nav.admin')}
                </Link>
              </li>
            )}
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
