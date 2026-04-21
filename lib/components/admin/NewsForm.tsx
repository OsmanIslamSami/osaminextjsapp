'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import FilePicker from '@/lib/components/FilePicker';

interface News {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  image_url: string;
  storage_type: string;
  published_date: string;
  is_visible: boolean;
}

interface NewsFormProps {
  news: News | null;
  onClose: () => void;
}

export default function NewsForm({ news, onClose }: NewsFormProps) {
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [storageType, setStorageType] = useState<'blob' | 'local'>('blob');
  const [fileData, setFileData] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [mimeType, setMimeType] = useState('');
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const { language, direction } = useLanguage();

  useEffect(() => {
    if (news) {
      setTitleEn(news.title_en || '');
      setTitleAr(news.title_ar || '');
      setPublishedDate(news.published_date.split('T')[0]);
      setIsVisible(news.is_visible);
      setImageUrl(news.image_url);
      setStorageType(news.storage_type as 'blob' | 'local');
      setImagePreview(news.storage_type === 'blob' ? news.image_url : `/api/news/media/${news.id}`);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setPublishedDate(today);
    }
  }, [news]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(language === 'ar' ? 'الرجاء اختيار ملف صورة' : 'Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(language === 'ar' ? 'حجم الملف يتجاوز 10 ميجابايت' : 'File size exceeds 10MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/news/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      setFileData(data.file_data);
      setFileName(data.file_name);
      setFileSize(data.file_size);
      setMimeType(data.mime_type);
      setStorageType('local');
      setImageUrl(`/api/news/upload/${Date.now()}`); // Temporary URL (will be replaced with media ID after save)
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setError('');
    } catch (err) {
      setError(language === 'ar' ? 'فشل رفع الملف' : 'Failed to upload file');
    }
  };

  const handleFileSelect = (file: { file_url: string }) => {
    setImageUrl(file.file_url);
    setStorageType('blob');
    setImagePreview(file.file_url);
    setFileData('');
    setFileName('');
    setFileSize(0);
    setMimeType('');
    setShowFilePicker(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!titleEn && !titleAr) {
      setError(language === 'ar' ? 'يجب إدخال عنوان واحد على الأقل' : 'At least one title is required');
      return;
    }

    if (!imageUrl && !fileData) {
      setError(language === 'ar' ? 'يجب اختيار صورة' : 'Image is required');
      return;
    }

    if (!publishedDate) {
      setError(language === 'ar' ? 'يجب إدخال تاريخ النشر' : 'Published date is required');
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        title_en: titleEn || null,
        title_ar: titleAr || null,
        image_url: imageUrl,
        storage_type: storageType,
        published_date: new Date(publishedDate).toISOString(),
        is_visible: isVisible,
      };

      if (storageType === 'local' && fileData) {
        payload.file_data = fileData;
        payload.file_name = fileName;
        payload.file_size = fileSize;
        payload.mime_type = mimeType;
      }

      const url = news ? `/api/news/${news.id}` : '/api/news';
      const method = news ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save news');
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
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" dir={direction}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-zinc-100">
            {news
              ? language === 'ar'
                ? 'تعديل الخبر'
                : 'Edit News'
              : language === 'ar'
              ? 'إضافة خبر جديد'
              : 'Add New News'}
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
                {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all"
                maxLength={500}
              />
            </div>

            {/* Title AR */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
              </label>
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-right focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all"
                dir="rtl"
                maxLength={500}
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
                <div className="mt-2 relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-48 object-cover rounded-lg"
                  />
                  <span className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200">
                    {storageType === 'blob' ? 'Blob' : 'Local'}
                  </span>
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
