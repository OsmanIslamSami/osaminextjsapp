'use client';

import Image from 'next/image';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { getBilingualTitle, getBilingualDescription } from '@/lib/utils/bilingual';
import { motion } from 'framer-motion';

interface Magazine {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image_url: string;
  download_link: string;
  published_date: string;
}

interface MagazineRowItemProps {
  magazine: Magazine;
}

export default function MagazineRowItem({ magazine }: MagazineRowItemProps) {
  const { language, direction } = useTranslation();
  const title = getBilingualTitle(magazine, language);
  const description = getBilingualDescription(magazine, language);
  
  const publishedDate = new Date(magazine.published_date).toLocaleDateString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <motion.div 
      className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all border-2 border-gray-100 dark:border-zinc-800"
      dir={direction}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6">
        {/* Magazine Cover Thumbnail */}
        <div className="flex-shrink-0">
          <div className="relative w-full md:w-32 h-48 md:h-44 rounded-lg overflow-hidden group">
            <Image
              src={magazine.image_url}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        {/* Magazine Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-zinc-400 text-sm md:text-base mb-3 line-clamp-2">
            {description}
          </p>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-500">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{publishedDate}</span>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex-shrink-0 flex items-center">
          <motion.a
            href={magazine.download_link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 justify-center px-6 py-3 w-full md:w-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 ${
              language === 'ar' ? 'flex-row-reverse' : ''
            }`}
            aria-label={`${language === 'ar' ? 'تحميل' : 'Download'} ${title} PDF`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="whitespace-nowrap">
              {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
            </span>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}
