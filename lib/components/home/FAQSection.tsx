'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import FAQAccordionItem from '@/lib/components/faq/FAQAccordionItem';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

interface FAQ {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  hasMore?: boolean;
  showAllButton?: boolean;
}

export default function FAQSection({ faqs, hasMore = false, showAllButton = true }: FAQSectionProps) {
  const { language, direction } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const toggleItem = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section 
      ref={sectionRef} 
      className="py-16 px-4 relative overflow-hidden bg-gray-50 dark:bg-zinc-950"
      role="region"
      aria-label={language === 'ar' ? 'قسم الأسئلة المتكررة' : 'FAQ Section'}
      dir={direction}
    >
      {/* Parallax background */}
      <motion.div 
        className="absolute inset-0 -z-10 opacity-30"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-300 dark:bg-blue-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full blur-3xl"></div>
      </motion.div>

      <div className="container mx-auto max-w-7xl">
        {/* Header with title and button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className={direction === 'rtl' ? 'text-right md:order-1' : 'text-left md:order-1'}>
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold"
              style={{ color: 'var(--color-primary)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              {language === 'ar' ? 'الأسئلة المتكررة' : 'Frequently Asked Questions'}
            </motion.h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-zinc-400 mt-2">
              {language === 'ar' ? 'إجابات على الأسئلة الشائعة' : 'Find answers to common questions'}
            </p>
          </div>
          {showAllButton && (
            <Link
              href="/faq"
              className={`inline-block text-white px-6 py-2.5 rounded-full font-medium transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 whitespace-nowrap w-fit text-sm md:text-base ${direction === 'rtl' ? 'md:order-2' : 'md:order-2'}`}
              style={{ backgroundColor: 'var(--color-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }}
            >
              {language === 'ar' ? 'جميع الأسئلة' : 'All FAQs'}
            </Link>
          )}
        </div>

        <motion.div 
          className="space-y-4"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
            >
              <FAQAccordionItem
                faq={faq}
                isExpanded={expandedId === faq.id}
                onToggle={() => toggleItem(faq.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
