import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'fr', 'es'],

    // Used when no locale matches
    defaultLocale: 'en'
});

export const config = {
    // Match internationalized pathnames, but exclude API routes, static files, and sitemap/robots
    matcher: [
        // Match all pathnames except those starting with:
        // - api (API routes)
        // - _next/static (static files)
        // - _next/image (image optimization files)
        // - Static assets and SEO files
        '/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.png|sitemap\\.xml|robots\\.txt|icon\\.png|site\\.webmanifest|og-image\\.jpg|logo-final\\.png|logo\\.jpeg|hero-bg\\.webp|.*\\.svg).*)'
    ]
};
