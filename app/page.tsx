import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import HeroSlider from "@/lib/components/home/HeroSlider";
import StatsSection from "@/lib/components/home/StatsSection";
import NewsSection from "@/lib/components/home/NewsSection";
import QuickLinksSection from "@/lib/components/home/QuickLinksSection";
import { PhotosSection } from "@/lib/components/home/PhotosSection";
import { VideosSection } from "@/lib/components/home/VideosSection";
import { PartnersSection } from "@/lib/components/home/PartnersSection";

/**
 * Fetch photos for home page (5 featured items)
 */
async function getHomePhotos() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/photos?context=home`, {
      cache: 'no-store',
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Failed to fetch home photos:', error);
    return null;
  }
}

/**
 * Fetch videos for home page (6 featured items)
 */
async function getHomeVideos() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/videos?context=home`, {
      cache: 'no-store',
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Failed to fetch home videos:', error);
    return null;
  }
}

/**
 * Fetch partners for home page (configurable count)
 */
async function getHomePartners() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/partners?context=home`, {
      cache: 'no-store',
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Failed to fetch home partners:', error);
    return null;
  }
}

/**
 * Fetch section visibility configuration
 */
async function getHomeSectionConfig(sectionType: 'photos' | 'videos' | 'partners') {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/home-sections?section_type=${sectionType}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Failed to fetch section config:', error);
    return null;
  }
}

export default async function Home() {
  // Fetch all media content and their configurations in parallel
  const [photos, photosConfig, videos, videosConfig, partners, partnersConfig] = await Promise.all([
    getHomePhotos(),
    getHomeSectionConfig('photos'),
    getHomeVideos(),
    getHomeSectionConfig('videos'),
    getHomePartners(),
    getHomeSectionConfig('partners'),
  ]);

  // Determine which sections to show based on visibility and content
  const showPhotos = photosConfig?.is_visible && photos && photos.length > 0;
  const showVideos = videosConfig?.is_visible && videos && videos.length > 0;
  const showPartners = partnersConfig?.is_visible && partners && partners.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white page-transition">
      {/* Hero Slider */}
      <HeroSlider />
      
      {/* News Section */}
      <NewsSection />
      
      {/* Photos Section - 5 items in slider */}
      {showPhotos && (
        <PhotosSection 
          photos={photos} 
          title={{
            en: photosConfig.title_en,
            ar: photosConfig.title_ar,
          }}
        />
      )}
      
      {/* Videos Section - 6 items in 2x3 grid */}
      {showVideos && (
        <VideosSection 
          videos={videos} 
          title={{
            en: videosConfig.title_en,
            ar: videosConfig.title_ar,
          }}
        />
      )}
      
      {/* Partners Section - card-by-card slider */}
      {showPartners && (
        <PartnersSection 
          partners={partners} 
          title={{
            en: partnersConfig.title_en,
            ar: partnersConfig.title_ar,
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
              <SignInButton mode="modal">
                <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors min-h-[44px]">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]">
                  Sign Up
                </button>
              </SignUpButton>
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
