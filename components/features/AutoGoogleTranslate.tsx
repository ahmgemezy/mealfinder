"use client";

import { useEffect } from "react";
import { usePathname } from "@/navigation";
import Script from "next/script";

interface AutoGoogleTranslateProps {
    locale: string;
}

export default function AutoGoogleTranslate({ locale }: AutoGoogleTranslateProps) {
    const pathname = usePathname();

    useEffect(() => {
        // Function to initialize Google Translate
        const googleTranslateElementInit = () => {
            // @ts-expect-error - Google Translate API is not typed
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    includedLanguages: "en,fr,es,pt,de,ar",
                    autoDisplay: false,
                },
                "google_translate_element"
            );
        };

        // Expose init function to global scope
        // @ts-expect-error - Extending window object
        window.googleTranslateElementInit = googleTranslateElementInit;
    }, []);

    useEffect(() => {
        // Manage Google Translate Cookies based on current locale

        // Helper to set cookie
        const setCookie = (name: string, value: string, domain?: string) => {
            let cookie = `${name}=${value}; path=/`;
            if (domain) cookie += `; domain=${domain}`;
            document.cookie = cookie;
        };

        // Helper to delete cookie
        const deleteCookie = (name: string, domain?: string) => {
            let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
            if (domain) cookie += `; domain=${domain}`;
            document.cookie = cookie;
        };

        const domain = document.domain;
        // Also handle top-level domain if needed (e.g. .localhost or .example.com)
        const topDomain = domain.split('.').slice(-2).join('.');

        // Function to map Next.js locale to Google Translate locale
        const getGoogleLocale = (l: string) => {
            if (l === 'pt-br') return 'pt';
            return l;
        };

        const supportedLocales = ['ar', 'de', 'es', 'fr', 'pt-br', 'en'];
        const isSupported = supportedLocales.includes(locale);

        if (isSupported) {
            // Native translation available. Do NOT force Google Translate.
            // Clear any existing cookie to prevent double-translation.
            // We set it to /en/en which effectively turns it off or resets it.
            const cookieValue = '/en/en';
            setCookie('googtrans', cookieValue);
            setCookie('googtrans', cookieValue, domain);
            setCookie('googtrans', cookieValue, `.${domain}`);
            if (domain !== topDomain) setCookie('googtrans', cookieValue, `.${topDomain}`);
        } else {
            // Unsupported locale: Force Google Translate
            const googleLocale = getGoogleLocale(locale);
            const cookieValue = `/en/${googleLocale}`;
            setCookie('googtrans', cookieValue);
            setCookie('googtrans', cookieValue, domain);
            setCookie('googtrans', cookieValue, `.${domain}`);
        }

    }, [locale, pathname]);

    return (
        <>
            <div
                id="google_translate_element"
                style={{ display: 'none' }} // Hide the widget UI
                aria-hidden="true"
            />
            <Script
                src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                strategy="lazyOnload"
            />
        </>
    );
}
