/**
 * Home Sections Utility Functions
 * For managing home page section visibility and configuration
 */

import { prisma } from '@/lib/db';

/**
 * Get configuration for a specific home section
 */
export async function getHomeSectionConfig(
  sectionType: 'photos' | 'videos' | 'partners'
) {
  return await prisma.home_sections.findUnique({
    where: { section_type: sectionType },
  });
}

/**
 * Get all home sections ordered by display_order
 */
export async function getAllHomeSections() {
  return await prisma.home_sections.findMany({
    orderBy: { display_order: 'asc' },
  });
}

/**
 * Default section titles (fallback if custom titles not set)
 */
export const DEFAULT_SECTION_TITLES = {
  photos: { en: 'Photos', ar: 'الصور' },
  videos: { en: 'Videos', ar: 'الفيديوهات' },
  partners: { en: 'Our Partners', ar: 'شركاؤنا' },
} as const;

/**
 * Get section title (custom or default)
 */
export function getSectionTitle(
  section: { title_en?: string | null; title_ar?: string | null; section_type: string },
  language: 'en' | 'ar'
): string {
  const customTitle = language === 'ar' ? section.title_ar : section.title_en;
  if (customTitle) return customTitle;
  
  const sectionType = section.section_type as 'photos' | 'videos' | 'partners';
  return DEFAULT_SECTION_TITLES[sectionType]?.[language] || section.section_type;
}

/**
 * Initialize default home sections if they don't exist
 * Should be called on app startup or in seed script
 */
export async function initializeHomeSections() {
  const sections = [
    { section_type: 'photos', is_visible: true, display_order: 1 },
    { section_type: 'videos', is_visible: true, display_order: 2 },
    { section_type: 'partners', is_visible: true, display_order: 3, partners_display_mode: 'all' },
  ];

  for (const section of sections) {
    await prisma.home_sections.upsert({
      where: { section_type: section.section_type },
      update: {},
      create: section,
    });
  }
}
