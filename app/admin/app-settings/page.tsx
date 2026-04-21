'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/lib/components/ToastContainer';
import { useAppSettings } from '@/lib/contexts/AppSettingsContext';
import { PhotoIcon, VideoCameraIcon, UsersIcon, CheckIcon, NewspaperIcon, Cog6ToothIcon, ChevronRightIcon, ClipboardDocumentIcon, ChevronUpIcon, ChevronDownIcon, QuestionMarkCircleIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import FilePicker from '@/lib/components/FilePicker';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import NavigationManager from '@/lib/components/admin/NavigationManager';
import { logger } from '@/lib/utils/logger';

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
  custom_color_1?: string | null;
  custom_color_2?: string | null;
  custom_color_3?: string | null;
  custom_color_4?: string | null;
  custom_color_5?: string | null;
  site_title_en: string;
  site_title_ar: string;
  site_description_en: string;
  site_description_ar: string;
  site_logo_url?: string | null;
  site_logo_storage_type: string;
  site_favicon_url?: string | null;
  site_favicon_storage_type: string;
  og_image_url?: string | null;
  og_image_storage_type: string;
  site_keywords_en?: string | null;
  site_keywords_ar?: string | null;
  verify_html_url?: string | null;
  verify_css_url?: string | null;
  verify_taw_url?: string | null;
}

