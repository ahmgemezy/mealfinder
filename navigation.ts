import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'fr', 'es', 'pt-br', 'de', 'ar'],
    defaultLocale: 'en'
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
