'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { PhotoIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import FilePicker from '@/lib/components/FilePicker';

interface MagazineFormProps {
  magazine?: {
    id: string;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    image_url: string;
    storage_type?: string;
    download_link: string;
    published_date: string;
  };
  onSuccess?: () => void;
}

export default function MagazineForm({ magazine, onSuccess }: MagazineFormProps) {
  const { t, language, direction } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(magazine?.image_url || null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [storageType, setStorageType] = useState<'blob' | 'upload'>(magazine?.storage_type as 'blob' | 'upload' || 'upload');

  const [formData, setFormData] = useState({
    title_en: magazine?.title_en || '',
    title_ar: magazine?.title_ar || '',
    description_en: magazine?.description_en || '',
    description_ar: magazine?.description_ar || '',
    published_date: magazine?.published_date 
      ? new Date(magazine.published_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    image_url: magazine?.image_url || '',
  });

  const [files, setFiles] = useState<{
    cover_image: File | null;
    pdf_file: File | null;
  }>({
    cover_image: null,
    pdf_file: null,
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles({ ...files, cover_image: file });
      setStorageType('upload');
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
        setFormData({ ...formData, image_url: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectFromLibrary = (file: { file_url: string; file_type: string }) => {
    setCoverPreview(file.file_url);
    setFormData({ ...formData, image_url: file.file_url });
    setFiles({ ...files, cover_image: null });
    setStorageType('blob');
  };

  const handlePDFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles({ ...files, pdf_file: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title_en', formData.title_en);
      formDataToSend.append('title_ar', formData.title_ar);
      formDataToSend.append('description_en', formData.description_en);
      formDataToSend.append('description_ar', formData.description_ar);
      formDataToSend.append('published_date', formData.published_date);
      formDataToSend.append('storage_type', storageType);

      if (storageType === 'blob' && formData.image_url) {
        formDataToSend.append('image_url', formData.image_url);
      } else if (files.cover_image) {
        formDataToSend.append('cover_image', files.cover_image);
      }

      if (files.pdf_file) {
        formDataToSend.append('pdf_file', files.pdf_file);
      }

      const url = magazine ? `/api/magazines/${magazine.id}` : '/api/magazines';
      const method = magazine ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save Magazine');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/magazines');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save Magazine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={direction}>
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* English Title */}
      <div>
        <label htmlFor="title_en" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
        </label>
        <input
          type="text"
          id="title_en"
          value={formData.title_en}
          onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500"
          required
          maxLength={500}
        />
      </div>

      {/* Arabic Title */}
      <div>
        <label htmlFor="title_ar" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
        </label>
        <input
          type="text"
          id="title_ar"
          value={formData.title_ar}
          onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500"
          required
          maxLength={500}
          dir="rtl"
        />
      </div>

      {/* English Description */}
      <div>
        <label htmlFor="description_en" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
        </label>
        <textarea
          id="description_en"
          value={formData.description_en}
          onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 min-h-[120px]"
          required
        />
      </div>

      {/* Arabic Description */}
      <div>
        <label htmlFor="description_ar" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
        </label>
        <textarea
          id="description_ar"
          value={formData.description_ar}
          onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 min-h-[120px]"
          required
          dir="rtl"
        />
      </div>

      {/* Published Date */}
      <div>
        <label htmlFor="published_date" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          {language === 'ar' ? 'تاريخ النشر' : 'Published Date'}
        </label>
        <input
          type="date"
          id="published_date"
          value={formData.published_date}
          onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500"
          required
        />
      </div>

      {/* Cover Image */}
      <div>
        <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          {language === 'ar' ? 'صورة الغلاف' : 'Cover Image'} {!magazine && <span className="text-red-500">*</span>}
        </label>
        
        <div className="flex gap-3 mb-2">
          <button
            type="button"
            onClick={() => setShowFilePicker(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-2xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <PhotoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {language === 'ar' ? 'اختر من المكتبة' : 'Choose from Library'}
            </span>
          </button>
          
          <div className="flex-1">
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-2xl hover:border-gray-400 dark:hover:border-zinc-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
              <input
                type="file"
                id="cover_image"
                accept="image/*"
                onChange={handleCoverChange}
                required={!magazine && !coverPreview}
                className="hidden"
              />
              <span className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                {language === 'ar' ? 'أو ارفع صورة جديدة' : 'Or Upload New'}
              </span>
            </label>
          </div>
        </div>

        {/* Storage Type Indicator */}
        {coverPreview && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {language === 'ar' ? 'نوع التخزين:' : 'Storage Type:'}
              </span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                storageType === 'blob' 
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' 
                  : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
              }`}>
                {storageType === 'blob' ? '☁️ Vercel Blob' : '💾 Upload'}
              </span>
            </div>
          </div>
        )}

        {coverPreview && (
          <div className="mt-4">
            <img src={coverPreview} alt="Preview" className="w-48 h-64 object-cover rounded-lg shadow-md" />
          </div>
        )}
      </div>

      {/* PDF File */}
      <div>
        <label htmlFor="pdf_file" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          {language === 'ar' ? 'ملف PDF' : 'PDF File'} {!magazine && <span className="text-red-500">*</span>}
        </label>
        <input
          type="file"
          id="pdf_file"
          accept=".pdf"
          onChange={handlePDFChange}
          required={!magazine}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500"
        />
        {files.pdf_file && (
          <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
            {language === 'ar' ? 'تم اختيار: ' : 'Selected: '}{files.pdf_file.name}
          </p>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px] flex items-center justify-center"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            language === 'ar' ? (magazine ? 'تحديث' : 'إنشاء') : (magazine ? 'Update' : 'Create')
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded-full font-medium hover:border-gray-400 dark:hover:border-zinc-500 transition-all min-h-[48px]"
        >
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
      </div>

      {/* File Picker Modal */}
      <FilePicker
        isOpen={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onSelect={handleSelectFromLibrary}
        fileType="image"
        title={language === 'ar' ? 'اختر صورة الغلاف' : 'Select Cover Image'}
      />
    </form>
  );
}
