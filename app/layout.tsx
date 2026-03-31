import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { headers } from 'next/headers';
import "./globals.css";
import Header from "./header";
import Footer from "@/lib/components/Footer";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { LanguageAwareHTML } from "@/lib/components/LanguageAwareHTML";
import { UserSyncHandler } from "@/lib/components/UserSyncHandler";
import { ToastProvider } from "@/lib/components/ToastContainer";
import { AppSettingsProvider } from "@/lib/contexts/AppSettingsContext";
import { FontApplier } from "@/lib/components/FontApplier";
import { ThemeApplier } from "@/lib/components/ThemeApplier";
import { prisma } from "@/lib/db";

// Modern English font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Modern Arabic font
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

// Generate metadata base URL dynamically
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

const baseUrl = getBaseUrl();

// Fetch app settings for metadata
async function getAppSettings() {
  try {
    const settings = await prisma.app_settings.findFirst();
    return settings;
  } catch (error) {
    console.error('Failed to fetch app settings for metadata:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings();
  
  const title = settings?.site_title_en || "Next App - Complete Business Management Platform";
  const description = settings?.site_description_en || "Streamline your business with Next App: powerful client management, real-time analytics dashboard, news publishing, and comprehensive reporting tools. Perfect for modern businesses looking to scale efficiently.";
  const keywords = settings?.site_keywords_en 
    ? settings.site_keywords_en.split(',').map(k => k.trim())
    : ["Business Management", "Client Management", "CRM", "Analytics Dashboard", "News Publishing", "Next.js", "React", "Business Platform", "Modern Web App", "Enterprise Software"];
  
  return {
    title,
    description,
    keywords,
    authors: [{ name: "Next App Team" }],
    metadataBase: new URL(baseUrl),
    
    // Open Graph metadata for social media sharing (Teams, Facebook, LinkedIn)
    // Next.js will automatically use opengraph-image.tsx for the image
    openGraph: {
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['ar_SA'],
      url: baseUrl,
      siteName: settings?.site_title_en || 'Next App',
      title,
      description,
      images: settings?.og_image_url ? [{ url: settings.og_image_url }] : undefined,
    },
    
    // Twitter Card metadata
    // Next.js will automatically use twitter-image.tsx or fall back to opengraph-image.tsx
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@nextapp',
      images: settings?.og_image_url ? [settings.og_image_url] : undefined,
    },
    
    // Additional metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Icons
    icons: {
      icon: settings?.site_logo_url || '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <LanguageProvider>
        <AppSettingsProvider>
          <ToastProvider>
            <LanguageAwareHTML>
              <body
                className={`${inter.variable} ${cairo.variable} antialiased flex flex-col min-h-screen`}
              >
                <UserSyncHandler />
                <FontApplier />
                <ThemeApplier />
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </body>
            </LanguageAwareHTML>
          </ToastProvider>
        </AppSettingsProvider>
      </LanguageProvider>
    </ClerkProvider>
  );
}
