import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

export default createMiddleware(routing);

export const config = {
    // Match only internationalized pathnames
    matcher: [
        // Match all pathnames except those starting with:
        // - api (API routes)
        // - _next/static (static files)
        // - _next/image (image optimization files)
        // - favicon.ico (favicon file)
        // - site.webmanifest (web manifest file)
        // - various other static assets
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
