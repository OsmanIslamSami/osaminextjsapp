import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import HeroSlider from "@/lib/components/home/HeroSlider";
import StatsSection from "@/lib/components/home/StatsSection";
import NewsSection from "@/lib/components/home/NewsSection";
import QuickLinksSection from "@/lib/components/home/QuickLinksSection";
import { PhotosSection } from "@/lib/components/home/PhotosSection";
import { VideosSection } from "@/lib/components/home/VideosSection";
import { PartnersSection } from "@/lib/components/home/PartnersSection";
import { prisma } from "@/lib/db";

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
    console.error('Failed to fetch home photos:', error);
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
    console.error('Failed to fetch home videos:', error);
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
    console.error('Failed to fetch home partners:', error);
    return [];
  }
}

/**
 * Fetch section visibility configuration
 */
async function getHomeSectionConfig(sectionType: 'news' | 'photos' | 'videos' | 'partners') {
  try {
    const config = await prisma.home_sections.findFirst({
      where: {
        section_type: sectionType,
      },
    });
    return config;
  } catch (error) {
    console.error('Failed to fetch section config:', error);
    return null;
  }
}

export default async function Home() {
  // Fetch all media content and their configurations in parallel
  const [newsConfig, photos, photosConfig, videos, videosConfig, partners, partnersConfig] = await Promise.all([
    getHomeSectionConfig('news'),
    getHomePhotos(),
    getHomeSectionConfig('photos'),
    getHomeVideos(),
    getHomeSectionConfig('videos'),
    getHomePartners(),
    getHomeSectionConfig('partners'),
  ]);

  // Determine which sections to show based on visibility and content
  const showNews = (newsConfig?.is_visible ?? true);
  const showPhotos = (photosConfig?.is_visible ?? true) && photos.length > 0;
  const showVideos = (videosConfig?.is_visible ?? true) && videos.length > 0;
  const showPartners = (partnersConfig?.is_visible ?? true) && partners.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white page-transition">
      {/* Hero Slider */}
      <HeroSlider />
      
      {/* News Section */}
      {showNews && <NewsSection />}
      
      {/* Photos Section - 5 items in slider */}
      {showPhotos && (
        <PhotosSection 
          photos={photos} 
          title={{
            en: photosConfig?.title_en || 'Photos',
            ar: photosConfig?.title_ar || 'الصور',
          }}
        />
      )}
      
      {/* Videos Section - 6 items in 2x3 grid */}
      {showVideos && (
        <VideosSection 
          videos={videos} 
          title={{
            en: videosConfig?.title_en || 'Videos',
            ar: videosConfig?.title_ar || 'الفيديوهات',
          }}
        />
      )}
      
      {/* Partners Section - card-by-card slider */}
      {showPartners && (
        <PartnersSection 
          partners={partners} 
          title={{
            en: partnersConfig?.title_en || 'Our Partners',
            ar: partnersConfig?.title_ar || 'شركاؤنا',
          }}
        />
      )}
      
      <Show when="signed-out">
        <div className="flex min-h-[calc(100vh-500px)] items-center justify-center py-16">
          <div className="text-center max-w-md px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Next App
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Please sign in to access the dashboard and manage your content.
            </p>
            <div className="flex gap-4 justify-center">
              <SignInButton mode="modal"><button className="px-6 py-3 rounded-lg transition-colors min-h-[44px]" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}>Sign In</button></SignInButton>
              <SignUpButton mode="modal"><button className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]">Sign Up</button></SignUpButton>
            </div>
          </div>
        </div>
      </Show>
      
      <Show when="signed-in">
        {/* Stats Section */}
        <StatsSection />
        
        {/* Quick Links Section with Animations */}
        <QuickLinksSection />
      </Show>
    </div>
  );
}
