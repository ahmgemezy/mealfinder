"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/navigation";
import { useState, useRef, useEffect } from "react";

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: "en", label: "English", flag: "🇺🇸" },
        { code: "fr", label: "Français", flag: "🇫🇷" },
        { code: "es", label: "Español", flag: "🇪🇸" },
    ];

    const currentLanguage = languages.find((l) => l.code === locale) || languages[0];

    const switchLanguage = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef} translate="no">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-muted/50 transition-colors"
            >
                <span className="text-lg">{currentLanguage.flag}</span>
                <span className="text-sm font-medium hidden lg:inline">{currentLanguage.label}</span>
                <svg
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden">
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => switchLanguage(lang.code)}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-muted transition-colors ${locale === lang.code ? "bg-primary-50 text-primary-600 font-medium" : "text-foreground"
                                    }`}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
