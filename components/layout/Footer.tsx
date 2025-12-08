import React from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

export default function Footer() {
    const t = useTranslations('Footer');
    const tHero = useTranslations('Hero'); // Reuse subtitle
    const currentYear = new Date().getFullYear();

    return (
        <footer className="notranslate bg-muted border-t border-border mt-20 mb-16 md:mb-0">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-1 mb-4">
                            <div className="relative w-14 h-14">
                                <Image
                                    src="/logo-final.png"
                                    alt="Dish Shuffle Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="font-display text-xl font-bold gradient-text">
                                Dish Shuffle
                            </span>
                        </Link>
                        <p className="text-muted-foreground max-w-md">
                            {tHero('subtitle')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">{t('quickLinks')}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/"
                                    className="text-muted-foreground hover:text-primary-500 transition-colors"
                                >
                                    {t('home')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/surprise-me"
                                    className="text-muted-foreground hover:text-primary-500 transition-colors"
                                >
                                    {t('surpriseMe')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/recipes"
                                    className="text-muted-foreground hover:text-primary-500 transition-colors"
                                >
                                    {t('browseRecipes')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/favorites"
                                    className="text-muted-foreground hover:text-primary-500 transition-colors"
                                >
                                    {t('favorites')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-muted-foreground hover:text-primary-500 transition-colors"
                                >
                                    {t('faq')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">{t('legal')}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/privacy-policy"
                                    className="text-muted-foreground hover:text-primary-500 transition-colors"
                                >
                                    {t('privacyPolicy')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/cookies-policy"
                                    className="text-muted-foreground hover:text-primary-500 transition-colors"
                                >
                                    {t('cookiePolicy')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms-of-service"
                                    className="text-muted-foreground hover:text-primary-500 transition-colors"
                                >
                                    {t('termsOfService')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
                    <p>
                        © {currentYear} Dish Shuffle {t('rightsReserved')}.
                    </p>
                </div>
            </div>
        </footer>
    );
}
