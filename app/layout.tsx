import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { headers, cookies } from 'next/headers';
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
import ScrollToTop from "@/lib/components/ScrollToTop";
import ScrollDown from "@/lib/components/ScrollDown";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

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
  // Priority 1: Custom base URL from env
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Priority 2: Use production URL on Vercel production environment
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://osaminextjsapp.vercel.app';
  }
  // Priority 3: Vercel preview/development URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Priority 4: Local development
  return 'http://localhost:3000';
}

const baseUrl = getBaseUrl();

// Fetch app settings for metadata
async function getAppSettings() {
  try {
    const settings = await prisma.app_settings.findFirst();
    return settings;
  } catch (error) {
    logger.error('Failed to fetch app settings for metadata:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings();
  const cookieStore = await cookies();
  const lang = cookieStore.get('app_language')?.value || 'en';
  const isArabic = lang === 'ar';
  
  const title = isArabic
    ? (settings?.site_title_ar || settings?.site_title_en || "Next App - Complete Business Management Platform")
    : (settings?.site_title_en || "Next App - Complete Business Management Platform");
  const description = isArabic
    ? (settings?.site_description_ar || settings?.site_description_en || "Streamline your business with Next App: powerful client management, real-time analytics dashboard, news publishing, and comprehensive reporting tools. Perfect for modern businesses looking to scale efficiently.")
    : (settings?.site_description_en || "Streamline your business with Next App: powerful client management, real-time analytics dashboard, news publishing, and comprehensive reporting tools. Perfect for modern businesses looking to scale efficiently.");
  const keywords = isArabic
    ? (settings?.site_keywords_ar
      ? settings.site_keywords_ar.split(',').map(k => k.trim())
      : settings?.site_keywords_en
        ? settings.site_keywords_en.split(',').map(k => k.trim())
        : ["Business Management", "Client Management", "CRM"])
    : (settings?.site_keywords_en 
      ? settings.site_keywords_en.split(',').map(k => k.trim())
      : ["Business Management", "Client Management", "CRM", "Analytics Dashboard", "News Publishing", "Next.js", "React", "Business Platform", "Modern Web App", "Enterprise Software"]);
  
  const siteName = isArabic
    ? (settings?.site_title_ar || settings?.site_title_en || 'Next App')
    : (settings?.site_title_en || 'Next App');
  
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
      locale: isArabic ? 'ar_SA' : 'en_US',
      alternateLocale: [isArabic ? 'en_US' : 'ar_SA'],
      url: baseUrl,
      siteName,
      title,
      description,
      // Only set custom image if it exists, otherwise Next.js will use opengraph-image.tsx
      ...(settings?.og_image_url && { images: [{ url: settings.og_image_url }] }),
    },
    
    // Twitter Card metadata
    // Next.js will automatically use twitter-image.tsx or fall back to opengraph-image.tsx
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@nextapp',
      // Only set custom image if it exists
      ...(settings?.og_image_url && { images: [settings.og_image_url] }),
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
      icon: settings?.site_favicon_url || '/favicon.ico',
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
                <ScrollToTop />
                <ScrollDown />
              </body>
            </LanguageAwareHTML>
          </ToastProvider>
        </AppSettingsProvider>
      </LanguageProvider>
    </ClerkProvider>
  );
}
