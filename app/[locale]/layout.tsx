import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { FavoritesProvider } from "@/lib/hooks/useFavorites";

import { SurpriseMeProvider } from "@/lib/contexts/SurpriseMeContext";
import SurpriseMeModal from "@/components/features/SurpriseMeModal";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ToastProvider } from "@/lib/contexts/ToastContext";
import { ToastContainer } from "@/components/ui/Toast";
import { validateEnvVars } from '@/lib/env-validator';

const GA_TRACKING_ID = 'G-QZPYKBVDCE';

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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dishshuffle.com";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  // Base alternates that apply to all pages
  // Next.js will automatically merge these with page-specific metadata
  // and handle the path concatenation
  const alternates = {
    canonical: `${baseUrl}/${locale}`,
    languages: {
      'en': `${baseUrl}/en`,
      'fr': `${baseUrl}/fr`,
      'es': `${baseUrl}/es`,
      'pt-BR': `${baseUrl}/pt-br`,
      'de': `${baseUrl}/de`,
      'ar': `${baseUrl}/ar`,
      'x-default': `${baseUrl}/en`,
    },
  };

  return {
    title: {
      default: "Dish Shuffle - Discover Your Next Meal",
      template: "%s | Dish Shuffle",
    },
    description: "Find your next favorite meal with Dish Shuffle. Browse thousands of recipes from around the world.",
    keywords: ["recipes", "food", "cooking", "meal planner", "dish shuffle", "what to eat"],
    authors: [{ name: "Dish Shuffle Team" }],
    creator: "Dish Shuffle",
    publisher: "Dish Shuffle",
    metadataBase: new URL(baseUrl),
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : locale === "fr" ? "fr_FR" : locale === "es" ? "es_ES" : locale === "pt-br" ? "pt_BR" : locale === "de" ? "de_DE" : locale === "ar" ? "ar_AR" : "en_US",
      url: `${baseUrl}/${locale}`,
      siteName: "Dish Shuffle",
      title: "Dish Shuffle - Discover Your Next Meal",
      description: "Find your next favorite meal with Dish Shuffle. Browse thousands of recipes from around the world.",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Dish Shuffle - Recipe Discovery Platform",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Dish Shuffle - Discover Your Next Meal",
      description:
        "Discover delicious recipes from around the world. Get random meal suggestions and find your next favorite dish.",
      images: ["/og-image.jpg"],
      creator: "@dishshuffle",
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
    alternates,
    manifest: "/site.webmanifest",
    other: {
      "google-adsense-account": "ca-pub-2393924023690242",
    },
  };
}

import AutoGoogleTranslate from "@/components/features/AutoGoogleTranslate";
import GoogleTranslateFix from "@/components/features/GoogleTranslateFix";
import EzoicAdsHandler from "@/components/features/EzoicAdsHandler";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Validate environment variables on server side
  validateEnvVars();

  const { locale } = await params;

  // Enable static rendering
  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  // Ensure strict locale format for html lang attribute (pt-BR specifically)
  const htmlLang = locale === 'pt-br' ? 'pt-BR' : locale;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={htmlLang} dir={dir}>
      <head>
        {/* Ezoic Privacy & Header Scripts */}
        <Script
          id="ezoic-privacy-cmp"
          strategy="afterInteractive"
          src="https://cmp.gatekeeperconsent.com/min.js"
          data-cfasync="false"
        />
        <Script
          id="ezoic-privacy-gatekeeper"
          strategy="afterInteractive"
          src="https://the.gatekeeperconsent.com/cmp.min.js"
          data-cfasync="false"
        />
        <Script
          id="ezoic-header"
          strategy="afterInteractive"
          src="//www.ezojs.com/ezoic/sa.min.js"
        />
        <Script
          id="ezoic-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.ezstandalone = window.ezstandalone || {}; ezstandalone.cmd = ezstandalone.cmd || [];`,
          }}
        />

        {/* Google Consent Mode - Set defaults BEFORE loading gtag.js */}
        <Script
          id="google-consent-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              // Set default consent to 'denied' for GDPR compliance
              // This runs BEFORE gtag.js loads
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'ads_data_redaction': true,
                'url_passthrough': true,
                'wait_for_update': 500
              });
            `,
          }}
        />
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}');
            `,
          }}
        />
        {/* Google Ads Conversion Event - Page View */}
        <Script
          id="google-ads-conversion"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              gtag('event', 'conversion_event_page_view', {});
            `,
          }}
        />
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2393924023690242"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ToastProvider>
            <SurpriseMeProvider>
              <FavoritesProvider>
                <div className="flex flex-col min-h-screen">
                  <div className="notranslate"><Navigation /></div>
                  <main className="flex-grow">{children}</main>
                  <div className="notranslate"><Footer /></div>

                  <SurpriseMeModal />
                  <GoogleTranslateFix />
                  <AutoGoogleTranslate locale={locale} />
                  <EzoicAdsHandler />
                </div>
                <ToastContainer />
              </FavoritesProvider>
            </SurpriseMeProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
