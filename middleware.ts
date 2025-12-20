import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    const response = intlMiddleware(request);

    // Get locale from path
    const pathname = request.nextUrl.pathname;
    const locale = pathname.split('/')[1];

    if (locale && routing.locales.includes(locale as any)) {
        // Map Next.js locale to Google Translate locale
        let googleLocale = locale;
        if (locale === 'pt-br') googleLocale = 'pt';

        // Set cookie value: /source/target
        // logic: always translate from 'en' to 'target'
        const cookieValue = `/en/${googleLocale}`;

        response.cookies.set('googtrans', cookieValue, {
            path: '/',
            domain: request.nextUrl.hostname.includes('localhost') ? undefined : `.${request.nextUrl.hostname.split('.').slice(-2).join('.')}`
        });

        // Also set on root domain just in case
        response.cookies.set('googtrans', cookieValue, { path: '/' });
    }

    return response;
}

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
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|site.webmanifest|blog/rss.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
