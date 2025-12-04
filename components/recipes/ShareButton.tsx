"use client";

import React, { useState, useRef, useEffect } from "react";
import { Recipe } from "@/lib/types/recipe";
import { useTranslations } from "next-intl";

interface ShareButtonProps {
    recipe: Recipe;
    className?: string;
}

export default function ShareButton({ recipe, className = "" }: ShareButtonProps) {
    const t = useTranslations('Recipe');
    const [isOpen, setIsOpen] = useState(false);
    const [showCopied, setShowCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleShare = () => {
        setIsOpen((prev) => !prev);
    };

    const handleNativeShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: `${recipe.name} - Dish Shuffle`,
                    text: t('shareDescription'),
                    url: window.location.href,
                });
            } catch (error) {
                console.log("Error sharing:", error);
            }
        }
    };

    const copyToClipboard = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(window.location.href);
            } else {
                // Fallback for non-secure contexts
                const textArea = document.createElement("textarea");
                textArea.value = window.location.href;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                }
                document.body.removeChild(textArea);
            }
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
            setIsOpen(false);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
    const shareText = encodeURIComponent(`${t('shareDescription')}: ${recipe.name}`);

    const socialLinks = [
        {
            name: "Facebook",
            url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
            color: "hover:text-blue-600"
        },
        {
            name: "X (Twitter)",
            url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            color: "hover:text-black dark:hover:text-white"
        },
        {
            name: "WhatsApp",
            url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm2.233-2.233l.54.538c1.417 1.404 3.29 2.146 5.21 2.146 3.58 0 6.5-2.92 6.5-6.5 0-3.58-2.92-6.5-6.5-6.5-3.58 0-6.5 2.92-6.5 6.5 0 1.92.742 3.793 2.146 5.21l.539.54.54-.54 2.233-2.233-.54-.54c-.703-.702-1.09-1.636-1.09-2.63 0-2.056 1.673-3.729 3.729-3.729 2.056 0 3.729 1.673 3.729 3.729 0 .994-.387 1.928-1.09 2.63l-.54.54 2.233 2.233.54-.54c1.404-1.417 2.146-3.29 2.146-5.21 0-4.08-3.32-7.4-7.4-7.4-4.08 0-7.4 3.32-7.4 7.4 0 1.92.742 3.793 2.146 5.21l.54.54z" fillRule="evenodd" clipRule="evenodd" />
                    <path d="M12.011 2c5.506 0 9.989 4.483 9.989 9.989 0 5.506-4.483 9.989-9.989 9.989C6.505 21.978 2.022 17.495 2.022 11.989 2.022 6.483 6.505 2 12.011 2z" />
                </svg>
            ),
            color: "hover:text-green-500"
        }
    ];

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={handleShare}
                className={`group relative flex items-center justify-center w-full gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${className} ${isOpen
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400"
                    : "bg-white dark:bg-card text-muted-foreground hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 border border-border shadow-sm hover:shadow-md"
                    }`}
                aria-label={t('share')}
            >
                <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="font-medium">{t('share')}</span>
            </button>

            {/* Fallback Menu */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        {socialLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-foreground ${link.color}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.icon}
                                {link.name}
                            </a>
                        ))}
                        <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-foreground hover:text-primary-500"
                        >
                            {showCopied ? (
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                            {showCopied ? t('copied') : t('copyLink')}
                        </button>
                        {typeof navigator !== 'undefined' && 'share' in navigator && (
                            <button
                                onClick={handleNativeShare}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-foreground hover:text-primary-500"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                More Options...
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
