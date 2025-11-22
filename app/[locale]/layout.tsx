import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { FavoritesProvider } from "@/lib/hooks/useFavorites";
import CookieConsent from "@/components/legal/CookieConsent";
import { SurpriseMeProvider } from "@/lib/contexts/SurpriseMeContext";
import SurpriseMeModal from "@/components/features/SurpriseMeModal";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "What To Eat? - Discover Your Next Meal",
    template: "%s | What To Eat?",
  },
  description:
    "Discover delicious recipes from around the world. Get random meal suggestions, browse thousands of recipes, and find your next favorite dish.",
  keywords: [
    "recipes",
    "meals",
    "cooking",
    "food",
    "dinner ideas",
    "meal suggestions",
    "random meal generator",
    "recipe finder",
  ],
  authors: [{ name: "What To Eat Team" }],
  creator: "What To Eat",
  publisher: "What To Eat",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "What To Eat?",
    title: "What To Eat? - Discover Your Next Meal",
    description:
      "Discover delicious recipes from around the world. Get random meal suggestions and find your next favorite dish.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "What To Eat? - Recipe Discovery Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "What To Eat? - Discover Your Next Meal",
    description:
      "Discover delicious recipes from around the world. Get random meal suggestions and find your next favorite dish.",
    images: ["/og-image.jpg"],
    creator: "@whattoeat",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      fr: "/fr",
      es: "/es",
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

import AutoGoogleTranslate from "@/components/features/AutoGoogleTranslate";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${playfair.variable} ${geistMono.variable} antialiased`} translate="no">
        <NextIntlClientProvider messages={messages}>
          <SurpriseMeProvider>
            <FavoritesProvider>
              <div className="flex flex-col min-h-screen">
                <Navigation />
                <main className="flex-grow">{children}</main>
                <Footer />
                <CookieConsent />
                <SurpriseMeModal />
                <AutoGoogleTranslate locale={locale} />
              </div>
            </FavoritesProvider>
          </SurpriseMeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
