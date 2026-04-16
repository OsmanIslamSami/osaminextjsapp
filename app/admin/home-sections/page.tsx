'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/lib/components/ToastContainer';
import { EyeIcon, EyeSlashIcon, PhotoIcon, VideoCameraIcon, UsersIcon, NewspaperIcon, QuestionMarkCircleIcon, BookOpenIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface HomeSection {
  section_type: string;
  is_visible: boolean;
  display_order: number;
  partners_display_mode: string | null;
  partners_max_count: number | null;
}

export default function AdminHomeSectionsPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const { language, direction, t } = useLanguage();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchSections();
  }, []);

  async function fetchSections() {
    try {
      setLoading(true);
      const response = await fetch('/api/home-sections');
      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }

      const data = await response.json();
      setSections(data.data || []);
    } catch (err) {
      showError(language === 'ar' ? 'فشل تحميل الإعدادات' : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleVisibility = async (section_type: string, currentVisibility: boolean) => {
    try {
      setSaving(section_type);
      const response = await fetch(`/api/home-sections/${section_type}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !currentVisibility }),
      });

      if (!response.ok) {
        throw new Error('Failed to update section');
      }

      showSuccess(language === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully');
      fetchSections();
    } catch (err) {
      showError(language === 'ar' ? 'فشل التحديث' : 'Failed to update');
    } finally {
      setSaving(null);
    }
  };

  const handleUpdatePartners = async (displayMode: string, maxCount: number) => {
    try {
      setSaving('partners');
      const response = await fetch('/api/home-sections/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partners_display_mode: displayMode,
          partners_max_count: maxCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update partners section');
      }

      showSuccess(language === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully');
      fetchSections();
    } catch (err) {
      showError(language === 'ar' ? 'فشل التحديث' : 'Failed to update');
    } finally {
      setSaving(null);
    }
  };

  const handleMoveSection = async (section_type: string, direction: 'up' | 'down') => {
    try {
      setSaving(section_type);
      const response = await fetch('/api/home-sections/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_type, direction }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder section');
      }

      showSuccess(language === 'ar' ? 'تم إعادة الترتيب بنجاح' : 'Reordered successfully');
      fetchSections();
    } catch (err) {
      showError(language === 'ar' ? 'فشل إعادة الترتيب' : 'Failed to reorder');
    } finally {
      setSaving(null);
    }
  };

  const getSectionIcon = (section_type: string) => {
    switch (section_type) {
      case 'news':
        return <NewspaperIcon className="w-8 h-8" />;
      case 'photos':
        return <PhotoIcon className="w-8 h-8" />;
      case 'videos':
        return <VideoCameraIcon className="w-8 h-8" />;
      case 'partners':
        return <UsersIcon className="w-8 h-8" />;
      case 'faq':
        return <QuestionMarkCircleIcon className="w-8 h-8" />;
      case 'magazines':
        return <BookOpenIcon className="w-8 h-8" />;
      default:
        return null;
    }
  };

  const getSectionTitle = (section_type: string) => {
    const titles: any = {
      news: {
        en: 'News Section',
        ar: 'قسم الأخبار',
      },
      photos: {
        en: 'Photos Section',
        ar: 'قسم الصور',
      },
      videos: {
        en: 'Videos Section',
        ar: 'قسم الفيديوهات',
      },
      partners: {
        en: 'Partners Section',
        ar: 'قسم الشركاء',
      },
      faq: {
        en: 'FAQ Section',
        ar: 'قسم الأسئلة الشائعة',
      },
      magazines: {
        en: 'Magazines Section',
        ar: 'قسم المجلات',
      },
    };
    return titles[section_type]?.[language] || section_type;
  };

  const getSectionDescription = (section_type: string) => {
    const descriptions: any = {
      news: {
        en: 'Display latest news articles on the home page',
        ar: 'عرض أحدث المقالات الإخبارية على الصفحة الرئيسية',
      },
      photos: {
        en: 'Display 5 featured photos in a slider on the home page',
        ar: 'عرض 5 صور مميزة في سلايدر على الصفحة الرئيسية',
      },
      videos: {
        en: 'Display 6 featured videos in a grid on the home page',
        ar: 'عرض 6 فيديوهات مميزة في شبكة على الصفحة الرئيسية',
      },
      partners: {
        en: 'Display partner cards in a slider on the home page',
        ar: 'عرض بطاقات الشركاء في سلايدر على الصفحة الرئيسية',
      },
      faq: {
        en: 'Display top 5 frequently asked questions on the home page',
        ar: 'عرض أفضل 5 أسئلة شائعة على الصفحة الرئيسية',
      },
      magazines: {
        en: 'Display latest magazine publications on the home page',
        ar: 'عرض أحدث إصدارات المجلات على الصفحة الرئيسية',
      },
    };
    return descriptions[section_type]?.[language] || '';
  };

  const partnersSection = sections.find((s) => s.section_type === 'partners');
  const [partnersDisplayMode, setPartnersDisplayMode] = useState(partnersSection?.partners_display_mode || 'all');
  const [partnersMaxCount, setPartnersMaxCount] = useState(partnersSection?.partners_max_count || 10);

  useEffect(() => {
    if (partnersSection) {
      setPartnersDisplayMode(partnersSection.partners_display_mode || 'all');
      setPartnersMaxCount(partnersSection.partners_max_count || 10);
    }
  }, [partnersSection]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          {t('admin.homeSections.title')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
          {t('admin.homeSections.subtitle')}
        </p>
      </div>

      {/* Sections List - Row-based layout */}
      <div className="flex flex-col gap-4">
        {sections.map((section, index) => (
          <div
            key={section.section_type}
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all border-2 border-gray-100 dark:border-zinc-800"
          >
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6">
              {/* Section Icon & Title */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`p-3 rounded-lg flex-shrink-0 ${
                  section.is_visible 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600'
                }`}>
                  {getSectionIcon(section.section_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-lg">
                    {getSectionTitle(section.section_type)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
                    {getSectionDescription(section.section_type)}
                  </p>
                </div>
              </div>

              {/* Controls: Reorder, Visibility Toggle */}
              <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
                {/* Reorder buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMoveSection(section.section_type, 'up')}
                    disabled={index === 0 || saving === section.section_type}
                    className="p-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={language === 'ar' ? 'تحريك لأعلى' : 'Move up'}
                    title={language === 'ar' ? 'تحريك لأعلى' : 'Move up'}
                  >
                    <ChevronUpIcon className="w-5 h-5 text-gray-700 dark:text-zinc-300" />
                  </button>
                  <button
                    onClick={() => handleMoveSection(section.section_type, 'down')}
                    disabled={index === sections.length - 1 || saving === section.section_type}
                    className="p-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={language === 'ar' ? 'تحريك لأسفل' : 'Move down'}
                    title={language === 'ar' ? 'تحريك لأسفل' : 'Move down'}
                  >
                    <ChevronDownIcon className="w-5 h-5 text-gray-700 dark:text-zinc-300" />
                  </button>
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 whitespace-nowrap">
                    {language === 'ar' ? 'مرئي' : 'Visible'}
                  </span>
                  <button
                    onClick={() => handleToggleVisibility(section.section_type, section.is_visible)}
                    disabled={saving === section.section_type}
                    className={`relative inline-flex items-center h-7 rounded-full w-14 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                      section.is_visible
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600'
                    } ${saving === section.section_type ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    aria-label={language === 'ar' ? 'تبديل الرؤية' : 'Toggle visibility'}
                    role="switch"
                    aria-checked={section.is_visible}
                  >
                    <span
                      className="inline-block w-5 h-5 transform transition-all duration-200 ease-in-out bg-white rounded-full shadow-md"
                      style={{
                        transform: section.is_visible 
                          ? (language === 'ar' ? 'translateX(-28px)' : 'translateX(28px)')
                          : 'translateX(2px)',
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Partners-specific controls */}
            {section.section_type === 'partners' && section.is_visible && (
              <div className="w-full space-y-4 p-4 md:px-6 pt-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 rounded-b-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                    {language === 'ar' ? 'وضع العرض' : 'Display Mode'}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="partners_display_mode"
                        value="all"
                        checked={partnersDisplayMode === 'all'}
                        onChange={(e) => setPartnersDisplayMode(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-zinc-300">
                        {language === 'ar' ? 'عرض جميع الشركاء' : 'Show all partners'}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="partners_display_mode"
                        value="limit"
                        checked={partnersDisplayMode === 'limit'}
                        onChange={(e) => setPartnersDisplayMode(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-zinc-300">
                        {language === 'ar' ? 'تحديد عدد معين' : 'Limit to specific number'}
                      </span>
                    </label>
                  </div>
                </div>

                {partnersDisplayMode === 'limit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      {language === 'ar' ? 'الحد الأقصى للعدد' : 'Maximum Count'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={partnersMaxCount}
                      onChange={(e) => setPartnersMaxCount(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}

                <button
                  onClick={() => handleUpdatePartners(partnersDisplayMode, partnersMaxCount)}
                  disabled={saving === 'partners'}
                  className="w-full px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving === 'partners'
                    ? language === 'ar'
                      ? 'جاري الحفظ...'
                      : 'Saving...'
                    : language === 'ar'
                    ? 'حفظ الإعدادات'
                    : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          {language === 'ar' ? 'ℹ️ معلومة' : 'ℹ️ Information'}
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>
            {language === 'ar'
              ? 'الأقسام المخفية لن تظهر على الصفحة الرئيسية'
              : 'Hidden sections will not appear on the home page'}
          </li>
          <li>
            {language === 'ar'
              ? 'التغييرات تُطبق فوراً على الموقع'
              : 'Changes are applied immediately to the website'}
          </li>
          <li>
            {language === 'ar'
              ? 'استخدم أزرار السهم لإعادة ترتيب الأقسام على الصفحة الرئيسية'
              : 'Use arrow buttons to reorder sections on the home page'}
          </li>
          <li>
            {language === 'ar'
              ? 'يمكنك التحكم في عدد الشركاء المعروضين على الصفحة الرئيسية'
              : 'You can control the number of partners displayed on the home page'}
          </li>
        </ul>
      </div>
    </div>
  );
}
