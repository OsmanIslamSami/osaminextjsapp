import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
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

export const metadata: Metadata = {
  title: "Next App",
  description: "Modern Next.js application with advanced features, news, and client management",
  keywords: ["Next.js", "React", "News", "Client Management", "Modern Web App"],
  authors: [{ name: "Next App Team" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  
  // Open Graph metadata for social media sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ar_SA'],
    url: '/',
    siteName: 'Next App',
    title: 'Next App - Modern Business Platform',
    description: 'Modern Next.js application with advanced features, news management, and client services',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Next App Preview',
      },
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Next App - Modern Business Platform',
    description: 'Modern Next.js application with advanced features, news management, and client services',
    images: ['/api/og'],
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
