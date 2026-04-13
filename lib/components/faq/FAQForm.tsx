'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { FAQFormData } from '@/lib/types';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';

interface FAQFormProps {
  initialData?: Partial<FAQFormData>;
  onSubmit: (data: FAQFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function FAQForm({ initialData, onSubmit, isLoading }: FAQFormProps) {
  const {  t, language, direction } = useTranslation();
  const [formData, setFormData] = useState<FAQFormData>({
    question_en: initialData?.question_en || '',
    question_ar: initialData?.question_ar || '',
    answer_en: initialData?.answer_en || '',
    answer_ar: initialData?.answer_ar || '',
    is_favorite: initialData?.is_favorite || false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.question_en.trim()) {
      newErrors.question_en = 'English question is required';
    } else if (formData.question_en.length > 500) {
      newErrors.question_en = 'Question must not exceed 500 characters';
    }
    
    if (!formData.question_ar.trim()) {
      newErrors.question_ar = 'Arabic question is required';
    } else if (formData.question_ar.length > 500) {
      newErrors.question_ar = 'Question must not exceed 500 characters';
    }
    
    if (!formData.answer_en.trim()) {
      newErrors.answer_en = 'English answer is required';
    }
    
    if (!formData.answer_ar.trim()) {
      newErrors.answer_ar = 'Arabic answer is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    await onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} dir={direction} className="space-y-6">
      {/* English Question */}
      <div>
        <label htmlFor="question_en" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          English Question <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="question_en"
          value={formData.question_en}
          onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all"
          placeholder="Enter question in English"
          maxLength={500}
          disabled={isLoading}
        />
        {errors.question_en && (
          <p className="mt-1 text-sm text-red-600">{errors.question_en}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
          {formData.question_en.length}/500 characters
        </p>
      </div>
      
      {/* Arabic Question */}
      <div>
        <label htmlFor="question_ar" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          Arabic Question <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="question_ar"
          value={formData.question_ar}
          onChange={(e) => setFormData({ ...formData, question_ar: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all"
          placeholder="أدخل السؤال بالعربية"
          maxLength={500}
          dir="rtl"
          disabled={isLoading}
        />
        {errors.question_ar && (
          <p className="mt-1 text-sm text-red-600">{errors.question_ar}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
          {formData.question_ar.length}/500 characters
        </p>
      </div>
      
      {/* English Answer */}
      <div>
        <label htmlFor="answer_en" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          English Answer <span className="text-red-500">*</span>
        </label>
        <textarea
          id="answer_en"
          value={formData.answer_en}
          onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })}
          rows={5}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all resize-y"
          placeholder="Enter answer in English"
          disabled={isLoading}
        />
        {errors.answer_en && (
          <p className="mt-1 text-sm text-red-600">{errors.answer_en}</p>
        )}
      </div>
      
      {/* Arabic Answer */}
      <div>
        <label htmlFor="answer_ar" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          Arabic Answer <span className="text-red-500">*</span>
        </label>
        <textarea
          id="answer_ar"
          value={formData.answer_ar}
          onChange={(e) => setFormData({ ...formData, answer_ar: e.target.value })}
          rows={5}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all resize-y"
          placeholder="أدخل الإجابة بالعربية"
          dir="rtl"
          disabled={isLoading}
        />
        {errors.answer_ar && (
          <p className="mt-1 text-sm text-red-600">{errors.answer_ar}</p>
        )}
      </div>
      
      {/* Is Favorite */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_favorite"
          checked={formData.is_favorite}
          onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
          className="w-5 h-5 rounded border-2 border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500"
          disabled={isLoading}
        />
        <label htmlFor="is_favorite" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Mark as Favorite (appears first on home page)
        </label>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-700 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px] flex items-center justify-center"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            initialData ? 'Update FAQ' : 'Create FAQ'
          )}
        </button>
      </div>
    </form>
  );
}
