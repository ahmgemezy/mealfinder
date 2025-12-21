"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

// Extend Window interface for gtag
declare global {
    interface Window {
        gtag?: (
            command: string,
            action: string,
            params?: Record<string, string | number | boolean>
        ) => void;
    }
}

type CookiePreferences = {
    essential: boolean;
    performance: boolean;
    functional: boolean;
    targeting: boolean;
};

export default function CookieConsent() {
    const t = useTranslations('CookieConsent');
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true,
        performance: false,
        functional: false,
        targeting: false,
    });

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        } else {
            // Restore Google consent from previous session
            try {
                // Handle legacy string values like "all" from previous versions
                if (consent === "all" || consent === "essential") {
                    // Migrate to new format
                    const newPrefs: CookiePreferences = {
                        essential: true,
                        performance: consent === "all",
                        functional: consent === "all",
                        targeting: consent === "all",
                    };
                    localStorage.setItem("cookie-consent", JSON.stringify(newPrefs));
                    return;
                }

                const savedPrefs: CookiePreferences = JSON.parse(consent);
                if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                    window.gtag('consent', 'update', {
                        'ad_storage': savedPrefs.targeting ? 'granted' : 'denied',
                        'ad_user_data': savedPrefs.targeting ? 'granted' : 'denied',
                        'ad_personalization': savedPrefs.targeting ? 'granted' : 'denied',
                        'analytics_storage': savedPrefs.performance ? 'granted' : 'denied',
                    });
                }
            } catch (e) {
                // If JSON parsing fails, clear invalid data and show consent banner again
                console.error('Error restoring consent, resetting:', e);
                localStorage.removeItem("cookie-consent");
                // Schedule state update for next render to avoid cascading updates
                setTimeout(() => {
                    setIsVisible(true);
                }, 0);
            }
        }
    }, []);

    const savePreferences = (prefs: CookiePreferences) => {
        localStorage.setItem("cookie-consent", JSON.stringify(prefs));

        // Update Google Consent Mode
        // This informs Google Analytics/Ads about user's consent choices
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                'ad_storage': prefs.targeting ? 'granted' : 'denied',
                'ad_user_data': prefs.targeting ? 'granted' : 'denied',
                'ad_personalization': prefs.targeting ? 'granted' : 'denied',
                'analytics_storage': prefs.performance ? 'granted' : 'denied',
            });
        }

        setIsVisible(false);
        setShowSettings(false);
    };

    const handleAcceptAll = () => {
        savePreferences({
            essential: true,
            performance: true,
            functional: true,
            targeting: true,
        });
    };

    const handleRejectAll = () => {
        savePreferences({
            essential: true,
            performance: false,
            functional: false,
            targeting: false,
        });
    };

    const handleSaveSettings = () => {
        savePreferences(preferences);
    };

    if (!isVisible) return null;

    if (showSettings) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-card w-full max-w-2xl rounded-3xl shadow-hard border border-border overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-border">
                        <h3 className="font-display text-2xl font-bold">{t('settingsModal.title')}</h3>
                        <p className="text-muted-foreground mt-2">
                            {t('settingsModal.description')}
                        </p>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-6">
                        {/* Essential */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-foreground">{t('settingsModal.essential.title')}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t('settingsModal.essential.description')}
                                </p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-500 opacity-50 cursor-not-allowed">
                                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                            </div>
                        </div>

                        {/* Performance */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-foreground">{t('settingsModal.performance.title')}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t('settingsModal.performance.description')}
                                </p>
                            </div>
                            <button
                                onClick={() => setPreferences(p => ({ ...p, performance: !p.performance }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.performance ? "bg-primary-500" : "bg-muted-foreground/30"
                                    }`}
                            >
                                <span
                                    className={`${preferences.performance ? "translate-x-6" : "translate-x-1"
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                                />
                            </button>
                        </div>

                        {/* Functional */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-foreground">{t('settingsModal.functional.title')}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t('settingsModal.functional.description')}
                                </p>
                            </div>
                            <button
                                onClick={() => setPreferences(p => ({ ...p, functional: !p.functional }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.functional ? "bg-primary-500" : "bg-muted-foreground/30"
                                    }`}
                            >
                                <span
                                    className={`${preferences.functional ? "translate-x-6" : "translate-x-1"
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                                />
                            </button>
                        </div>

                        {/* Targeting */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-foreground">{t('settingsModal.targeting.title')}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t('settingsModal.targeting.description')}
                                </p>
                            </div>
                            <button
                                onClick={() => setPreferences(p => ({ ...p, targeting: !p.targeting }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.targeting ? "bg-primary-500" : "bg-muted-foreground/30"
                                    }`}
                            >
                                <span
                                    className={`${preferences.targeting ? "translate-x-6" : "translate-x-1"
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowSettings(false)}>
                            {t('settingsModal.back')}
                        </Button>
                        <Button onClick={handleSaveSettings}>
                            {t('settingsModal.save')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 p-3 md:p-6 bg-background/95 backdrop-blur-md border-t border-border shadow-hard animate-slide-up">
            <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-6">
                <div className="flex-1">
                    <h3 className="font-display text-base md:text-lg font-bold mb-1">
                        {t('title')}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {t('description')}
                    </p>
                </div>
                <div className="flex flex-row gap-2 w-full md:w-auto flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSettings(true)}
                        className="whitespace-nowrap text-xs md:text-sm flex-1 md:flex-none"
                    >
                        {t('settings')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRejectAll}
                        className="whitespace-nowrap text-xs md:text-sm flex-1 md:flex-none"
                    >
                        {t('reject')}
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAcceptAll}
                        className="whitespace-nowrap text-xs md:text-sm flex-1 md:flex-none"
                    >
                        {t('acceptAll')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
