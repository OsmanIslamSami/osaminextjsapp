'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { getBilingualQuestion, getBilingualAnswer } from '@/lib/utils/bilingual';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
}

interface FAQAccordionItemProps {
  faq: FAQ;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function FAQAccordionItem({ faq, isExpanded, onToggle }: FAQAccordionItemProps) {
  const { language, direction } = useTranslation();
  const question = getBilingualQuestion(faq, language);
  const answer = getBilingualAnswer(faq, language);
  
  const headingId = `faq-heading-${faq.id}`;
  const contentId = `faq-content-${faq.id}`;

  return (
    <div className="mb-4" dir={direction}>
      <motion.div 
        className="transition-all duration-300 hover:bg-white dark:hover:bg-white hover:border-2 hover:border-gray-200 dark:hover:border-gray-200 hover:rounded-2xl"
        initial={false}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          id={headingId}
          onClick={onToggle}
          className="w-full p-6 md:p-8 flex items-start group"
          aria-expanded={isExpanded}
          aria-controls={contentId}
          aria-label={`${language === 'ar' ? 'سؤال' : 'Question'}: ${question}`}
          style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}
        >
          <span className={`flex-shrink-0 w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-2xl font-light text-gray-900 dark:text-white group-hover:text-gray-900 ${direction === 'rtl' ? 'ml-6 order-1' : 'mr-6 order-1'}`}>
            {isExpanded ? '−' : '+'}
          </span>
          <span className={`font-medium text-lg md:text-xl lg:text-2xl flex-1 text-gray-900 dark:text-white group-hover:text-gray-900 ${direction === 'rtl' ? 'order-2 text-right' : 'order-2 text-left'}`}>
            {question}
          </span>
        </motion.button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              id={contentId}
              role="region"
              aria-labelledby={headingId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className={`px-6 md:px-8 pb-6 md:pb-8 ${direction === 'rtl' ? 'pr-6 md:pr-8 text-right' : 'pl-12 md:pl-14 text-left'}`}>
                <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
