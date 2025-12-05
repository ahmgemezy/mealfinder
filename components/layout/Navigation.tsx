"use client";

import React, { useEffect, useState } from "react";
import { Link, usePathname } from "@/navigation"; // Use localized navigation
import { useSurpriseMe } from "@/lib/contexts/SurpriseMeContext";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/features/LanguageSwitcher";
import Image from "next/image";

export default function Navigation() {
    const t = useTranslations('Navigation');
    const pathname = usePathname();
    const { openModal, closeModal } = useSurpriseMe();
    const { openAuthModal } = useFavorites();
    const [user, setUser] = useState<User | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("Error getting session:", error);
                // If the refresh token is invalid, sign out to clear the stale session
                if (error.message.includes("Refresh Token")) {
                    supabase.auth.signOut();
                }
            }
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Close modal when route changes
    useEffect(() => {
        closeModal();
    }, [pathname, closeModal]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    const getUserName = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name;
        }
        return user?.email?.split("@")[0] || "User";
    };

    const navItems = [
        { href: "/", label: t('home'), icon: HomeIcon },
        { href: "/recipes", label: t('recipes'), icon: BookIcon },
        { href: "/favorites", label: t('favorites'), icon: HeartIcon },
    ];

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Desktop & Mobile Navigation */}
            <nav className="notranslate fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        <Link href="/" className="flex items-center gap-1 group">
                            <div className="relative w-14 h-14 group-hover:scale-105 transition-transform duration-300">
                                <Image
                                    src="/logo-final.png"
                                    alt="DishShuffle Logo"
                                    fill
                                    className="object-contain"
                                    sizes="56px"
                                />
                            </div>
                            <span className="hidden md:block font-display text-2xl font-bold text-foreground tracking-tight group-hover:text-primary-400 transition-colors">
                                Dish Shuffle
                            </span>
                        </Link>

                        {/* Desktop Navigation Items */}
                        <div className="hidden md:flex items-center gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={(e) => {
                                        if (item.href === "/favorites" && !user) {
                                            e.preventDefault();
                                            openAuthModal();
                                        }
                                    }}
                                    className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${isActive(item.href)
                                        ? "bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={openModal}
                                className="px-5 py-2.5 rounded-full font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
                            >
                                {t('surpriseMe')}
                            </button>

                            <div className="w-px h-6 bg-border mx-2" />

                            <LanguageSwitcher />

                            <div className="w-px h-6 bg-border mx-2" />

                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm bg-muted hover:bg-muted/80 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                                            {getUserName().charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden lg:inline">{getUserName()}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showUserMenu && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                            <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden">
                                                <div className="p-3 border-b border-border">
                                                    <p className="font-medium text-sm truncate">{getUserName()}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        href="/favorites"
                                                        className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        {t('myFavorites')}
                                                    </Link>
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                                    >
                                                        {t('signOut')}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/signin"
                                    className="px-5 py-2.5 rounded-full font-medium text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-lg hover:shadow-xl"
                                >
                                    {t('signIn')}
                                </Link>
                            )}
                        </div>

                        {/* Mobile: User Avatar or Sign In + Language Switcher */}
                        <div className="md:hidden flex items-center gap-2">
                            <LanguageSwitcher />
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-full font-medium text-sm bg-muted hover:bg-muted/80 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                                            {getUserName().charAt(0).toUpperCase()}
                                        </div>
                                    </button>

                                    {showUserMenu && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                            <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden">
                                                <div className="p-3 border-b border-border">
                                                    <p className="font-medium text-sm truncate">{getUserName()}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        href="/favorites"
                                                        className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        {t('myFavorites')}
                                                    </Link>
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                                    >
                                                        {t('signOut')}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/signin"
                                    className="px-4 py-2 rounded-full font-medium text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-lg"
                                >
                                    {t('signIn')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="notranslate md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-card/95 backdrop-blur-lg border-t border-border pb-safe shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => {
                                    if (item.href === "/favorites" && !user) {
                                        e.preventDefault();
                                        openAuthModal();
                                    }
                                }}
                                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${active
                                    ? "text-primary-500 scale-105"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${active ? "fill-current" : "stroke-current"}`} />
                                <span className="text-[10px] font-bold tracking-wide uppercase">{item.label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={openModal}
                        className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 text-muted-foreground hover:text-foreground"
                    >
                        <SparklesIcon className="w-6 h-6 stroke-current" />
                        <span className="text-[10px] font-bold tracking-wide uppercase">{t('surpriseMe')}</span>
                    </button>
                </div>
            </nav>

            {/* Spacer for fixed navigation */}
            <div className="h-16 md:h-20" />
        </>
    );
}

// Icon components
function HomeIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
        </svg>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
        </svg>
    );
}

function BookIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
        </svg>
    );
}

function HeartIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
        </svg>
    );
}
