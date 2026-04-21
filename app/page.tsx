import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import HeroSlider from "@/lib/components/home/HeroSlider";
import StatsSection from "@/lib/components/home/StatsSection";
import NewsSection from "@/lib/components/home/NewsSection";
import QuickLinksSection from "@/lib/components/home/QuickLinksSection";
import { PhotosSection } from "@/lib/components/home/PhotosSection";
import { VideosSection } from "@/lib/components/home/VideosSection";
import { PartnersSection } from "@/lib/components/home/PartnersSection";
import FAQSection from "@/lib/components/home/FAQSection";
import MagazineSection from "@/lib/components/home/MagazineSection";
import { ErrorBoundary } from "@/lib/components/ErrorBoundary";
import FAQSectionError from "@/lib/components/home/FAQSectionError";
import MagazineSectionError from "@/lib/components/home/MagazineSectionError";
import { prisma } from "@/lib/db";
import { logger } from '@/lib/utils/logger';

/**
 * Home Page Metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const lang = cookieStore.get('app_language')?.value || 'en';
  const isArabic = lang === 'ar';
  const settings = await prisma.app_settings.findFirst();

  const title = isArabic
    ? (settings?.site_title_ar || settings?.site_title_en || "Home - Next App")
    : (settings?.site_title_en || "Home - Next App");
  const description = isArabic
    ? (settings?.site_description_ar || settings?.site_description_en || "Welcome to Next App")
    : (settings?.site_description_en || "Welcome to Next App - Your complete business management solution with client management, analytics, news, and more.");
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Fetch photos for home page (featured items)
 */
async function getHomePhotos() {
  try {
    const photos = await prisma.photos.findMany({
      where: {
        is_deleted: false,
        is_visible: true,
        published_date: { lte: new Date() },
      },
      orderBy: [
        { is_featured: 'desc' },
        { published_date: 'desc' },
      ],
      take: 6,
    });
    return photos;
  } catch (error) {
    logger.error('Failed to fetch home photos:', error);
    return [];
  }
}

/**
 * Fetch videos for home page (featured items)
 */
async function getHomeVideos() {
  try {
    const videos = await prisma.videos.findMany({
      where: {
        is_deleted: false,
        is_visible: true,
        published_date: { lte: new Date() },
      },
      orderBy: [
        { is_featured: 'desc' },
        { published_date: 'desc' },
      ],
      take: 6,
    });
    return videos;
  } catch (error) {
    logger.error('Failed to fetch home videos:', error);
    return [];
  }
}

/**
 * Fetch partners for home page
 */
async function getHomePartners() {
  try {
    const partners = await prisma.partners.findMany({
      where: {
        is_deleted: false,
        is_visible: true,
      },
      orderBy: [
        { is_featured: 'desc' },
        { created_at: 'desc' },
      ],
      take: 6,
    });
    return partners;
  } catch (error) {
    logger.error('Failed to fetch home partners:', error);
    return [];
  }
}

/**
 * Fetch all section configs ordered by display_order
 */
async function getAllSectionConfigs() {
  try {
    const configs = await prisma.home_sections.findMany({
      orderBy: { display_order: 'asc' },
    });
    return configs;
  } catch (error) {
    logger.error('Failed to fetch section configs:', error);
    return [];
  }
}

/**
 * Fetch FAQs for home page (top 5, favorites first)
 */
async function getHomeFAQs() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { 
        is_deleted: false,
        is_visible: true,
      },
      orderBy: [
        { is_favorite: 'desc' },
        { display_order: 'asc' },
        { created_at: 'desc' }
      ],
      take: 5,
      select: {
        id: true,
        question_en: true,
        question_ar: true,
        answer_en: true,
        answer_ar: true,
      }
    });
    
    const totalCount = await prisma.fAQ.count({
      where: { 
        is_deleted: false,
        is_visible: true,
      }
    });
    
    return { faqs, hasMore: totalCount > 5 };
  } catch (error) {
    logger.error('Failed to fetch home FAQs:', error);
    return { faqs: [], hasMore: false };
  }
}

/**
 * Fetch Magazines for home page (top 5 recent)
 */
async function getHomeMagazines() {
  try {
    const magazines = await prisma.magazine.findMany({
      where: { 
        is_deleted: false,
        is_visible: true,
      },
      orderBy: { published_date: 'desc' },
      take: 5,
      select: {
        id: true,
        title_en: true,
        title_ar: true,
        description_en: true,
        description_ar: true,
        image_url: true,
        download_link: true,
        published_date: true,
      }
    });
    
    // Convert Date objects to ISO strings
    const magazinesData = magazines.map(m => ({
      ...m,
      published_date: m.published_date.toISOString(),
    }));
    
    const totalCount = await prisma.magazine.count({
      where: { 
        is_deleted: false,
        is_visible: true,
      }
    });
    
    return { magazines: magazinesData, hasMore: totalCount > 5 };
  } catch (error) {
    logger.error('Failed to fetch home magazines:', error);
    return { magazines: [], hasMore: false };
  }
}

