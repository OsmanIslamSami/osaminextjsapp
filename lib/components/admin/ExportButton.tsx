'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ExportButtonProps {
  onExport: () => void;
}

export default function ExportButton({ onExport }: ExportButtonProps) {
  const { language } = useLanguage();

  return (
    <button
      onClick={onExport}
      className="w-full sm:w-auto px-5 py-3 rounded-full border-2 border-green-200 dark:border-green-900/30 hover:border-green-400 dark:hover:border-green-500 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 bg-transparent transition-all flex items-center justify-center gap-2 font-medium text-sm min-h-[44px]"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {language === 'ar' ? 'تصدير Excel' : 'Export Excel'}
    </button>
  );
}
