import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

export default createMiddleware(routing);

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt|site.webmanifest|blog/rss.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