export default async function Home() {
  // Check authentication status
  const { userId } = await auth();
  const isSignedIn = !!userId;

  // Fetch all media content and section configurations in parallel
  const [sectionConfigs, photos, videos, partners, faqData, magazineData] = await Promise.all([
    getAllSectionConfigs(),
    getHomePhotos(),
    getHomeVideos(),
    getHomePartners(),
    getHomeFAQs(),
    getHomeMagazines(),
  ]);

  // Build a lookup map for section configs
  const configMap = Object.fromEntries(sectionConfigs.map(c => [c.section_type, c]));
  const newsConfig = configMap['news'] ?? null;
  const photosConfig = configMap['photos'] ?? null;
  const videosConfig = configMap['videos'] ?? null;
  const partnersConfig = configMap['partners'] ?? null;
  const faqConfig = configMap['faq'] ?? null;
  const magazineConfig = configMap['magazines'] ?? null;
  const sliderConfig = configMap['slider'] ?? null;
  const statsConfig = configMap['stats'] ?? null;
  const quicklinksConfig = configMap['quicklinks'] ?? null;

  // Determine which sections to show based on visibility and content
  const showSlider = (sliderConfig?.is_visible ?? true);
  const showNews = (newsConfig?.is_visible ?? true);
  const showPhotos = (photosConfig?.is_visible ?? true) && photos.length > 0;
  const showVideos = (videosConfig?.is_visible ?? true) && videos.length > 0;
  const showPartners = (partnersConfig?.is_visible ?? true) && partners.length > 0;
  const showFAQ = (faqConfig?.is_visible ?? true) && faqData.faqs.length > 0;
  const showMagazines = (magazineConfig?.is_visible ?? true) && magazineData.magazines.length > 0;
  const showStats = (statsConfig?.is_visible ?? true) && isSignedIn;
  const showQuickLinks = (quicklinksConfig?.is_visible ?? true) && isSignedIn;

  // Build ordered sections based on display_order from admin settings
  const sectionRenderers: Record<string, React.ReactNode> = {
    slider: showSlider ? (
      <HeroSlider key="slider" />
    ) : null,
    news: showNews ? (
      <NewsSection 
        key="news"
        title={{
          en: newsConfig?.title_en || 'Latest News',
          ar: newsConfig?.title_ar || 'آخر الأخبار',
        }}
      />
    ) : null,
    photos: showPhotos ? (
      <PhotosSection 
        key="photos"
        photos={photos.map(p => ({ ...p, published_date: p.published_date.toISOString() }))} 
        title={{
          en: photosConfig?.title_en || 'Photos',
          ar: photosConfig?.title_ar || 'الصور',
        }}
      />
    ) : null,
    videos: showVideos ? (
      <VideosSection 
        key="videos"
        videos={videos.map(v => ({ ...v, published_date: v.published_date.toISOString() }))} 
        title={{
          en: videosConfig?.title_en || 'Videos',
          ar: videosConfig?.title_ar || 'الفيديوهات',
        }}
      />
    ) : null,
    partners: showPartners ? (
      <PartnersSection 
        key="partners"
        partners={partners} 
        title={{
          en: partnersConfig?.title_en || 'Our Partners',
          ar: partnersConfig?.title_ar || 'شركاؤنا',
        }}
      />
    ) : null,
    faq: showFAQ ? (
      <ErrorBoundary key="faq" FallbackComponent={FAQSectionError}>
        <FAQSection 
          faqs={faqData.faqs}
          hasMore={faqData.hasMore}
        />
      </ErrorBoundary>
    ) : null,
    magazines: showMagazines ? (
      <ErrorBoundary key="magazines" FallbackComponent={MagazineSectionError}>
        <MagazineSection 
          magazines={magazineData.magazines}
          hasMore={magazineData.hasMore}
        />
      </ErrorBoundary>
    ) : null,
    stats: showStats ? (
      <StatsSection key="stats" />
    ) : null,
    quicklinks: showQuickLinks ? (
      <QuickLinksSection key="quicklinks" />
    ) : null,
  };

  // Render sections in display_order from admin settings
  const orderedSections = sectionConfigs
    .map(config => sectionRenderers[config.section_type])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white page-transition">
      {/* Dynamic Sections - ordered by admin display_order */}
      {orderedSections}
    </div>
  );
}