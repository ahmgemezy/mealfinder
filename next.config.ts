import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

// Check if building for Cloudflare static export
const isCloudflare = process.env.CLOUDFLARE_BUILD === "true";

const nextConfig: NextConfig = {
  // Enable static export for Cloudflare Pages (no worker needed)
  ...(isCloudflare && {
    output: "export",
    trailingSlash: true,
  }),
  async redirects() {
    // Redirects don't work with static export, handle in _redirects file
    if (isCloudflare) return [];
    return [
      {
        source: "/recipes/search",
        destination: "/recipes",
        permanent: true,
      },
      {
        source: "/ads.txt",
        destination: "https://srv.adstxtmanager.com/19390/dishshuffle.com",
        permanent: true,
      },
    ];
  },
  turbopack: {
    // Alias heavy translation library to stub for Cloudflare builds
    ...(isCloudflare && {
      resolveAlias: {
        "google-translate-api-x": "./lib/services/google-translate-stub.js",
      },
    }),
  },
  images: {
    unoptimized: true, // Disable Vercel Image Optimization due to quota exceeded
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.themealdb.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "img.spoonacular.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    qualities: [10, 75, 90],
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
