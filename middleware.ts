import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

export default createMiddleware(routing);

export const config = {
    // Match all pathnames except for:
    // - /api routes
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - files with extensions (e.g. favicon.ico, llms.txt, robots.txt)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
