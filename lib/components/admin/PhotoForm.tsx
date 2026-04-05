'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import FilePicker from '@/lib/components/FilePicker';

interface Photo {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  image_url: string;
  storage_type: string;
  published_date: string;
  is_featured: boolean;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
  createdByUser?: { name: string | null; email: string };
  updatedByUser?: { name: string | null; email: string };
}

interface PhotoFormProps {
  photo: Photo | null;
  onClose: () => void;
}

export default function PhotoForm({ photo, onClose }: PhotoFormProps) {
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageSource, setImageSource] = useState<'library' | 'upload' | null>(null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const { language, direction } = useLanguage();

  useEffect(() => {
    if (photo) {
      setTitleEn(photo.title_en || '');
      setTitleAr(photo.title_ar || '');
      setDescriptionEn(photo.description_en || '');
      setDescriptionAr(photo.description_ar || '');
      setPublishedDate(photo.published_date.split('T')[0]);
      setIsFeatured(photo.is_featured);
      setIsVisible(photo.is_visible);
      setImageUrl(photo.image_url);
      setImagePreview(photo.image_url);
      // Detect source based on storage_type
      setImageSource(photo.storage_type === 'blob' ? 'library' : 'upload');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setPublishedDate(today);
    }
  }, [photo]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(language === 'ar' ? 'الرجاء اختيار ملف صورة' : 'Please select an image file');
      return;
    }

    // Validate file size (5MB limit for photos)
    if (file.size > 5 * 1024 * 1024) {
      setError(language === 'ar' ? 'حجم الملف يتجاوز 5 ميجابايت' : 'File size exceeds 5MB');
      return;
    }

    // Validate MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(language === 'ar' ? 'نوع الملف غير صالح. المسموح: JPEG, PNG, GIF, WebP' : 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
      return;
    }

    setImageFile(file);
    setImageSource('upload'); // Mark as uploaded file (local storage)
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setError('');
  };

  const handleFileSelect = (file: any) => {
    setImageUrl(file.file_url);
    setImagePreview(file.file_url);
    setImageFile(null);
    setImageSource('library'); // Mark as from style library (blob storage)
    setShowFilePicker(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation - both titles are required
    if (!titleEn || !titleAr) {
      setError(language === 'ar' ? 'يجب إدخال العناوين بكلا اللغتين' : 'Both titles (EN/AR) are required');
      return;
    }

    // Title length validation
    if (titleEn.length > 255 || titleAr.length > 255) {
      setError(language === 'ar' ? 'العناوين يجب أن لا تتجاوز 255 حرف' : 'Titles must be max 255 characters');
      return;
    }

    if (!imageUrl && !imageFile) {
      setError(language === 'ar' ? 'يجب اختيار صورة' : 'Image is required');
      return;
    }

    if (!publishedDate) {
      setError(language === 'ar' ? 'يجب إدخال تاريخ النشر' : 'Published date is required');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('title_en', titleEn);
      formData.append('title_ar', titleAr);
      formData.append('description_en', descriptionEn || '');
      formData.append('description_ar', descriptionAr || '');
      formData.append('published_date', new Date(publishedDate).toISOString());
      formData.append('is_featured', String(isFeatured));
      formData.append('is_visible', String(isVisible));
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('image_url', imageUrl);
      }

      const url = photo ? `/api/photos/${photo.id}` : '/api/photos';
      const method = photo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save photo');
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
            {photo
              ? language === 'ar'
                ? 'تعديل الصورة'
                : 'Edit Photo'
              : language === 'ar'
              ? 'إضافة صورة جديدة'
              : 'Add New Photo'}
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
                {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'} *
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                maxLength={255}
                required
              />
            </div>

            {/* Title AR */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'} *
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

            {/* Description EN */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
              </label>
              <textarea
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
              />
            </div>

            {/* Description AR */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
              </label>
              <textarea
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-right"
                dir="rtl"
              />
            </div>

            {/* Image Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                {language === 'ar' ? 'الصورة' : 'Image'} *
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setShowFilePicker(true)}
                  className="flex-1 px-5 py-2.5 border-2 border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 rounded-full font-medium hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-sm"
                >
                  {language === 'ar' ? 'اختر من المكتبة' : 'Select from Media Library'}
                </button>
                <label className="flex-1 px-4 py-3 border-2 border-green-300 dark:border-green-600 text-green-600 dark:text-green-400 rounded-full font-medium hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all cursor-pointer text-center text-sm">
                  {language === 'ar' ? 'رفع ملف جديد' : 'Upload New File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Storage Type Display */}
              {imageSource && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {language === 'ar' ? 'نوع التخزين:' : 'Storage Type:'}
                    </span>
                    <span className={
                      `text-sm px-2 py-1 rounded font-semibold ${
                        imageSource === 'library'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                      }`
                    }>
                      {imageSource === 'library' 
                        ? (language === 'ar' ? '☁️ مكتبة الأنماط' : '☁️ Style Library (Blob)') 
                        : (language === 'ar' ? '💾 رفع محلي' : '💾 Local Upload')}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {imageSource === 'library'
                      ? (language === 'ar' 
                          ? 'صورة من مكتبة الأنماط (Vercel Blob)' 
                          : 'Image from style library (Vercel Blob storage)')
                      : (language === 'ar' 
                          ? 'صورة مرفوعة مباشرة (تخزين محلي)' 
                          : 'Uploaded image file (local blob storage)')}
                  </p>
                </div>
              )}
            </div>

            {/* Published Date */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                {language === 'ar' ? 'تاريخ النشر' : 'Published Date'} *
              </label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                required
              />
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
            {photo && (photo.createdByUser || photo.updatedByUser) && (
              <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg space-y-2 text-sm">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
                  {language === 'ar' ? 'معلومات التدقيق' : 'Audit Trail'}
                </h3>
                <p className="text-gray-600 dark:text-zinc-400">
                  <span className="font-medium">{language === 'ar' ? 'نوع التخزين:' : 'Storage Type:'}</span>{' '}
                  <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold">
                    {photo.storage_type === 'blob' 
                      ? (language === 'ar' ? 'مكتبة الأنماط' : 'Style Library')
                      : (language === 'ar' ? 'رفع محلي' : 'Local Upload')}
                  </span>
                </p>
                {photo.createdByUser && (
                  <p className="text-gray-600 dark:text-zinc-400">
                    <span className="font-medium">{language === 'ar' ? 'أُنشئ بواسطة:' : 'Created by:'}</span>{' '}
                    {photo.createdByUser.name || photo.createdByUser.email}
                    {photo.created_at && (
                      <span className="text-xs ml-2">
                        ({new Date(photo.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')})
                      </span>
                    )}
                  </p>
                )}
                {photo.updatedByUser && (
                  <p className="text-gray-600 dark:text-zinc-400">
                    <span className="font-medium">{language === 'ar' ? 'آخر تحديث بواسطة:' : 'Last updated by:'}</span>{' '}
                    {photo.updatedByUser.name || photo.updatedByUser.email}
                    {photo.updated_at && (
                      <span className="text-xs ml-2">
                        ({new Date(photo.updated_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')})
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
                disabled={loading}
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
          title={language === 'ar' ? 'اختر صورة' : 'Select Image'}
        />
      )}
    </div>
  );
}
