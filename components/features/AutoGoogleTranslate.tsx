"use client";

import { useEffect } from "react";
import { usePathname } from "@/navigation";

interface AutoGoogleTranslateProps {
    locale: string;
}

export default function AutoGoogleTranslate({ locale }: AutoGoogleTranslateProps) {
    const pathname = usePathname();

    useEffect(() => {
        // Function to initialize Google Translate
        const googleTranslateElementInit = () => {
            // @ts-ignore
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    includedLanguages: "en,fr,es",
                    autoDisplay: false,
                },
                "google_translate_element"
            );
        };

        // Expose init function to global scope
        // @ts-ignore
        window.googleTranslateElementInit = googleTranslateElementInit;

        // Load Google Translate script if not already loaded
        if (!document.getElementById("google-translate-script")) {
            const script = document.createElement("script");
            script.id = "google-translate-script";
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        }
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

        if (locale === 'en') {
            // If we are in English, we want to DISABLE Google Translate
            // We do this by clearing the 'googtrans' cookie
            deleteCookie('googtrans');
            deleteCookie('googtrans', domain);
            deleteCookie('googtrans', `.${domain}`);
            if (domain !== topDomain) deleteCookie('googtrans', `.${topDomain}`);
        } else {
            // If we are in another language, FORCE Google Translate
            // Format: /source_lang/target_lang
            const cookieValue = `/en/${locale}`;
            setCookie('googtrans', cookieValue);
            setCookie('googtrans', cookieValue, domain);
            setCookie('googtrans', cookieValue, `.${domain}`);
        }

    }, [locale, pathname]);

    return (
        <div
            id="google_translate_element"
            style={{ display: 'none' }} // Hide the widget UI
            aria-hidden="true"
        />
    );
}
