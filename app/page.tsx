import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import QuickLinkCard from "@/lib/components/ui/QuickLinkCard";
import HeroSlider from "@/lib/components/home/HeroSlider";
import StatsSection from "@/lib/components/home/StatsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white page-transition">
      {/* Hero Slider */}
      <HeroSlider />
      
      <Show when="signed-out">
        <div className="flex min-h-[calc(100vh-500px)] items-center justify-center py-16">
          <div className="text-center max-w-md px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Client Management System
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Please sign in to access the dashboard and manage your clients.
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
        
        <div className="container mx-auto py-16 px-4">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Client Management
            </h1>
            <p className="text-lg text-gray-600">
              Choose an option below to get started
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <QuickLinkCard
              title="Dashboard"
              description="View analytics, metrics, and recent activity for your clients and orders"
              href="/dashboard"
              icon={
                <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              }
            />
            <QuickLinkCard
              title="Search Clients"
              description="Search, view, and manage all your client information with full audit trails"
              href="/clients"
              icon={
                <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              }
            />
          </div>
        </div>
      </Show>
    </div>
  );
}
