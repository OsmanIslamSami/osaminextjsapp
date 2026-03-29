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

export const metadata: Metadata = {
  title: "Next App - Complete Business Management Platform",
  description: "Streamline your business with Next App: powerful client management, real-time analytics dashboard, news publishing, and comprehensive reporting tools. Perfect for modern businesses looking to scale efficiently.",
  keywords: ["Business Management", "Client Management", "CRM", "Analytics Dashboard", "News Publishing", "Next.js", "React", "Business Platform", "Modern Web App", "Enterprise Software"],
  authors: [{ name: "Next App Team" }],
  metadataBase: new URL(baseUrl),
  
  // Open Graph metadata for social media sharing (Teams, Facebook, LinkedIn)
  // Next.js will automatically use opengraph-image.tsx for the image
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ar_SA'],
    url: baseUrl,
    siteName: 'Next App',
    title: 'Next App - Your Complete Business Management Solution',
    description: 'Streamline client management, track analytics, publish news updates, and grow your business with our modern platform. Get started today with Next App.',
  },
  
  // Twitter Card metadata
  // Next.js will automatically use twitter-image.tsx or fall back to opengraph-image.tsx
  twitter: {
    card: 'summary_large_image',
    title: 'Next App - Your Complete Business Management Solution',
    description: 'Streamline client management, track analytics, publish news updates, and grow your business with our modern platform. Get started today with Next App.',
    creator: '@nextapp',
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
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <LanguageProvider>
        <LanguageAwareHTML>
          <body
            className={`${inter.variable} ${cairo.variable} antialiased flex flex-col min-h-screen`}
          >
            <UserSyncHandler />
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </body>
        </LanguageAwareHTML>
      </LanguageProvider>
    </ClerkProvider>
  );
}