type SettingsTab = 'home-sections' | 'fonts' | 'themes' | 'site-settings' | 'navigation';

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
// Popular Color Palettes - Modern 5-Color Schemes
const COLOR_PALETTES = [
  { id: 'palette-1', name: 'Dark & Teal', nameAr: 'داكن وأزرق مخضر', colors: ['#222831', '#393E46', '#00ADB5', '#00FFF5', '#EEEEEE'] },
  { id: 'palette-2', name: 'Ocean Breeze', nameAr: 'نسيم المحيط', colors: ['#0AA1DD', '#71C9CE', '#A6E3E9', '#CBF1F5', '#FFFFFF'] },
  { id: 'palette-3', name: 'Navy & Violet', nameAr: 'أزرق غامق وبنفسجي', colors: ['#62CDFF', '#8FB8ED', '#C2BBF0', '#E8E2E2', '#FFFFFF'] },
  { id: 'palette-4', name: 'Warm Sunset', nameAr: 'غروب دافئ', colors: ['#6C5CE7', '#FD79A8', '#FDCB6E', '#FFEAA7', '#FFFFFF'] },
  { id: 'palette-5', name: 'Mint Fresh', nameAr: 'نعناع منعش', colors: ['#8D7B68', '#D0B8A8', '#DFD3C3', '#F8EDE3', '#FFFFFF'] },
  { id: 'palette-6', name: 'Purple Dream', nameAr: 'حلم بنفسجي', colors: ['#674188', '#C8A1E0', '#EFC3E6', '#F0C1E1', '#FDDBBB'] },
  { id: 'palette-7', name: 'Forest Green', nameAr: 'أخضر الغابة', colors: ['#222831', '#31363F', '#76ABAE', '#B2C8BA', '#EEEEEE'] },
  { id: 'palette-8', name: 'Coral Reef', nameAr: 'شعاب المرجان', colors: ['#E68369', '#FF9999', '#F9D5D3', '#FFE6E6', '#FFFFFF'] },
  { id: 'palette-9', name: 'Royal Blue', nameAr: 'أزرق ملكي', colors: ['#04364A', '#176B87', '#64CCC5', '#DAFFFB', '#FFFFFF'] },
  { id: 'palette-10', name: 'Sunny Day', nameAr: 'يوم مشمس', colors: ['#7743DB', '#C3ACD0', '#F7EFE5', '#FFFBF5', '#FFFFFF'] },
  { id: 'palette-11', name: 'Cotton Candy', nameAr: 'حلوى قطنية', colors: ['#674188', '#C8A1E0', '#F5C6EC', '#FFE6F7', '#FFFFFF'] },
  { id: 'palette-12', name: 'Vintage Rose', nameAr: 'وردة عتيقة', colors: ['#C63D2F', '#FF90BC', '#FFD1E3', '#FFF8E8', '#FFFFFF'] },
  { id: 'palette-13', name: 'Peachy Keen', nameAr: 'دراقي لطيف', colors: ['#D5B895', '#F7DCB9', '#FFE6C7', '#FFF6E9', '#FFFFFF'] },
  { id: 'palette-14', name: 'Sky Blue', nameAr: 'أزرق سماوي', colors: ['#4A7BB7', '#6FA3EC', '#96C7F2', '#BBDEFA', '#FFFFFF'] },
  { id: 'palette-15', name: 'Lavender Fields', nameAr: 'حقول خزامى', colors: ['#AF9BB6', '#D4B2D8', '#E7D4E8', '#EEE4E1', '#FFFFFF'] },
  { id: 'palette-16', name: 'Minty Green', nameAr: 'أخضر نعناعي', colors: ['#87A8A4', '#A7C4BC', '#BFD8D5', '#F2D8D8', '#FFFFFF'] },
  { id: 'palette-17', name: 'Sunset Glow', nameAr: 'توهج الغروب', colors: ['#BA90C6', '#E8A0BF', '#FFE5F1', '#FFF2F2', '#FFFFFF'] },
  { id: 'palette-18', name: 'Deep Ocean', nameAr: 'محيط عميق', colors: ['#0B2447', '#19376D', '#576CBC', '#A5D7E8', '#FFFFFF'] },
  { id: 'palette-19', name: 'Earthy Tones', nameAr: 'ألوان ترابية', colors: ['#454545', '#70483C', '#C4A77D', '#EAD196', '#FFFFFF'] },
  { id: 'palette-20', name: 'Blush Pink', nameAr: 'وردي خجول', colors: ['#EE6F6F', '#FFAAAA', '#FFE6E6', '#FFF9F9', '#FFFFFF'] },
  { id: 'palette-21', name: 'Clean Blue', nameAr: 'أزرق نظيف', colors: ['#1E3A5F', '#4A90E2', '#99C4F0', '#E4E9F2', '#FFFFFF'] },
  { id: 'palette-22', name: 'Fresh Green', nameAr: 'أخضر منعش', colors: ['#1B5E20', '#28A745', '#81C784', '#D4EDDA', '#FFFFFF'] },
  { id: 'palette-23', name: 'Soft Purple', nameAr: 'بنفسجي ناعم', colors: ['#4C1D95', '#7C3AED', '#A78BFA', '#E9E4F7', '#FFFFFF'] },
  { id: 'palette-24', name: 'Warm Orange', nameAr: 'برتقالي دافئ', colors: ['#B54708', '#FF8C42', '#FFB347', '#FFE8CC', '#FFFFFF'] },
  { id: 'palette-25', name: 'Cool Gray', nameAr: 'رمادي بارد', colors: ['#343A40', '#6C757D', '#ADB5BD', '#E9ECEF', '#FFFFFF'] },
  { id: 'palette-26', name: 'Bright Cyan', nameAr: 'سيان ساطع', colors: ['#006064', '#00BCD4', '#4DD0E1', '#CCFBFF', '#FFFFFF'] },
  { id: 'palette-27', name: 'Lime Fresh', nameAr: 'ليموني منعش', colors: ['#3F6212', '#84CC16', '#BEF264', '#E8FFB7', '#FFFFFF'] },
  { id: 'palette-28', name: 'Rose Quartz', nameAr: 'كوارتز وردي', colors: ['#880E4F', '#E91E63', '#F48FB1', '#FFD6E0', '#FFFFFF'] },
  { id: 'palette-29', name: 'Indigo Wave', nameAr: 'موجة نيلية', colors: ['#1A237E', '#3F51B5', '#7986CB', '#E0E3F5', '#FFFFFF'] },
  { id: 'palette-30', name: 'Amber Glow', nameAr: 'توهج كهرماني', colors: ['#B45309', '#FFC107', '#FFD54F', '#FFF3CD', '#FFFFFF'] },
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
    verify_html_url: '',
    verify_css_url: '',
    verify_taw_url: '',
  });
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [filePickerTarget, setFilePickerTarget] = useState<'logo' | 'favicon' | 'og_image' | null>(null);
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  
  // Local state for custom colors (before applying)
  const [customColors, setCustomColors] = useState({
    color1: '',
    color2: '',
    color3: '',
    color4: '',
    color5: '',
  });

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
            verify_html_url: data.data.verify_html_url || '',
            verify_css_url: data.data.verify_css_url || '',
            verify_taw_url: data.data.verify_taw_url || '',
          });
          // Initialize custom colors state with current values
          setCustomColors({
            color1: data.data.custom_color_1 || '',
            color2: data.data.custom_color_2 || '',
            color3: data.data.custom_color_3 || '',
            color4: data.data.custom_color_4 || '',
            color5: data.data.custom_color_5 || '',
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
      fetchData();
    } catch (err) {
      showError(language === 'ar' ? 'فشل إعادة الترتيب' : 'Failed to reorder');
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

  // Generate random hex color
  const generateRandomColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Handle random colors generation
  const handleRandomColors = () => {
    setCustomColors({
      color1: generateRandomColor(),
      color2: generateRandomColor(),
      color3: generateRandomColor(),
      color4: generateRandomColor(),
      color5: generateRandomColor(),
    });
  };

  // Handle applying custom colors
  const handleApplyCustomColors = async () => {
    await handleUpdateAppSettings({
      custom_color_1: customColors.color1 || null,
      custom_color_2: customColors.color2 || null,
      custom_color_3: customColors.color3 || null,
      custom_color_4: customColors.color4 || null,
      custom_color_5: customColors.color5 || null,
    });
  };

  const handleFileSelect = async (file: { file_url: string; file_size: number; width?: number; height?: number }) => {
    if (!filePickerTarget) return;

    logger.log('Selected file from library:', file);

    // Validate OG Image requirements
    if (filePickerTarget === 'og_image') {
      const maxSize = 600 * 1024; // 600 KB in bytes
      
      if (file.file_size > maxSize) {
        showError(
          language === 'ar'
            ? `حجم الصورة كبير جداً. يجب أن يكون أقل من 600 كيلوبايت. (الحجم الحالي: ${Math.round(file.file_size / 1024)} كيلوبايت)`
            : `Image size is too large. Must be less than 600 KB. (Current: ${Math.round(file.file_size / 1024)} KB)`
        );
        return;
      }

      // Check dimensions if available
      if (file.width && file.height) {
        if (file.width !== 1200 || file.height !== 630) {
          showError(
            language === 'ar'
              ? `أبعاد الصورة غير صحيحة. يجب أن تكون 1200x630 بكسل. (الأبعاد الحالية: ${file.width}x${file.height})`
              : `Image dimensions are incorrect. Must be 1200x630 pixels. (Current: ${file.width}x${file.height})`
          );
          return;
        }
      }
    }

    const updates: Partial<AppSettings> = {};
    
    if (filePickerTarget === 'logo') {
      updates.site_logo_url = file.file_url;
      updates.site_logo_storage_type = 'blob'; // Files from Style Library are always blob-stored
    } else if (filePickerTarget === 'favicon') {
      updates.site_favicon_url = file.file_url;
      updates.site_favicon_storage_type = 'blob';
    } else if (filePickerTarget === 'og_image') {
      updates.og_image_url = file.file_url;
      updates.og_image_storage_type = 'blob';
    }

    logger.log('Updating app settings with:', updates);
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
      case 'faq':
        return <QuestionMarkCircleIcon className="w-8 h-8" />;
      case 'magazines':
        return <BookOpenIcon className="w-8 h-8" />;
      default:
        return null;
    }
  };

  const getSectionTitle = (section_type: string) => {
    const titles: Record<string, Record<string, string>> = {
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
    const descriptions: Record<string, Record<string, string>> = {
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
    return <LoadingSpinner className="flex justify-center items-center py-12" size="lg" />;
  }

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          {t('admin.appSettings.title')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
          {t('admin.appSettings.subtitle')}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }} className="overflow-x-auto">
        <nav className="flex gap-2 sm:gap-4 min-w-max sm:min-w-0" dir={direction}>
          <button
            onClick={() => setActiveTab('home-sections')}
            className="px-3 sm:px-4 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base"
            style={{
              borderBottom: activeTab === 'home-sections' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'home-sections' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {t('admin.appSettings.settingsTabs.homeSections')}
          </button>
          <button
            onClick={() => setActiveTab('fonts')}
            className="px-3 sm:px-4 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base"
            style={{
              borderBottom: activeTab === 'fonts' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'fonts' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {t('admin.appSettings.settingsTabs.fonts')}
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className="px-3 sm:px-4 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base"
            style={{
              borderBottom: activeTab === 'themes' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'themes' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {t('admin.appSettings.settingsTabs.themes')}
          </button>
          <button
            onClick={() => setActiveTab('site-settings')}
            className="px-3 sm:px-4 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base"
            style={{
              borderBottom: activeTab === 'site-settings' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'site-settings' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {language === 'ar' ? 'معلومات التطبيق' : 'App Information'}
          </button>
          <button
            onClick={() => setActiveTab('navigation')}
            className="px-3 sm:px-4 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base"
            style={{
              borderBottom: activeTab === 'navigation' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'navigation' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {language === 'ar' ? 'التنقل' : 'Navigation'}
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
                      <div 
                        className="p-3 rounded-lg flex-shrink-0"
                        style={{
                          backgroundColor: section.is_visible ? 'var(--color-primary-light)' : 'var(--color-surface-hover)',
                          color: section.is_visible ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                        }}
                      >
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
                          title={language === 'ar' ? 'تحريك لأعلى' : 'Move up'}
                        >
                          <ChevronUpIcon className="w-5 h-5 text-gray-700 dark:text-zinc-300" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(section.section_type, 'down')}
                          disabled={index === sections.length - 1 || saving === section.section_type}
                          className="p-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                          className="relative inline-flex items-center h-7 rounded-full w-14 transition-all duration-200 ease-in-out focus:outline-none cursor-pointer flex-shrink-0"
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
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all"
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

        {/* Themes Tab - Color Palettes */}
        {activeTab === 'themes' && appSettings && (
          <div className="space-y-6">
            {/* Custom Colors Section */}
            <div 
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-900 rounded-xl shadow-lg p-6"
              style={{
                borderWidth: '3px',
                borderStyle: 'solid',
                borderColor: (appSettings.custom_color_1 || appSettings.custom_color_2 || appSettings.custom_color_3 || appSettings.custom_color_4 || appSettings.custom_color_5) 
                  ? '#16a34a' 
                  : 'rgb(191 219 254)', // blue-200
              }}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                  {(appSettings.custom_color_1 || appSettings.custom_color_2 || appSettings.custom_color_3 || appSettings.custom_color_4 || appSettings.custom_color_5) && (
                    <CheckIcon className="w-6 h-6 text-green-600" />
                  )}
                  {!(appSettings.custom_color_1 || appSettings.custom_color_2 || appSettings.custom_color_3 || appSettings.custom_color_4 || appSettings.custom_color_5) && (
                    <Cog6ToothIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  )}
                  {language === 'ar' ? 'الألوان المخصصة' : 'Custom Colors'}
                  {(appSettings.custom_color_1 || appSettings.custom_color_2 || appSettings.custom_color_3 || appSettings.custom_color_4 || appSettings.custom_color_5) && (
                    <span className="text-xs font-medium text-green-600 dark:text-green-500">
                      {language === 'ar' ? '(نشطة)' : '(Active)'}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  {language === 'ar'
                    ? 'اختر 5 ألوان مخصصة ثم انقر على "تطبيق الألوان المخصصة" لحفظها على الموقع بالكامل.'
                    : 'Choose 5 custom colors then click "Apply Custom Colors" to save them site-wide.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Color 1 - Primary */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-zinc-700">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    {language === 'ar' ? 'اللون الأساسي' : 'Primary Color'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">
                    {language === 'ar' ? 'للأزرار والروابط' : 'For buttons & links'}
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      type="color"
                      value={customColors.color1 || '#2563eb'}
                      onChange={(e) => setCustomColors({ ...customColors, color1: e.target.value })}
                      className="w-full h-12 rounded cursor-pointer border-2 border-gray-300 dark:border-zinc-600"
                    />
                    <input
                      type="text"
                      value={customColors.color1}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                          setCustomColors({ ...customColors, color1: value });
                        }
                      }}
                      placeholder="#2563eb"
                      className="w-full px-3 py-2 text-sm font-mono border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Color 2 - Secondary */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-zinc-700">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    {language === 'ar' ? 'اللون الثانوي' : 'Secondary Color'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">
                    {language === 'ar' ? 'للعناصر الثانوية' : 'For secondary elements'}
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      type="color"
                      value={customColors.color2 || '#64748b'}
                      onChange={(e) => setCustomColors({ ...customColors, color2: e.target.value })}
                      className="w-full h-12 rounded cursor-pointer border-2 border-gray-300 dark:border-zinc-600"
                    />
                    <input
                      type="text"
                      value={customColors.color2}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                          setCustomColors({ ...customColors, color2: value });
                        }
                      }}
                      placeholder="#64748b"
                      className="w-full px-3 py-2 text-sm font-mono border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Color 3 - Accent */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm border-2" style={{ borderColor: 'var(--color-accent)' }}>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-accent)' }}>
                    {language === 'ar' ? 'لون التمييز' : 'Accent Color'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">
                    {language === 'ar' ? 'للبادجات والعناصر المميزة' : 'For badges & highlights'}
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      type="color"
                      value={customColors.color3 || '#7c3aed'}
                      onChange={(e) => setCustomColors({ ...customColors, color3: e.target.value })}
                      className="w-full h-12 rounded cursor-pointer border-2 border-gray-300 dark:border-zinc-600"
                    />
                    <input
                      type="text"
                      value={customColors.color3}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                          setCustomColors({ ...customColors, color3: value });
                        }
                      }}
                      placeholder="#7c3aed"
                      className="w-full px-3 py-2 text-sm font-mono border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Color 4 - Background */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-zinc-700">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    {language === 'ar' ? 'لون الخلفية' : 'Background Color'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">
                    {language === 'ar' ? 'للصفحات والبطاقات' : 'For pages & cards'}
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      type="color"
                      value={customColors.color4 || '#ffffff'}
                      onChange={(e) => setCustomColors({ ...customColors, color4: e.target.value })}
                      className="w-full h-12 rounded cursor-pointer border-2 border-gray-300 dark:border-zinc-600"
                    />
                    <input
                      type="text"
                      value={customColors.color4}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                          setCustomColors({ ...customColors, color4: value });
                        }
                      }}
                      placeholder="#ffffff"
                      className="w-full px-3 py-2 text-sm font-mono border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Color 5 - Text */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-zinc-700">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    {language === 'ar' ? 'لون النص' : 'Text Color'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">
                    {language === 'ar' ? 'للنصوص الرئيسية' : 'For main text content'}
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      type="color"
                      value={customColors.color5 || '#0f172a'}
                      onChange={(e) => setCustomColors({ ...customColors, color5: e.target.value })}
                      className="w-full h-12 rounded cursor-pointer border-2 border-gray-300 dark:border-zinc-600"
                    />
                    <input
                      type="text"
                      value={customColors.color5}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                          setCustomColors({ ...customColors, color5: value });
                        }
                      }}
                      placeholder="#0f172a"
                      className="w-full px-3 py-2 text-sm font-mono border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              {(customColors.color1 || customColors.color2 || customColors.color3 || customColors.color4 || customColors.color5) && (
                <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">
                    {language === 'ar' ? 'معاينة مباشرة' : 'Live Preview'}
                  </h4>
                  <div className="flex gap-2 h-16 rounded-lg overflow-hidden shadow-md">
                    {customColors.color1 && (
                      <div className="flex-1" style={{ backgroundColor: customColors.color1 }} title={customColors.color1} />
                    )}
                    {customColors.color2 && (
                      <div className="flex-1" style={{ backgroundColor: customColors.color2 }} title={customColors.color2} />
                    )}
                    {customColors.color3 && (
                      <div className="flex-1" style={{ backgroundColor: customColors.color3 }} title={customColors.color3} />
                    )}
                    {customColors.color4 && (
                      <div className="flex-1" style={{ backgroundColor: customColors.color4 }} title={customColors.color4} />
                    )}
                    {customColors.color5 && (
                      <div className="flex-1" style={{ backgroundColor: customColors.color5 }} title={customColors.color5} />
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={handleApplyCustomColors}
                  disabled={saving === 'app-settings'}
                  className="flex-1 min-w-[160px] px-5 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving === 'app-settings' 
                    ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                    : (language === 'ar' ? 'تطبيق الألوان' : 'Apply Colors')}
                </button>
                
                <button
                  onClick={handleRandomColors}
                  disabled={saving === 'app-settings'}
                  className="flex-1 min-w-[160px] px-5 py-2.5 border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 bg-transparent text-gray-700 dark:text-zinc-300 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'ar' ? 'ألوان عشوائية' : 'Random Colors'}
                </button>
                
                <button
                  onClick={() => {
                    setCustomColors({ color1: '', color2: '', color3: '', color4: '', color5: '' });
                    handleUpdateAppSettings({
                      custom_color_1: null,
                      custom_color_2: null,
                      custom_color_3: null,
                      custom_color_4: null,
                      custom_color_5: null,
                    });
                  }}
                  disabled={saving === 'app-settings'}
                  className="px-5 py-2.5 border-2 border-gray-300 dark:border-zinc-600 hover:border-red-400 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 bg-transparent text-gray-700 dark:text-zinc-300 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                {language === 'ar' ? 'لوحات الألوان الشائعة' : 'Popular Color Palettes'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                {language === 'ar'
                  ? 'كل بطاقة تعرض 5 ألوان مع رموزها السداسية. انقر على البطاقة لاختيار اللوحة أو استخدم زر النسخ 📋 لنسخ اللون.'
                  : 'Each card shows 5 colors with hex codes. Click the card to select the palette or use the copy button 📋 to copy individual colors.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {COLOR_PALETTES.map((palette) => {
                const hasCustomColors = !!(appSettings.custom_color_1 || appSettings.custom_color_2 || appSettings.custom_color_3 || appSettings.custom_color_4 || appSettings.custom_color_5);
                const isSelected = appSettings.theme === palette.id && !hasCustomColors;
                
                return (
                  <div
                    key={palette.id}
                    className="bg-white dark:bg-zinc-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                    style={{
                      borderWidth: '3px',
                      borderStyle: 'solid',
                      borderColor: isSelected ? '#16a34a' : '#e5e7eb',
                    }}
                  >
                    {/* Palette Content */}
                    <div className="p-4 flex-1">
                      {/* Palette Name at Top */}
                      <div className="mb-3 text-center">
                        <h4 className="text-base font-bold text-gray-900 dark:text-zinc-100">
                          {language === 'ar' ? palette.nameAr : palette.name}
                        </h4>
                        {isSelected && (
                          <p className="text-xs text-green-600 dark:text-green-500 mt-1 font-semibold">
                            {language === 'ar' ? '✓ نشطة' : '✓ Active'}
                          </p>
                        )}
                      </div>

                      {/* Colors List - Each color beside its hex code */}
                      <div className="space-y-2">
                        {palette.colors.map((color, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                          >
                            {/* Color Swatch - 50% width */}
                            <div
                              className="flex-1 h-10 rounded-md border-2 border-gray-300 dark:border-zinc-600 shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                            
                            {/* Hex Code - 50% width */}
                            <span className="flex-1 font-mono text-sm font-semibold text-gray-800 dark:text-zinc-200 text-center">
                              {color}
                            </span>
                            
                            {/* Copy Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(color);
                                showSuccess(
                                  language === 'ar'
                                    ? `تم نسخ ${color}`
                                    : `Copied ${color}`
                                );
                              }}
                              className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded-full transition-colors flex-shrink-0"
                              title={language === 'ar' ? 'نسخ' : 'Copy'}
                            >
                              <ClipboardDocumentIcon className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Select Button at Bottom */}
                    <div className="border-t border-gray-200 dark:border-zinc-700 p-3">
                      <button
                        onClick={() => {
                          // Clear custom colors and set the palette theme
                          setCustomColors({ color1: '', color2: '', color3: '', color4: '', color5: '' });
                          handleUpdateAppSettings({ 
                            theme: palette.id,
                            custom_color_1: null,
                            custom_color_2: null,
                            custom_color_3: null,
                            custom_color_4: null,
                            custom_color_5: null,
                          });
                        }}
                        disabled={saving === 'app-settings' || isSelected}
                        className={`w-full py-2 px-4 rounded-full font-medium text-sm transition-all ${
                          isSelected
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-600 dark:border-green-500 cursor-default'
                            : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900'
                        } ${saving === 'app-settings' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isSelected 
                          ? (language === 'ar' ? '✓ مُفعّلة' : '✓ Active')
                          : (language === 'ar' ? 'اختيار' : 'Select Palette')
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Palette Preview - Only show when custom colors are NOT active */}
            {appSettings.theme && !(appSettings.custom_color_1 || appSettings.custom_color_2 || appSettings.custom_color_3 || appSettings.custom_color_4 || appSettings.custom_color_5) && (
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6" style={{
                borderWidth: '3px',
                borderStyle: 'solid',
                borderColor: '#16a34a',
              }}>
                <h4 className="font-semibold text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-green-600" />
                  {language === 'ar' ? 'اللوحة النشطة حالياً' : 'Currently Active Palette'}
                </h4>
                {(() => {
                  const activePalette = COLOR_PALETTES.find(p => p.id === appSettings.theme);
                  if (!activePalette) return null;
                  
                  return (
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      {/* Palette Preview */}
                      <div className="flex rounded-lg overflow-hidden h-16 w-full sm:w-64 shadow-md">
                        {activePalette.colors.map((color, index) => (
                          <div
                            key={index}
                            className="flex-1"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      
                      {/* Palette Info */}
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 dark:text-zinc-100">
                          {language === 'ar' ? activePalette.nameAr : activePalette.name}
                        </h5>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {activePalette.colors.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                navigator.clipboard.writeText(color);
                                showSuccess(
                                  language === 'ar'
                                    ? `تم نسخ ${color}`
                                    : `Copied ${color}`
                                );
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                              <span className="font-mono text-xs text-gray-700 dark:text-zinc-300">
                                {color}
                              </span>
                              <ClipboardDocumentIcon className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Active Custom Colors Preview - Only show when custom colors ARE active */}
            {(appSettings.custom_color_1 || appSettings.custom_color_2 || appSettings.custom_color_3 || appSettings.custom_color_4 || appSettings.custom_color_5) && (
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6" style={{
                borderWidth: '3px',
                borderStyle: 'solid',
                borderColor: '#16a34a',
              }}>
                <h4 className="font-semibold text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-green-600" />
                  {language === 'ar' ? 'الألوان المخصصة النشطة حالياً' : 'Currently Active Custom Colors'}
                </h4>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {/* Custom Colors Preview */}
                  <div className="flex rounded-lg overflow-hidden h-16 w-full sm:w-64 shadow-md">
                    {appSettings.custom_color_1 && (
                      <div className="flex-1" style={{ backgroundColor: appSettings.custom_color_1 }} title={appSettings.custom_color_1} />
                    )}
                    {appSettings.custom_color_2 && (
                      <div className="flex-1" style={{ backgroundColor: appSettings.custom_color_2 }} title={appSettings.custom_color_2} />
                    )}
                    {appSettings.custom_color_3 && (
                      <div className="flex-1" style={{ backgroundColor: appSettings.custom_color_3 }} title={appSettings.custom_color_3} />
                    )}
                    {appSettings.custom_color_4 && (
                      <div className="flex-1" style={{ backgroundColor: appSettings.custom_color_4 }} title={appSettings.custom_color_4} />
                    )}
                    {appSettings.custom_color_5 && (
                      <div className="flex-1" style={{ backgroundColor: appSettings.custom_color_5 }} title={appSettings.custom_color_5} />
                    )}
                  </div>
                  
                  {/* Custom Colors Info */}
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 dark:text-zinc-100">
                      {language === 'ar' ? 'الألوان المخصصة' : 'Custom Colors'}
                    </h5>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        { color: appSettings.custom_color_1, label: language === 'ar' ? 'أساسي' : 'Primary' },
                        { color: appSettings.custom_color_2, label: language === 'ar' ? 'ثانوي' : 'Secondary' },
                        { color: appSettings.custom_color_3, label: language === 'ar' ? 'تمييز' : 'Accent' },
                        { color: appSettings.custom_color_4, label: language === 'ar' ? 'خلفية' : 'Background' },
                        { color: appSettings.custom_color_5, label: language === 'ar' ? 'نص' : 'Text' },
                      ].filter(item => item.color).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            navigator.clipboard.writeText(item.color!);
                            showSuccess(
                              language === 'ar'
                                ? `تم نسخ ${item.color}`
                                : `Copied ${item.color}`
                            );
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <span className="text-xs text-gray-500 dark:text-zinc-400">{item.label}:</span>
                          <span className="font-mono text-xs text-gray-700 dark:text-zinc-300">
                            {item.color}
                          </span>
                          <ClipboardDocumentIcon className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                {language === 'ar' ? '🎨 كيفية استخدام الألوان' : '🎨 How to Use Colors'}
              </h4>
              <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: 'var(--color-primary-dark)' }}>
                <li>
                  {language === 'ar'
                    ? 'الألوان المخصصة (في الأعلى) تتفوق على لوحات الألوان عند تفعيلها'
                    : 'Custom colors (at top) override color palettes when activated'}
                </li>
                <li>
                  {language === 'ar'
                    ? 'كل بطاقة لوحة ألوان تعرض 5 ألوان مع رموزها السداسية'
                    : 'Each palette card shows 5 colors with their hex codes'}
                </li>
                <li>
                  {language === 'ar'
                    ? 'انقر على أي بطاقة لتفعيل اللوحة - مر فوقها لرؤية خيار الاختيار'
                    : 'Click any card to activate the palette - hover to see selection option'}
                </li>
                <li>
                  {language === 'ar'
                    ? 'استخدم زر النسخ 📋 بجوار كل لون لنسخ رمزه السداسي'
                    : 'Use the copy button 📋 next to each color to copy its hex code'}
                </li>
                <li>
                  {language === 'ar'
                    ? 'الإطار الأخضر مع علامة ✓ يشير إلى الألوان النشطة حالياً'
                    : 'Green border with ✓ indicates currently active colors'}
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

              {/* Verification Badge Links */}
              <div>
                <h4 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  {language === 'ar' ? 'روابط شارات التحقق (Footer)' : 'Verification Badge Links (Footer)'}
                </h4>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  {language === 'ar'
                    ? 'ستظهر هذه الشارات في تذييل الموقع. اتركها فارغة لإخفائها.'
                    : 'These badges will appear in the site footer. Leave empty to hide.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      {language === 'ar' ? 'رابط التحقق من HTML' : 'HTML Validation Link'}
                    </label>
                    <input
                      type="url"
                      value={siteSettings.verify_html_url}
                      onChange={(e) => setSiteSettings({ ...siteSettings, verify_html_url: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                      placeholder="https://validator.w3.org/..."
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      {language === 'ar' ? 'رابط التحقق من CSS' : 'CSS Validation Link'}
                    </label>
                    <input
                      type="url"
                      value={siteSettings.verify_css_url}
                      onChange={(e) => setSiteSettings({ ...siteSettings, verify_css_url: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                      placeholder="https://jigsaw.w3.org/css-validator/..."
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      {language === 'ar' ? 'رابط التحقق من TAW' : 'TAW Accessibility Link'}
                    </label>
                    <input
                      type="url"
                      value={siteSettings.verify_taw_url}
                      onChange={(e) => setSiteSettings({ ...siteSettings, verify_taw_url: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                      placeholder="https://www.tawdis.net/..."
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Style Library Notice */}
              <div 
                className="rounded-lg p-4 flex items-start gap-3"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--color-border)',
                }}
              >
                <PhotoIcon className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {language === 'ar' ? '📚 استخدم مكتبة الأنماط' : '📚 Use Style Library'}
                  </h4>
                  <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {language === 'ar'
                      ? 'يجب تحميل جميع الصور إلى مكتبة الأنماط أولاً. جميع الملفات في مكتبة الأنماط يتم تخزينها في Blob Storage.'
                      : 'All images must be uploaded to the Style Library first. All files in the Style Library are stored in Blob Storage.'}
                  </p>
                  <a
                    href="/admin/style-library"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
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
                    {language === 'ar' ? 'فتح مكتبة الأنماط' : 'Open Style Library'}
                    <ChevronRightIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Logo, Favicon, and OG Image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Header Logo (Wide) */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {language === 'ar' ? 'شعار الرأس (Header Logo)' : 'Header Logo (Wide)'}
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={appSettings.site_logo_url}
                          alt="Header Logo"
                          className="mx-auto h-12 w-auto object-contain"
                          loading="lazy"
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
                    {language === 'ar' ? 'اختيار شعار الرأس' : 'Select Header Logo'}
                  </button>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                    {language === 'ar'
                      ? 'صورة عريضة للرأس (PNG/SVG). قم بتحميل الصور إلى مكتبة الأنماط أولاً'
                      : 'Wide image for header (PNG/SVG). Upload images to Style Library first'}
                  </p>
                </div>

                {/* Favicon (Square) */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {language === 'ar' ? 'أيقونة المتصفح (Favicon)' : 'Browser Tab Icon (Square)'}
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
                    {appSettings.site_favicon_url ? (
                      <div className="space-y-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={appSettings.site_favicon_url}
                          alt="Favicon"
                          className="mx-auto h-12 w-12 object-contain"
                          loading="lazy"
                        />
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          {language === 'ar' ? 'الأيقونة الحالية' : 'Current favicon'}
                        </p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <PhotoIcon className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--color-text-tertiary)' }} />
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {language === 'ar' ? 'لا توجد أيقونة' : 'No favicon uploaded'}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilePickerTarget('favicon');
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
                    {language === 'ar' ? 'اختيار أيقونة المتصفح' : 'Select Favicon'}
                  </button>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                    {language === 'ar'
                      ? 'صورة مربعة صغيرة (32x32 أو 64x64). قم بتحميل الصور إلى مكتبة الأنماط أولاً'
                      : 'Small square image (32x32 or 64x64). Upload to Style Library first'}
                  </p>
                </div>

                {/* OG Image */}
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={appSettings.og_image_url}
                          alt="OG Image"
                          className="mx-auto h-20 w-auto object-cover rounded"
                          loading="lazy"
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
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid rgb(59, 130, 246)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'rgb(30, 64, 175)' }}>
                      {language === 'ar' ? 'ℹ️ متطلبات الصورة' : 'ℹ️ Image Requirements'}
                    </p>
                    <ul className="text-xs space-y-1" style={{ color: 'rgb(30, 64, 175)' }}>
                      <li>• {language === 'ar' ? 'الأبعاد: 1200 × 630 بكسل (إلزامي)' : 'Dimensions: 1200 × 630 pixels (required)'}</li>
                      <li>• {language === 'ar' ? 'حجم الملف: أقل من 600 كيلوبايت (إلزامي)' : 'File size: Less than 600 KB (required)'}</li>
                      <li>• {language === 'ar' ? 'قم بتحميل الصور إلى مكتبة الأنماط أولاً' : 'Upload to Style Library first'}</li>
                    </ul>
                  </div>
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
                      ? 'جميع الصور يجب تحميلها إلى مكتبة الأنماط أولاً (تخزين Blob)'
                      : 'All images must be uploaded to Style Library first (Blob storage)'}
                  </li>
                  <li>
                    {language === 'ar'
                      ? 'شعار الرأس: صورة عريضة تظهر في شريط التنقل'
                      : 'Header Logo: Wide image displayed in the navigation bar'}
                  </li>
                  <li>
                    {language === 'ar'
                      ? 'أيقونة المتصفح: صورة مربعة صغيرة تظهر في علامة تبويب المتصفح'
                      : 'Favicon: Small square image shown in the browser tab'}
                  </li>
                  <li>
                    {language === 'ar'
                      ? 'صورة OG: تظهر عند مشاركة الموقع على وسائل التواصل الاجتماعي'
                      : 'OG Image: Appears when sharing the site on social media'}
                  </li>
                  <li>
                    {language === 'ar'
                      ? 'الإعدادات تؤثر على العنوان والوصف في نتائج محركات البحث'
                      : 'Settings affect the title and description in search engine results'}
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

        {/* Navigation Tab */}
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                {language === 'ar' ? 'إدارة التنقل' : 'Navigation Management'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                {language === 'ar'
                  ? 'قم بإدارة عناصر التنقل في الرأس والتذييل'
                  : 'Manage header and footer navigation items'}
              </p>
            </div>

            {/* Navigation Manager Component */}
            <NavigationManager />
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
            ? (language === 'ar' ? 'اختر شعار الرأس من المكتبة' : 'Select Header Logo from Library')
            : filePickerTarget === 'favicon'
            ? (language === 'ar' ? 'اختر أيقونة المتصفح من المكتبة' : 'Select Favicon from Library')
            : (language === 'ar' ? 'اختر صورة المشاركة من المكتبة' : 'Select OG Image from Library')
        }
      />
    </div>
  );
}
