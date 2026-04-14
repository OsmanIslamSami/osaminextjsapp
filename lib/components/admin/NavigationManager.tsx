'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useToast } from '@/lib/components/ToastContainer';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import {
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  GlobeAltIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  id: string;
  label_en: string;
  label_ar: string;
  url: string;
  location: string;
  type: string;
  parent_id: string | null;
  icon: string | null;
  is_visible: boolean;
  display_order: number;
  target: string;
}

type NavFormData = {
  label_en: string;
  label_ar: string;
  url: string;
  type: string;
  parent_id: string;
  icon: string;
  is_visible: boolean;
  target: string;
};

const defaultFormData: NavFormData = {
  label_en: '',
  label_ar: '',
  url: '',
  type: 'link',
  parent_id: '',
  icon: '',
  is_visible: true,
  target: '_self',
};

export default function NavigationManager() {
  const { language, direction } = useTranslation();
  const { showError, showSuccess } = useToast();

  const [headerItems, setHeaderItems] = useState<NavItem[]>([]);
  const [footerItems, setFooterItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'header' | 'footer'>('header');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [formData, setFormData] = useState<NavFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = useCallback(async () => {
    try {
      const response = await fetch('/api/navigation/admin');
      if (response.ok) {
        const { data } = await response.json();
        setHeaderItems(data.header || []);
        setFooterItems(data.footer || []);
      }
    } catch {
      showError(language === 'ar' ? 'فشل في تحميل التنقل' : 'Failed to load navigation');
    } finally {
      setLoading(false);
    }
  }, [language, showError]);

  const currentItems = activeTab === 'header' ? headerItems : footerItems;

  // Get top-level items (no parent)
  const topLevelItems = currentItems.filter(item => !item.parent_id);
  // Get child items for a given parent
  const getChildren = (parentId: string) =>
    currentItems.filter(item => item.parent_id === parentId);

  // Available parent items for form dropdown
  const parentOptions = currentItems.filter(
    item => item.type === 'dropdown' || item.type === 'section-header'
  );

  const openAddForm = () => {
    setEditingItem(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  const openEditForm = (item: NavItem) => {
    setEditingItem(item);
    setFormData({
      label_en: item.label_en,
      label_ar: item.label_ar,
      url: item.url,
      type: item.type,
      parent_id: item.parent_id || '',
      icon: item.icon || '',
      is_visible: item.is_visible,
      target: item.target,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData(defaultFormData);
  };

  const handleSave = async () => {
    if (!formData.label_en.trim() || !formData.label_ar.trim()) {
      showError(language === 'ar' ? 'العنوان مطلوب بالعربية والإنجليزية' : 'Labels are required in both languages');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        location: activeTab,
        parent_id: formData.parent_id || null,
        icon: formData.icon || null,
      };

      let response: Response;
      if (editingItem) {
        response = await fetch(`/api/navigation/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Auto-calculate display_order
        const maxOrder = currentItems
          .filter(i => (formData.parent_id ? i.parent_id === formData.parent_id : !i.parent_id))
          .reduce((max, i) => Math.max(max, i.display_order), 0);
        response = await fetch('/api/navigation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, display_order: maxOrder + 1 }),
        });
      }

      if (response.ok) {
        showSuccess(
          editingItem
            ? (language === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully')
            : (language === 'ar' ? 'تم الإضافة بنجاح' : 'Added successfully')
        );
        closeForm();
        fetchNavigation();
      } else {
        const err = await response.json();
        showError(err.error || 'Failed');
      }
    } catch {
      showError(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (item: NavItem) => {
    try {
      const response = await fetch(`/api/navigation/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !item.is_visible }),
      });
      if (response.ok) {
        fetchNavigation();
        showSuccess(item.is_visible
          ? (language === 'ar' ? 'تم الإخفاء' : 'Hidden')
          : (language === 'ar' ? 'تم الإظهار' : 'Visible')
        );
      }
    } catch {
      showError(language === 'ar' ? 'فشل في تحديث الرؤية' : 'Failed to update visibility');
    }
  };

  const handleDelete = async (item: NavItem) => {
    const children = getChildren(item.id);
    const confirmMsg = children.length > 0
      ? (language === 'ar'
        ? `هل أنت متأكد؟ سيتم حذف ${children.length} عناصر فرعية أيضاً`
        : `Are you sure? This will also delete ${children.length} child items.`)
      : (language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this item?');

    if (!confirm(confirmMsg)) return;

    try {
      const response = await fetch(`/api/navigation/${item.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchNavigation();
        showSuccess(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      }
    } catch {
      showError(language === 'ar' ? 'فشل في الحذف' : 'Failed to delete');
    }
  };

  const handleReorder = async (item: NavItem, sibling: NavItem) => {
    try {
      await Promise.all([
        fetch(`/api/navigation/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: sibling.display_order }),
        }),
        fetch(`/api/navigation/${sibling.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: item.display_order }),
        }),
      ]);
      fetchNavigation();
    } catch {
      showError(language === 'ar' ? 'فشل في إعادة الترتيب' : 'Failed to reorder');
    }
  };

  const handleMoveUp = (item: NavItem, siblings: NavItem[], index: number) => {
    if (index === 0) return;
    handleReorder(item, siblings[index - 1]);
  };

  const handleMoveDown = (item: NavItem, siblings: NavItem[], index: number) => {
    if (index === siblings.length - 1) return;
    handleReorder(item, siblings[index + 1]);
  };

  if (loading) {
    return <LoadingSpinner className="py-12" size="md" />;
  }

  const typeOptions = activeTab === 'header'
    ? [
        { value: 'link', label: language === 'ar' ? 'رابط' : 'Link' },
        { value: 'dropdown', label: language === 'ar' ? 'قائمة منسدلة' : 'Dropdown' },
        { value: 'dropdown-item', label: language === 'ar' ? 'عنصر قائمة' : 'Dropdown Item' },
      ]
    : [
        { value: 'section-header', label: language === 'ar' ? 'عنوان قسم' : 'Section Header' },
        { value: 'link', label: language === 'ar' ? 'رابط' : 'Link' },
      ];

  return (
    <div className="space-y-6" dir={direction}>
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('header')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all ${
              activeTab === 'header'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                : 'border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:border-gray-400 dark:hover:border-zinc-500'
            }`}
          >
            <GlobeAltIcon className="w-5 h-5" />
            {language === 'ar' ? 'الهيدر' : 'Header'}
          </button>
          <button
            onClick={() => setActiveTab('footer')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all ${
              activeTab === 'footer'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                : 'border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:border-gray-400 dark:hover:border-zinc-500'
            }`}
          >
            <Bars3BottomLeftIcon className="w-5 h-5" />
            {language === 'ar' ? 'الفوتر' : 'Footer'}
          </button>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all whitespace-nowrap w-fit"
        >
          <PlusIcon className="w-5 h-5" />
          {language === 'ar' ? 'إضافة عنصر' : 'Add Item'}
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingItem
                  ? (language === 'ar' ? 'تعديل العنصر' : 'Edit Item')
                  : (language === 'ar' ? 'إضافة عنصر جديد' : 'Add New Item')}
              </h3>
              <button
                onClick={closeForm}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  {language === 'ar' ? 'النوع' : 'Type'}
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value, parent_id: '' }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all cursor-pointer"
                >
                  {typeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Parent (for dropdown-item or link under section-header) */}
              {(formData.type === 'dropdown-item' || (activeTab === 'footer' && formData.type === 'link')) && parentOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                    {language === 'ar' ? 'العنصر الأب' : 'Parent'}
                  </label>
                  <select
                    value={formData.parent_id}
                    onChange={e => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="">{language === 'ar' ? '— بدون أب —' : '— No Parent —'}</option>
                    {parentOptions.map(p => (
                      <option key={p.id} value={p.id}>
                        {language === 'ar' ? p.label_ar : p.label_en}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Label EN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  {language === 'ar' ? 'العنوان (إنجليزي)' : 'Label (English)'}
                </label>
                <input
                  type="text"
                  value={formData.label_en}
                  onChange={e => setFormData(prev => ({ ...prev, label_en: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all"
                  placeholder="e.g. All News"
                  dir="ltr"
                />
              </div>

              {/* Label AR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  {language === 'ar' ? 'العنوان (عربي)' : 'Label (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formData.label_ar}
                  onChange={e => setFormData(prev => ({ ...prev, label_ar: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all"
                  placeholder="مثال: جميع الأخبار"
                  dir="rtl"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  {language === 'ar' ? 'الرابط' : 'URL'}
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all"
                  placeholder="/news or https://example.com"
                  dir="ltr"
                />
              </div>

              {/* Target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  {language === 'ar' ? 'فتح في' : 'Open In'}
                </label>
                <select
                  value={formData.target}
                  onChange={e => setFormData(prev => ({ ...prev, target: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="_self">{language === 'ar' ? 'نفس النافذة' : 'Same Window'}</option>
                  <option value="_blank">{language === 'ar' ? 'نافذة جديدة' : 'New Window'}</option>
                </select>
              </div>

              {/* Visible */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="nav-visible"
                  checked={formData.is_visible}
                  onChange={e => setFormData(prev => ({ ...prev, is_visible: e.target.checked }))}
                  className="w-5 h-5 rounded border-2 border-gray-300 dark:border-zinc-600 cursor-pointer"
                />
                <label htmlFor="nav-visible" className="text-sm font-medium text-gray-700 dark:text-zinc-300 cursor-pointer">
                  {language === 'ar' ? 'مرئي' : 'Visible'}
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-700">
              <button
                onClick={closeForm}
                className="px-6 py-3 border-2 border-gray-300 dark:border-zinc-600 rounded-full font-medium text-sm text-gray-700 dark:text-zinc-300 hover:border-gray-400 dark:hover:border-zinc-500 transition-all"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                  : editingItem
                    ? (language === 'ar' ? 'تحديث' : 'Update')
                    : (language === 'ar' ? 'إضافة' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items List */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
        {topLevelItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-zinc-400">
            <p className="text-lg">
              {activeTab === 'header'
                ? (language === 'ar' ? 'لا توجد عناصر في الهيدر بعد' : 'No header navigation items yet')
                : (language === 'ar' ? 'لا توجد عناصر في الفوتر بعد' : 'No footer navigation items yet')}
            </p>
            <p className="mt-2 text-sm">
              {language === 'ar' ? 'اضغط "إضافة عنصر" للبدء' : 'Click "Add Item" to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-zinc-700">
            {topLevelItems.map((item, index) => {
              const children = getChildren(item.id);
              return (
                <div key={item.id}>
                  {/* Parent Item Row */}
                  <div className="p-4 flex items-center gap-4">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveUp(item, topLevelItems, index)}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={language === 'ar' ? 'نقل لأعلى' : 'Move up'}
                      >
                        <ChevronUpIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(item, topLevelItems, index)}
                        disabled={index === topLevelItems.length - 1}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={language === 'ar' ? 'نقل لأسفل' : 'Move down'}
                      >
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white truncate">
                          {language === 'ar' ? item.label_ar : item.label_en}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          item.type === 'dropdown'
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200'
                            : item.type === 'section-header'
                              ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200'
                              : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                        }`}>
                          {item.type}
                        </span>
                        {!item.is_visible && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 font-medium">
                            {language === 'ar' ? 'مخفي' : 'Hidden'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5 truncate">
                        {item.url}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditForm(item)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-label={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <PencilIcon className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(item)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-label={item.is_visible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                      >
                        {item.is_visible ? (
                          <EyeIcon className="w-5 h-5 text-green-600" />
                        ) : (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        aria-label={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <TrashIcon className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Child Items */}
                  {children.length > 0 && (
                    <div className="bg-gray-50 dark:bg-zinc-800/50">
                      {children.map((child, childIndex) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-4 px-4 py-3 border-t border-gray-100 dark:border-zinc-700/50"
                          style={{ paddingInlineStart: '3rem' }}
                        >
                          {/* Child Reorder */}
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleMoveUp(child, children, childIndex)}
                              disabled={childIndex === 0}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label={language === 'ar' ? 'نقل لأعلى' : 'Move up'}
                            >
                              <ChevronUpIcon className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(child, children, childIndex)}
                              disabled={childIndex === children.length - 1}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label={language === 'ar' ? 'نقل لأسفل' : 'Move down'}
                            >
                              <ChevronDownIcon className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Child Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm text-gray-900 dark:text-white truncate">
                                {language === 'ar' ? child.label_ar : child.label_en}
                              </span>
                              {!child.is_visible && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 font-medium">
                                  {language === 'ar' ? 'مخفي' : 'Hidden'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 truncate">
                              {child.url}
                            </p>
                          </div>

                          {/* Child Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditForm(child)}
                              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                              aria-label={language === 'ar' ? 'تعديل' : 'Edit'}
                            >
                              <PencilIcon className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
                            </button>
                            <button
                              onClick={() => handleToggleVisibility(child)}
                              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                              aria-label={child.is_visible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                            >
                              {child.is_visible ? (
                                <EyeIcon className="w-4 h-4 text-green-600" />
                              ) : (
                                <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(child)}
                              className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                              aria-label={language === 'ar' ? 'حذف' : 'Delete'}
                            >
                              <TrashIcon className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
