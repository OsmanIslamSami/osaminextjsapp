import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import QuickLinkCard from "@/lib/components/ui/QuickLinkCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Show when="signed-out">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center max-w-md px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Client Management System
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Please sign in to access the dashboard and manage your clients.
            </p>
            <div className="flex gap-4 justify-center">
              <SignInButton mode="modal">
                <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </Show>
      
      <Show when="signed-in">
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
              icon="📊"
            />
            <QuickLinkCard
              title="Search Clients"
              description="Search, view, and manage all your client information with full audit trails"
              href="/clients"
              icon="👥"
            />
          </div>
        </div>
      </Show>
    </div>
  );
}
