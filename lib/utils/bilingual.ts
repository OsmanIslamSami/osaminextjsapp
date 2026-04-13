/**
 * Bilingual Field Accessor Utilities
 * 
 * Helper functions to access bilingual fields with type safety based on current language.
 */

type Language = 'en' | 'ar';

/**
 * Get bilingual field value based on language
 * 
 * @param obj - Object containing bilingual fields
 * @param fieldName - Base field name (without _en or _ar suffix)
 * @param language - Current language ('en' or 'ar')
 * @returns The field value in the specified language
 * 
 * @example
 * const title = getBilingualField(faq, 'question', 'en'); // Returns faq.question_en
 * const answer = getBilingualField(faq, 'answer', 'ar');   // Returns faq.answer_ar
 */
export function getBilingualField<T extends Record<string, any>>(
  obj: T,
  fieldName: string,
  language: Language
): string {
  const key = `${fieldName}_${language}` as keyof T;
  return (obj[key] as string) || '';
}

/**
 * Get bilingual title field
 */
export function getBilingualTitle<T extends { title_en?: string; title_ar?: string }>(
  obj: T,
  language: Language
): string {
  return language === 'ar' ? (obj.title_ar || '') : (obj.title_en || '');
}

/**
 * Get bilingual description field
 */
export function getBilingualDescription<T extends { description_en?: string; description_ar?: string }>(
  obj: T,
  language: Language
): string {
  return language === 'ar' ? (obj.description_ar || '') : (obj.description_en || '');
}

/**
 * Get bilingual question field (for FAQ)
 */
export function getBilingualQuestion<T extends { question_en?: string; question_ar?: string }>(
  obj: T,
  language: Language
): string {
  return language === 'ar' ? (obj.question_ar || '') : (obj.question_en || '');
}

/**
 * Get bilingual answer field (for FAQ)
 */
export function getBilingualAnswer<T extends { answer_en?: string; answer_ar?: string }>(
  obj: T,
  language: Language
): string {
  return language === 'ar' ? (obj.answer_ar || '') : (obj.answer_en || '');
}

/**
 * Create bilingual object with English and Arabic values
 * 
 * @example
 * const bilingual = createBilingualObject('title', 'English Title', 'عنوان عربي');
 * // Returns: { title_en: 'English Title', title_ar: 'عنوان عربي' }
 */
export function createBilingualObject(
  fieldName: string,
  englishValue: string,
  arabicValue: string
): Record<string, string> {
  return {
    [`${fieldName}_en`]: englishValue,
    [`${fieldName}_ar`]: arabicValue,
  };
}

/**
 * Validate that both English and Arabic versions of a field are provided
 */
export function validateBilingualField(
  obj: Record<string, any>,
  fieldName: string
): { valid: boolean; error?: string } {
  const enKey = `${fieldName}_en`;
  const arKey = `${fieldName}_ar`;
  
  if (!obj[enKey] || obj[enKey].trim() === '') {
    return {
      valid: false,
      error: `English ${fieldName} is required`
    };
  }
  
  if (!obj[arKey] || obj[arKey].trim() === '') {
    return {
      valid: false,
      error: `Arabic ${fieldName} is required`
    };
  }
  
  return { valid: true };
}

/**
 * Get all bilingual fields from an object
 * Returns an object with en and ar values
 */
export function extractBilingualFields<T extends Record<string, any>>(
  obj: T,
  fieldNames: string[]
): { en: Record<string, string>; ar: Record<string, string> } {
  const en: Record<string, string> = {};
  const ar: Record<string, string> = {};
  
  fieldNames.forEach(fieldName => {
    en[fieldName] = obj[`${fieldName}_en`] || '';
    ar[fieldName] = obj[`${fieldName}_ar`] || '';
  });
  
  return { en, ar };
}
