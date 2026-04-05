'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import FilePicker from '@/lib/components/FilePicker';

interface Partner {
  id: string;
  title_en: string;
  title_ar: string;
  image_url: string;
  url: string;
  storage_type: string;
  is_featured: boolean;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
  createdByUser?: { name: string | null; email: string };
  updatedByUser?: { name: string | null; email: string };
}

interface PartnerFormProps {
  partner: Partner | null;
  onClose: () => void;
}

export default function PartnerForm({ partner, onClose }: PartnerFormProps) {
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoSource, setLogoSource] = useState<'library' | 'upload' | null>(null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [websiteUrlError, setWebsiteUrlError] = useState('');

  const { language, direction } = useLanguage();

  useEffect(() => {
    if (partner) {
      setTitleEn(partner.title_en || '');
      setTitleAr(partner.title_ar || '');
      setWebsiteUrl(partner.url);
      setIsFeatured(partner.is_featured);
      setIsVisible(partner.is_visible);
      setLogoUrl(partner.image_url);
      setLogoPreview(partner.image_url);
    }
  }, [partner]);

  // Real-time website URL validation
  const handleWebsiteUrlChange = (value: string) => {
    setWebsiteUrl(value);
    
    if (value && !value.match(/^https?:\/\/.+/)) {
      setWebsiteUrlError(
        language === 'ar' 
          ? 'الرابط يجب أن يبدأ بـ http:// أو https://' 
          : 'URL must start with http:// or https://'
      );
    } else {
      setWebsiteUrlError('');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(language === 'ar' ? 'الرجاء اختيار ملف صورة' : 'Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError(language === 'ar' ? 'حجم الملف يتجاوز 5 ميجابايت' : 'File size exceeds 5MB');
      return;
    }

    // Validate MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError(language === 'ar' ? 'نوع الملف غير صالح. المسموح: JPEG, PNG, GIF, WebP, SVG' : 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG');
      return;
    }

    setLogoFile(file);
    setLogoSource('upload'); // Mark as uploaded file (local storage)
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setError('');
  };

  const handleFileSelect = (file: any) => {
    setLogoUrl(file.file_url);
    setLogoPreview(file.file_url);
    setLogoFile(null);
    setLogoSource('library'); // Mark as from style library (blob storage)
    setShowFilePicker(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation - both titles are required
    if (!titleEn || !titleAr) {
      setError(language === 'ar' ? 'يجب إدخال الأسماء بكلا اللغتين' : 'Both names (EN/AR) are required');
      return;
    }

    // Title length validation
    if (titleEn.length > 255 || titleAr.length > 255) {
      setError(language === 'ar' ? 'الأسماء يجب أن لا تتجاوز 255 حرف' : 'Names must be max 255 characters');
      return;
    }

    if (!logoUrl && !logoFile) {
      setError(language === 'ar' ? 'يجب اختيار شعار' : 'Logo is required');
      return;
    }

    // Website URL validation
    if (!websiteUrl) {
      setError(language === 'ar' ? 'يجب إدخال رابط الموقع' : 'Website URL is required');
      return;
    }

    if (!websiteUrl.match(/^https?:\/\/.+/)) {
      setError(language === 'ar' ? 'الرابط يجب أن يبدأ بـ http:// أو https://' : 'URL must start with http:// or https://');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('title_en', titleEn);
      formData.append('title_ar', titleAr);
      formData.append('url', websiteUrl); // Changed from 'website_url' to 'url'
      formData.append('is_featured', String(isFeatured));
      formData.append('is_visible', String(isVisible));
      
      if (logoFile) {
        formData.append('image', logoFile); // Changed from 'logo' to 'image'
      } else if (logoUrl) {
        formData.append('image_url', logoUrl); // Changed from 'logo_url' to 'image_url'
      }

      const url = partner ? `/api/partners/${partner.id}` : '/api/partners';
      const method = partner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save partner');
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" dir={direction}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-zinc-100">
            {partner
              ? language === 'ar'
                ? 'تعديل الشريك'
                : 'Edit Partner'
              : language === 'ar'
              ? 'إضافة شريك جديد'
              : 'Add New Partner'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title EN */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                {language === 'ar' ? 'اسم الشريك (إنجليزي)' : 'Partner Name (English)'} *
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all"
                maxLength={255}
                required
              />
            </div>

            {/* Title AR */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                {language === 'ar' ? 'اسم الشريك (عربي)' : 'Partner Name (Arabic)'} *
              </label>
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-right"
                dir="rtl"
                maxLength={255}
                required
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                {language === 'ar' ? 'رابط الموقع' : 'Website URL'} *
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => handleWebsiteUrlChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 ${
                  websiteUrlError 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-zinc-700'
                }`}
                placeholder="https://example.com"
                required
              />
              {websiteUrlError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{websiteUrlError}</p>
              )}
              {websiteUrl && !websiteUrlError && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  {language === 'ar' ? '✓ رابط صالح' : '✓ Valid URL'}
                </p>
              )}
            </div>

            {/* Logo Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                {language === 'ar' ? 'الشعار' : 'Logo'} *
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setShowFilePicker(true)}
                  className="flex-1 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-all text-sm"
                >
                  {language === 'ar' ? 'اختر من المكتبة' : 'Choose from Library'}
                </button>
                <label className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors cursor-pointer text-center">
                  {language === 'ar' ? 'رفع ملف جديد' : 'Upload New File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {logoPreview && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="max-w-xs h-32 object-contain rounded-lg bg-gray-100 dark:bg-zinc-800 p-4"
                  />
                </div>
              )}

              {/* Storage Type Display */}
              {logoSource && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {language === 'ar' ? 'نوع التخزين:' : 'Storage Type:'}
                    </span>
                    <span className={
                      `text-sm px-2 py-1 rounded font-semibold ${
                        logoSource === 'library'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                      }`
                    }>
                      {logoSource === 'library' 
                        ? (language === 'ar' ? '☁️ مكتبة الأنماط' : '☁️ Style Library (Blob)') 
                        : (language === 'ar' ? '💾 رفع محلي' : '💾 Local Upload')}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {logoSource === 'library'
                      ? (language === 'ar' 
                          ? 'صورة من مكتبة الأنماط (Vercel Blob)' 
                          : 'Logo from style library (Vercel Blob storage)')
                      : (language === 'ar' 
                          ? 'صورة مرفوعة مباشرة (تخزين محلي)' 
                          : 'Uploaded logo file (local blob storage)')}
                  </p>
                </div>
              )}
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                {language === 'ar' ? 'مميز (يظهر أولاً)' : 'Featured (appears first)'}
              </label>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_visible"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="is_visible" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                {language === 'ar' ? 'مرئي للعامة' : 'Visible to Public'}
              </label>
            </div>

            {/* Audit Trail (read-only, only in edit mode) */}
            {partner && (partner.createdByUser || partner.updatedByUser) && (
              <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg space-y-2 text-sm">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
                  {language === 'ar' ? 'معلومات التدقيق' : 'Audit Trail'}
                </h3>
                {partner.createdByUser && (
                  <p className="text-gray-600 dark:text-zinc-400">
                    <span className="font-medium">{language === 'ar' ? 'أُنشئ بواسطة:' : 'Created by:'}</span>{' '}
                    {partner.createdByUser.name || partner.createdByUser.email}
                    {partner.created_at && (
                      <span className="text-xs ml-2">
                        ({new Date(partner.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')})
                      </span>
                    )}
                  </p>
                )}
                {partner.updatedByUser && (
                  <p className="text-gray-600 dark:text-zinc-400">
                    <span className="font-medium">{language === 'ar' ? 'آخر تحديث بواسطة:' : 'Last updated by:'}</span>{' '}
                    {partner.updatedByUser.name || partner.updatedByUser.email}
                    {partner.updated_at && (
                      <span className="text-xs ml-2">
                        ({new Date(partner.updated_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')})
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 bg-transparent transition-all font-medium text-sm"
                disabled={loading}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium transition-all text-sm disabled:opacity-50"
                disabled={loading || !!websiteUrlError}
              >
                {loading
                  ? language === 'ar'
                    ? 'جاري الحفظ...'
                    : 'Saving...'
                  : language === 'ar'
                  ? 'حفظ'
                  : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* File Picker Modal */}
      {showFilePicker && (
        <FilePicker
          isOpen={showFilePicker}
          onClose={() => setShowFilePicker(false)}
          onSelect={handleFileSelect}
          fileType="image"
          title={language === 'ar' ? 'اختر شعار' : 'Select Logo'}
        />
      )}
    </div>
  );
}
