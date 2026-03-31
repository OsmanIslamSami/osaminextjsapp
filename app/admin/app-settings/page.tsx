'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/lib/components/ToastContainer';
import { useAppSettings } from '@/lib/contexts/AppSettingsContext';
import { PhotoIcon, VideoCameraIcon, UsersIcon, CheckIcon, NewspaperIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { getTheme } from '@/lib/themes/themeConfig';
import FilePicker from '@/lib/components/FilePicker';

interface HomeSection {
  section_type: string;
  is_visible: boolean;
  display_order: number;
  partners_display_mode: string | null;
  partners_max_count: number | null;
}

interface AppSettings {
  id: string;
  arabic_font: string;
  english_font: string;
  theme: string;
  primary_color?: string | null;
  secondary_color?: string | null;
  site_title_en: string;
  site_title_ar: string;
  site_description_en: string;
  site_description_ar: string;
  site_logo_url?: string | null;
  site_logo_storage_type: string;
  og_image_url?: string | null;
  og_image_storage_type: string;
  site_keywords_en?: string | null;
  site_keywords_ar?: string | null;
}

type SettingsTab = 'home-sections' | 'fonts' | 'themes' | 'site-settings';

const ARABIC_FONTS = [
  'Cairo',
  'Amiri',
  'Tajawal',
  'Rubik',
  'Almarai',
  'Noto Sans Arabic',
  'IBM Plex Sans Arabic',
  'Readex Pro',
  'Reem Kufi',
  'Lateef',
  'Harmattan',
  'Scheherazade New',
  'El Messiri',
  'Lalezar',
  'Mada',
  'Changa',
  'Vibes',
  'Markazi Text',
  'Aref Ruqaa',
  'Katib'
];
const ENGLISH_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Poppins',
  'Montserrat',
  'Raleway',
  'Ubuntu',
  'Nunito',
  'Playfair Display',
  'Merriweather',
  'Oswald',
  'Source Sans Pro',
  'PT Sans',
  'Libre Franklin',
  'Work Sans',
  'Manrope',
  'Quicksand',
  'Mulish',
  'DM Sans'
];
const THEMES = [
  { id: 'default', name: 'Default', nameAr: 'افتراضي' },
  { id: 'modern', name: 'Modern', nameAr: 'عصري' },
  { id: 'elegant', name: 'Elegant', nameAr: 'أنيق' },
  { id: 'minimal', name: 'Minimal', nameAr: 'بسيط' },
  { id: 'vibrant', name: 'Vibrant', nameAr: 'نابض' },
  { id: 'nature', name: 'Nature', nameAr: 'طبيعة' },
  { id: 'sunset', name: 'Sunset', nameAr: 'غروب' },
  { id: 'ocean', name: 'Ocean', nameAr: 'محيط' },
  { id: 'royal', name: 'Royal', nameAr: 'ملكي' },
  { id: 'warm', name: 'Warm', nameAr: 'دافئ' },
  { id: 'professional', name: 'Professional', nameAr: 'احترافي' },
  { id: 'bold', name: 'Bold', nameAr: 'جريء' },
  { id: 'fresh', name: 'Fresh', nameAr: 'منعش' },
  { id: 'cosmic', name: 'Cosmic', nameAr: 'كوني' },
  { id: 'classic', name: 'Classic', nameAr: 'كلاسيكي' },
];

