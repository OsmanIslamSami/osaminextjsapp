import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import HeroSlider from "@/lib/components/home/HeroSlider";
import StatsSection from "@/lib/components/home/StatsSection";
import NewsSection from "@/lib/components/home/NewsSection";
import QuickLinksSection from "@/lib/components/home/QuickLinksSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white page-transition">
      {/* Hero Slider */}
      <HeroSlider />
      
      {/* News Section */}
      <NewsSection />
      
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
