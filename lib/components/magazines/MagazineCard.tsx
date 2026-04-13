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

interface MagazineCardProps {
  magazine: Magazine;
}

export default function MagazineCard({ magazine }: MagazineCardProps) {
  const { language, direction } = useTranslation();
  const title = getBilingualTitle(magazine, language);
  const description = getBilingualDescription(magazine, language);
  
  const publishedDate = new Date(magazine.published_date).toLocaleDateString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <motion.div 
      className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden group" 
      dir={direction}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={magazine.image_url}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Content overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white z-10">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
          
          <div className={`flex items-center gap-2 text-sm text-white/90 ${
            language === 'ar' ? 'flex-row-reverse justify-end' : ''
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="drop-shadow-md">{publishedDate}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-600 dark:text-zinc-400 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <motion.a
          href={magazine.download_link}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 justify-center px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus-visible:ring-2 ${
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
          <span>{language === 'ar' ? 'تحميل PDF' : 'Download PDF'}</span>
        </motion.a>
      </div>
    </motion.div>
  );
}
