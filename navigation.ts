import { createNavigation } from 'next-intl/navigation';
import { defineRouting, Pathnames } from 'next-intl/routing';

export const locales = ['en', 'fr', 'es', 'pt-br', 'de', 'ar'] as const;

export const pathnames = {
    '/': '/',
    '/collections': {
        en: '/collections',
        fr: '/collections',
        es: '/colecciones',
        'pt-br': '/colecoes',
        de: '/sammlungen',
        ar: '/collections'
    },
    '/recipes': {
        en: '/recipes',
        fr: '/recettes',
        es: '/recetas',
        'pt-br': '/receitas',
        de: '/rezepte',
        ar: '/recipes'
    },
    '/blog': {
        en: '/blog',
        fr: '/blog',
        es: '/blog',
        'pt-br': '/blog',
        de: '/blog',
        ar: '/blog'
    },
    '/about': {
        en: '/about',
        fr: '/a-propos',
        es: '/sobre-nosotros',
        'pt-br': '/sobre',
        de: '/ueber-uns',
        ar: '/about'
    },
    '/contact': {
        en: '/contact',
        fr: '/contact',
        es: '/contacto',
        'pt-br': '/contato',
        de: '/kontakt',
        ar: '/contact'
    }
} satisfies Pathnames<typeof locales>;

export const routing = defineRouting({
    locales,
    defaultLocale: 'en',
    pathnames
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
