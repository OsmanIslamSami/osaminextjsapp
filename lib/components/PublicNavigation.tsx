'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/utils/logger';

interface NavItem {
  id: string;
  label_en: string;
  label_ar: string;
  url: string;
  type: string;
  items?: NavItem[];
}

export default function PublicNavigation() {
  const { language } = useTranslation();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNavigation();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchNavigation() {
    try {
      const response = await fetch('/api/navigation?location=header');
      if (response.ok) {
        const { data } = await response.json();
        setNavItems(data);
      }
    } catch (error) {
      logger.error('Error fetching navigation:', error);
    }
  }

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const getLabel = (item: NavItem) => {
    return language === 'ar' ? item.label_ar : item.label_en;
  };

  return (
    <nav className="hidden lg:flex items-center gap-2" ref={dropdownRef}>
      {navItems.map((item) => {
        if (item.type === 'dropdown') {
          const isOpen = openDropdown === item.id;
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => toggleDropdown(item.id)}
                className="flex items-center gap-1 px-5 py-2 rounded-full transition-all font-medium text-sm hover:scale-105"
                style={{ color: 'var(--color-text-primary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  if (!isOpen) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <span>{getLabel(item)}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && item.items && item.items.length > 0 && (
                <div 
                  className="absolute top-full mt-2 py-2 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700 min-w-[200px] z-50"
                  style={{ left: language === 'ar' ? 'auto' : '0', right: language === 'ar' ? '0' : 'auto' }}
                >
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.id}
                      href={subItem.url}
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                      style={{ color: 'var(--color-text-primary)' }}
                      onClick={() => setOpenDropdown(null)}
                    >
                      {getLabel(subItem)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }

        // Regular link
        return (
          <Link
            key={item.id}
            href={item.url}
            className="flex items-center gap-2 px-5 py-2 rounded-full transition-all font-medium text-sm hover:scale-105"
            style={{ color: 'var(--color-text-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
              e.currentTarget.style.color = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-primary)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>{getLabel(item)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
