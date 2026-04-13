'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useToast } from '@/lib/components/ToastContainer';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon, EyeSlashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface NavItem {
  id: string;
  label_en: string;
  label_ar: string;
  url: string;
  type: string;
  parent_id: string | null;
  is_visible: boolean;
  display_order: number;
  items?: NavItem[];
}

export default function HeaderNavigationAdmin() {
  const router = useRouter();
  const { user, isAdmin, isLoading: userLoading } = useCurrentUser();
  const { t, language } = useTranslation();
  const { showError, showSuccess } = useToast();
  
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);

  useEffect(() => {
    if (userLoading) return;
    
    if (!user || !isAdmin) {
      router.push('/login');
      return;
    }

    fetchNavigation();
  }, [userLoading, user, isAdmin, router]);

  async function fetchNavigation() {
    try {
      const response = await fetch('/api/header-navigation');
      if (response.ok) {
        const { data } = await response.json();
        setNavItems(data);
      }
    } catch (error) {
      showError('Failed to load navigation');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/header-navigation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !currentVisibility }),
      });

      if (response.ok) {
        fetchNavigation();
        showSuccess(currentVisibility ? 'Hidden' : 'Visible');
      }
    } catch (error) {
      showError('Failed to update visibility');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this navigation item?')) return;

    try {
      const response = await fetch(`/api/header-navigation/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNavigation();
        showSuccess('Deleted successfully');
      }
    } catch (error) {
      showError('Failed to delete');
    }
  };

  const handleMoveUp = async (item: NavItem, index: number) => {
    if (index === 0) return;
    
    const previousItem = navItems[index - 1];
    
    try {
      await Promise.all([
        fetch(`/api/header-navigation/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: previousItem.display_order }),
        }),
        fetch(`/api/header-navigation/${previousItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: item.display_order }),
        }),
      ]);
      
      fetchNavigation();
    } catch (error) {
      showError('Failed to reorder');
    }
  };

  const handleMoveDown = async (item: NavItem, index: number) => {
    if (index === navItems.length - 1) return;
    
    const nextItem = navItems[index + 1];
    
    try {
      await Promise.all([
        fetch(`/api/header-navigation/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: nextItem.display_order }),
        }),
        fetch(`/api/header-navigation/${nextItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: item.display_order }),
        }),
      ]);
      
      fetchNavigation();
    } catch (error) {
      showError('Failed to reorder');
    }
  };

  if (userLoading || loading) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'التنقل في الهيدر' : 'Header Navigation'}
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-2">
            {language === 'ar' ? 'إدارة عناصر التنقل في رأس الصفحة' : 'Manage header navigation items'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          {language === 'ar' ? 'إضافة عنصر' : 'Add Item'}
        </button>
      </div>

      {/* Navigation Items List */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-zinc-700">
          {navItems.map((item, index) => (
            <div key={item.id}>
              {/* Parent Item */}
              <div className="p-4 flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(item, index)}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(item, index)}
                    disabled={index === navItems.length - 1}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {language === 'ar' ? item.label_ar : item.label_en}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{item.url}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisibility(item.id, item.is_visible)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {item.is_visible ? (
                      <EyeIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Child Items */}
              {item.items && item.items.length > 0 && (
                <div className="bg-gray-50 dark:bg-zinc-800 px-4 py-2">
                  {item.items.map((subItem) => (
                    <div key={subItem.id} className="flex items-center gap-4 py-2 pl-12">
                      <div className="flex-1">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {language === 'ar' ? subItem.label_ar : subItem.label_en}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-zinc-400 ml-2">{subItem.url}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleVisibility(subItem.id, subItem.is_visible)}
                          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          {subItem.is_visible ? (
                            <EyeIcon className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(subItem.id)}
                          className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
