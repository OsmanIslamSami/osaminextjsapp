'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import MagazineCard from '@/lib/components/magazines/MagazineCard';
import { motion, useScroll, useTransform } from 'framer-motion';

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

interface MagazineSectionProps {
  magazines: Magazine[];
  hasMore?: boolean;
}

export default function MagazineSection({ magazines, hasMore = false }: MagazineSectionProps) {
  const { language } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isRTL = language === 'ar';

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

  // Intersection Observer for fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (magazines.length === 0) {
    return null;
  }

  // Limit to 5 magazines for display
  const displayMagazines = magazines.slice(0, 5);

  return (
    <section 
      ref={sectionRef} 
      className="py-16 px-4 bg-white dark:bg-zinc-900 relative overflow-hidden"
      role="region"
      aria-label={language === 'ar' ? 'قسم المجلات' : 'Magazine Section'}
    >
      {/* Parallax background */}
      <motion.div 
        className="absolute inset-0 -z-10 opacity-20"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-10 right-20 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-indigo-300 dark:bg-indigo-900 rounded-full blur-3xl"></div>
      </motion.div>

      <div className="container mx-auto max-w-7xl">
        {/* Header with title and button */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <div>
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold"
              style={{
                color: 'var(--color-primary)',
              }}
            >
              {language === 'ar' ? 'المجلات' : 'Magazines'}
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-zinc-400 mt-2">
              {language === 'ar' ? 'تصفح أحدث إصداراتنا' : 'Browse our latest publications'}
            </p>
          </div>
          <Link
            href="/magazines"
            className="inline-block text-white px-6 py-2.5 rounded-full font-medium transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 whitespace-nowrap w-fit text-sm md:text-base"
            style={{
              backgroundColor: 'var(--color-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }}
          >
            {language === 'ar' ? 'جميع المجلات' : 'All Magazines'}
          </Link>
        </div>

        {/* Single Row Grid - 5 magazines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {displayMagazines.map((magazine, index) => (
            <motion.div
              key={magazine.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <MagazineCard magazine={magazine} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