export default function AppSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('home-sections');
  const [siteSettings, setSiteSettings] = useState({
    site_title_en: '',
    site_title_ar: '',
    site_description_en: '',
    site_description_ar: '',
    site_keywords_en: '',
    site_keywords_ar: '',
  });
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [filePickerTarget, setFilePickerTarget] = useState<'logo' | 'og_image' | null>(null);
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const { language, direction, t } = useLanguage();
  const { showError, showSuccess } = useToast();
  const { refreshSettings } = useAppSettings();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch home sections
      const sectionsRes = await fetch('/api/home-sections');
      if (sectionsRes.ok) {
        const data = await sectionsRes.json();
        setSections(data.data || []);
      }

      // Fetch app settings
      const settingsRes = await fetch('/api/app-settings');
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setAppSettings(data.data);
        if (data.data) {
          setSiteSettings({
            site_title_en: data.data.site_title_en || '',
            site_title_ar: data.data.site_title_ar || '',
            site_description_en: data.data.site_description_en || '',
            site_description_ar: data.data.site_description_ar || '',
            site_keywords_en: data.data.site_keywords_en || '',
            site_keywords_ar: data.data.site_keywords_ar || '',
          });
        }
      }
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
      fetchData();
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
      fetchData();
    } catch (err) {
      showError(language === 'ar' ? 'فشل التحديث' : 'Failed to update');
    } finally {
      setSaving(null);
    }
  };

  const handleUpdateAppSettings = async (updates: Partial<AppSettings>) => {
    try {
      setSaving('app-settings');
      const response = await fetch('/api/app-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      showSuccess(t('admin.appSettings.saved'));
      await fetchData();
      // Refresh the global settings context to apply fonts immediately
      await refreshSettings();
    } catch (err) {
      showError(t('admin.appSettings.error'));
    } finally {
      setSaving(null);
    }
  };

  const handleFileSelect = async (file: any) => {
    if (!filePickerTarget) return;

    const updates: Partial<AppSettings> = {};
    
    if (filePickerTarget === 'logo') {
      updates.site_logo_url = file.file_url;
      updates.site_logo_storage_type = 'blob'; // Assuming file from library is blob
    } else if (filePickerTarget === 'og_image') {
      updates.og_image_url = file.file_url;
      updates.og_image_storage_type = 'blob';
    }

    await handleUpdateAppSettings(updates);
    setFilePickerOpen(false);
    setFilePickerTarget(null);
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
    };
    return titles[section_type]?.[language] || section_type;
  };

  const getSectionDescription = (section_type: string) => {
    const descriptions: any = {
      news: {
        en: 'Display latest news articles in a grid on the home page',
        ar: 'عرض آخر الأخبار في شبكة على الصفحة الرئيسية',
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
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2" 
          style={{ borderColor: 'var(--color-primary)' }}
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          {t('admin.appSettings.title')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
          {t('admin.appSettings.subtitle')}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <nav className="flex gap-4" dir={direction}>
          <button
            onClick={() => setActiveTab('home-sections')}
            className="px-4 py-3 font-medium transition-colors whitespace-nowrap"
            style={{
              borderBottom: activeTab === 'home-sections' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'home-sections' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {t('admin.appSettings.settingsTabs.homeSections')}
          </button>
          <button
            onClick={() => setActiveTab('fonts')}
            className="px-4 py-3 font-medium transition-colors whitespace-nowrap"
            style={{
              borderBottom: activeTab === 'fonts' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'fonts' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {t('admin.appSettings.settingsTabs.fonts')}
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className="px-4 py-3 font-medium transition-colors whitespace-nowrap"
            style={{
              borderBottom: activeTab === 'themes' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'themes' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {t('admin.appSettings.settingsTabs.themes')}
          </button>
          <button
            onClick={() => setActiveTab('site-settings')}
            className="px-4 py-3 font-medium transition-colors whitespace-nowrap"
            style={{
              borderBottom: activeTab === 'site-settings' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'site-settings' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {language === 'ar' ? 'معلومات التطبيق' : 'App Information'}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Home Sections Tab */}
        {activeTab === 'home-sections' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                {language === 'ar' ? 'إعدادات أقسام الصفحة الرئيسية' : 'Home Page Sections Settings'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                {language === 'ar'
                  ? 'تحكم في ظهور الأقسام على الصفحة الرئيسية'
                  : 'Control which sections appear on the home page'}
              </p>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section) => (
                <div
                  key={section.section_type}
                  className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 p-6 space-y-4"
                >
                  {/* Section Icon & Title */}
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: section.is_visible ? 'var(--color-primary-light)' : 'var(--color-surface-hover)',
                        color: section.is_visible ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                      }}
                    >
                      {getSectionIcon(section.section_type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
                        {getSectionTitle(section.section_type)}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                        {getSectionDescription(section.section_type)}
                      </p>
                    </div>
                  </div>

                  {/* Visibility Toggle */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-zinc-800">
                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                      {language === 'ar' ? 'مرئي على الصفحة الرئيسية' : 'Visible on Home Page'}
                    </span>
                    <button
                      onClick={() => handleToggleVisibility(section.section_type, section.is_visible)}
                      disabled={saving === section.section_type}
                      className="relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-200 ease-in-out focus:outline-none cursor-pointer flex-shrink-0"
                      style={{
                        backgroundColor: section.is_visible ? 'var(--color-primary)' : 'var(--color-border)',
                        opacity: saving === section.section_type ? 0.5 : 1,
                        cursor: saving === section.section_type ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!saving) {
                          e.currentTarget.style.backgroundColor = section.is_visible ? 'var(--color-primary-hover)' : 'var(--color-border-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!saving) {
                          e.currentTarget.style.backgroundColor = section.is_visible ? 'var(--color-primary)' : 'var(--color-border)';
                        }
                      }}
                      aria-label={language === 'ar' ? 'تبديل الرؤية' : 'Toggle visibility'}
                      role="switch"
                      aria-checked={section.is_visible}
                    >
                      <span
                        className="inline-block w-4 h-4 transform transition-all duration-200 ease-in-out bg-white rounded-full shadow-sm"
                        style={{
                          transform: section.is_visible 
                            ? (language === 'ar' ? 'translateX(-26px)' : 'translateX(26px)')
                            : 'translateX(2px)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Partners-specific controls */}
                  {section.section_type === 'partners' && section.is_visible && (
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
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
                                style={{ accentColor: 'var(--color-primary)' }}
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
                                style={{ accentColor: 'var(--color-primary)' }}
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
                            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                          />
                        </div>
                      )}

                      <button
                        onClick={() => handleUpdatePartners(partnersDisplayMode, partnersMaxCount)}
                        disabled={saving === 'partners'}
                        className="w-full px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                        }}
                        onMouseEnter={(e) => {
                          if (saving !== 'partners') {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (saving !== 'partners') {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                          }
                        }}
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
            <div 
              className="rounded-lg p-4" 
              style={{
                backgroundColor: 'var(--color-primary-light)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--color-primary)',
                opacity: 0.8,
              }}
            >
              <h4 className="font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                {language === 'ar' ? 'ℹ️ معلومة' : 'ℹ️ Information'}
              </h4>
              <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: 'var(--color-primary-dark)' }}>
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
                    ? 'يمكنك التحكم في عدد الشركاء المعروضين على الصفحة الرئيسية'
                    : 'You can control the number of partners displayed on the home page'}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Fonts Tab */}
        {activeTab === 'fonts' && appSettings && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                {t('admin.appSettings.fonts.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                {t('admin.appSettings.fonts.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Arabic Font */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3">
                  {t('admin.appSettings.fonts.arabicFont')}
                </label>
                <div className="space-y-2">
                  {ARABIC_FONTS.map((font) => (
                    <button
                      key={font}
                      onClick={() => handleUpdateAppSettings({ arabic_font: font })}
                      disabled={saving === 'app-settings'}
                      className="w-full px-4 py-3 rounded-lg transition-all text-left flex items-center justify-between"
                      style={{
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: appSettings.arabic_font === font ? 'var(--color-primary)' : 'var(--color-border)',
                        backgroundColor: appSettings.arabic_font === font ? 'var(--color-primary-light)' : 'transparent',
                        opacity: saving === 'app-settings' ? 0.5 : 1,
                        cursor: saving === 'app-settings' ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (saving !== 'app-settings' && appSettings.arabic_font !== font) {
                          e.currentTarget.style.borderColor = 'var(--color-primary)';
                          e.currentTarget.style.opacity = '0.85';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (saving !== 'app-settings' && appSettings.arabic_font !== font) {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.opacity = '1';
                        }
                      }}
                    >
                      <span
                        style={{ fontFamily: font, color: 'var(--color-text-primary)' }}
                      >
                        {font}
                      </span>
                      {appSettings.arabic_font === font && (
                        <CheckIcon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-zinc-400 mb-2">
                    {t('admin.appSettings.fonts.preview')}
                  </p>
                  <p
                    className="text-2xl text-gray-900 dark:text-zinc-100"
                    style={{ fontFamily: appSettings.arabic_font }}
                  >
                    {t('admin.appSettings.fonts.previewTextAr')}
                  </p>
                </div>
              </div>

              {/* English Font */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3">
                  {t('admin.appSettings.fonts.englishFont')}
                </label>
                <div className="space-y-2">
                  {ENGLISH_FONTS.map((font) => (
                    <button
                      key={font}
                      onClick={() => handleUpdateAppSettings({ english_font: font })}
                      disabled={saving === 'app-settings'}
                      className="w-full px-4 py-3 rounded-lg transition-all text-left flex items-center justify-between"
                      style={{
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: appSettings.english_font === font ? 'var(--color-primary)' : 'var(--color-border)',
                        backgroundColor: appSettings.english_font === font ? 'var(--color-primary-light)' : 'transparent',
                        opacity: saving === 'app-settings' ? 0.5 : 1,
                        cursor: saving === 'app-settings' ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (saving !== 'app-settings' && appSettings.english_font !== font) {
                          e.currentTarget.style.borderColor = 'var(--color-primary)';
                          e.currentTarget.style.opacity = '0.85';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (saving !== 'app-settings' && appSettings.english_font !== font) {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.opacity = '1';
                        }
                      }}
                    >
                      <span
                        style={{ fontFamily: font, color: 'var(--color-text-primary)' }}
                      >
                        {font}
                      </span>
                      {appSettings.english_font === font && (
                        <CheckIcon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-zinc-400 mb-2">
                    {t('admin.appSettings.fonts.preview')}
                  </p>
                  <p
                    className="text-2xl text-gray-900 dark:text-zinc-100"
                    style={{ fontFamily: appSettings.english_font }}
                  >
                    {t('admin.appSettings.fonts.previewTextEn')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Themes Tab */}
        {activeTab === 'themes' && appSettings && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                {t('admin.appSettings.themes.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                {t('admin.appSettings.themes.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {THEMES.map((theme) => {
                const themeConfig = getTheme(theme.id);
                const colors = themeConfig.light;
                
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleUpdateAppSettings({ theme: theme.id })}
                    disabled={saving === 'app-settings'}
                    className="p-6 rounded-lg transition-all text-left"
                    style={{
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: appSettings.theme === theme.id ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: appSettings.theme === theme.id ? 'var(--color-primary-light)' : 'transparent',
                      opacity: saving === 'app-settings' ? 0.5 : 1,
                      cursor: saving === 'app-settings' ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (saving !== 'app-settings' && appSettings.theme !== theme.id) {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.opacity = '0.85';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (saving !== 'app-settings' && appSettings.theme !== theme.id) {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {language === 'ar' ? theme.nameAr : theme.name}
                      </h4>
                      {appSettings.theme === theme.id && (
                        <CheckIcon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {t(`admin.appSettings.themes.descriptions.${theme.id}`)}
                    </p>
                    
                    {/* Color Preview Swatches */}
                    <div className="mt-4 flex gap-2">
                      <div
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700"
                        style={{ backgroundColor: colors.primary }}
                        title="Primary"
                      />
                      <div
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700"
                        style={{ backgroundColor: colors.secondary }}
                        title="Secondary"
                      />
                      <div
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700"
                        style={{ backgroundColor: colors.accent }}
                        title="Accent"
                      />
                      <div
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700"
                        style={{ backgroundColor: colors.success }}
                        title="Success"
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Theme Info Notice */}
            <div 
              className="rounded-lg p-4"
              style={{
                backgroundColor: 'var(--color-primary-light)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--color-primary)',
                opacity: 0.8,
              }}
            >
              <h4 className="font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                {language === 'ar' ? '✨ القوالب نشطة' : '✨ Themes Active'}
              </h4>
              <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: 'var(--color-primary-dark)' }}>
                <li>
                  {language === 'ar'
                    ? 'القوالب تُطبق فوراً على جميع صفحات التطبيق'
                    : 'Themes are applied instantly across all pages'}
                </li>
                <li>
                  {language === 'ar'
                    ? 'القوالب تتكيف تلقائياً مع الوضع الفاتح والداكن'
                    : 'Themes automatically adapt to light and dark modes'}
                </li>
                <li>
                  {language === 'ar'
                    ? 'كل قالب يحتوي على ألوان مخصصة للأزرار، الخلفيات، والنصوص'
                    : 'Each theme has custom colors for buttons, backgrounds, and text'}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Site Settings Tab */}
        {activeTab === 'site-settings' && appSettings && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                {language === 'ar' ? 'معلومات التطبيق العامة' : 'General App Information'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                {language === 'ar'
                  ? 'إدارة معلومات الموقع الأساسية، العنوان، الوصف، الشعار، وصورة المشاركة'
                  : 'Manage basic site information, title, description, logo, and social sharing image'}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateAppSettings(siteSettings);
              }}
              className="space-y-6"
            >
              {/* Site Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {language === 'ar' ? 'عنوان الموقع (English)' : 'Site Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={siteSettings.site_title_en}
                    onChange={(e) => setSiteSettings({ ...siteSettings, site_title_en: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="Next App"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {language === 'ar' ? 'عنوان الموقع (عربي)' : 'Site Title (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={siteSettings.site_title_ar}
                    onChange={(e) => setSiteSettings({ ...siteSettings, site_title_ar: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="تطبيق نكست"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Site Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {language === 'ar' ? 'وصف الموقع (English)' : 'Site Description (English)'}
                  </label>
                  <textarea
                    value={siteSettings.site_description_en}
                    onChange={(e) => setSiteSettings({ ...siteSettings, site_description_en: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 resize-none"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="A modern web application"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {language === 'ar' ? 'وصف الموقع (عربي)' : 'Site Description (Arabic)'}
                  </label>
                  <textarea
                    value={siteSettings.site_description_ar}
                    onChange={(e) => setSiteSettings({ ...siteSettings, site_description_ar: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 resize-none"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="تطبيق ويب حديث"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* SEO Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {language === 'ar' ? 'الكلمات المفتاحية (English)' : 'Keywords (English)'}
                  </label>
                  <input
                    type="text"
                    value={siteSettings.site_keywords_en}
                    onChange={(e) => setSiteSettings({ ...siteSettings, site_keywords_en: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="web, app, modern, nextjs"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    {language === 'ar' ? 'افصل الكلمات بفاصلة' : 'Separate keywords with commas'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {language === 'ar' ? 'الكلمات المفتاحية (عربي)' : 'Keywords (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={siteSettings.site_keywords_ar}
                    onChange={(e) => setSiteSettings({ ...siteSettings, site_keywords_ar: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="ويب، تطبيق، حديث، نكست"
                    dir="rtl"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    {language === 'ar' ? 'افصل الكلمات بفاصلة' : 'Separate keywords with commas'}
                  </p>
                </div>
              </div>

              {/* Logo and OG Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {language === 'ar' ? 'شعار الموقع (Logo)' : 'Site Logo'}
                  </label>
                  <div 
                    className="rounded-lg p-4 text-center"
                    style={{
                      backgroundColor: 'var(--color-background-secondary)',
                      borderWidth: '2px',
                      borderStyle: 'dashed',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {appSettings.site_logo_url ? (
                      <div className="space-y-2">
                        <img
                          src={appSettings.site_logo_url}
                          alt="Site Logo"
                          className="mx-auto h-16 w-auto object-contain"
                        />
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          {language === 'ar' ? 'الشعار الحالي' : 'Current logo'}
                        </p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <PhotoIcon className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--color-text-tertiary)' }} />
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {language === 'ar' ? 'لا يوجد شعار' : 'No logo uploaded'}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilePickerTarget('logo');
                      setFilePickerOpen(true);
                    }}
                    className="mt-2 w-full px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    }}
                  >
                    {language === 'ar' ? 'اختيار شعار' : 'Select Logo'}
                  </button>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                    {language === 'ar'
                      ? 'صورة بتنسيق PNG أو SVG مفضلة للحصول على أفضل جودة'
                      : 'PNG or SVG format preferred for best quality'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {language === 'ar' ? 'صورة المشاركة (OG Image)' : 'Open Graph Image'}
                  </label>
                  <div 
                    className="rounded-lg p-4 text-center"
                    style={{
                      backgroundColor: 'var(--color-background-secondary)',
                      borderWidth: '2px',
                      borderStyle: 'dashed',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {appSettings.og_image_url ? (
                      <div className="space-y-2">
                        <img
                          src={appSettings.og_image_url}
                          alt="OG Image"
                          className="mx-auto h-24 w-auto object-cover rounded"
                        />
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          {language === 'ar' ? 'الصورة الحالية' : 'Current image'}
                        </p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <PhotoIcon className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--color-text-tertiary)' }} />
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {language === 'ar' ? 'لا توجد صورة' : 'No image uploaded'}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilePickerTarget('og_image');
                      setFilePickerOpen(true);
                    }}
                    className="mt-2 w-full px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    }}
                  >
                    {language === 'ar' ? 'اختيار صورة المشاركة' : 'Select OG Image'}
                  </button>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                    {language === 'ar'
                      ? 'الحجم المثالي: 1200x630 بكسل للمشاركة على وسائل التواصل'
                      : 'Ideal size: 1200x630px for social media sharing'}
                  </p>
                </div>
              </div>

              {/* Info Notice */}
              <div 
                className="rounded-lg p-4"
                style={{
                  backgroundColor: 'var(--color-primary-light)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--color-primary)',
                  opacity: 0.8,
                }}
              >
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                  {language === 'ar' ? 'ℹ️ معلومات مهمة' : 'ℹ️ Important Information'}
                </h4>
                <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: 'var(--color-primary-dark)' }}>
                  <li>
                    {language === 'ar'
                      ? 'هذه الإعدادات تؤثر على العنوان والوصف في نتائج محركات البحث'
                      : 'These settings affect the title and description in search engine results'}
                  </li>
                  <li>
                    {language === 'ar'
                      ? 'صورة OG تظهر عند مشاركة الموقع على وسائل التواصل الاجتماعي'
                      : 'OG image appears when sharing the site on social media'}
                  </li>
                  <li>
                    {language === 'ar'
                      ? 'الشعار يظهر في شريط التنقل والرأس'
                      : 'Logo appears in the navigation bar and header'}
                  </li>
                  <li>
                    {language === 'ar'
                      ? 'الكلمات المفتاحية تساعد في تحسين محركات البحث (SEO)'
                      : 'Keywords help improve search engine optimization (SEO)'}
                  </li>
                </ul>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving === 'app-settings'}
                  className="px-6 py-3 rounded-lg font-medium transition-all min-h-[44px]"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    opacity: saving === 'app-settings' ? 0.5 : 1,
                    cursor: saving === 'app-settings' ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (saving !== 'app-settings') {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (saving !== 'app-settings') {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    }
                  }}
                >
                  {saving === 'app-settings'
                    ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                    : (language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* FilePicker Modal */}
      <FilePicker
        isOpen={filePickerOpen}
        onClose={() => {
          setFilePickerOpen(false);
          setFilePickerTarget(null);
        }}
        onSelect={handleFileSelect}
        fileType="image"
        title={
          filePickerTarget === 'logo'
            ? (language === 'ar' ? 'اختر شعار الموقع' : 'Select Site Logo')
            : (language === 'ar' ? 'اختر صورة المشاركة' : 'Select OG Image')
        }
      />
    </div>
  );
}
