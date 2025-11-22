"use client";

import { useState, useEffect } from "react";
import { Link } from "@/navigation";
import Button from "@/components/ui/Button";

type CookiePreferences = {
    essential: boolean;
    performance: boolean;
    functional: boolean;
    targeting: boolean;
};

export default function CookieConsent() {
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
        }
    }, []);

    const savePreferences = (prefs: CookiePreferences) => {
        localStorage.setItem("cookie-consent", JSON.stringify(prefs));
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
                        <h3 className="font-display text-2xl font-bold">Cookie Settings</h3>
                        <p className="text-muted-foreground mt-2">
                            Manage your cookie preferences. Essential cookies are always active.
                        </p>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-6">
                        {/* Essential */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-foreground">Essential Cookies</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Necessary for the website to function. Cannot be disabled.
                                </p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-500 opacity-50 cursor-not-allowed">
                                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                            </div>
                        </div>

                        {/* Performance */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-foreground">Performance Cookies</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Help us understand how visitors interact with the website.
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
                                <h4 className="font-bold text-foreground">Functional Cookies</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Enable enhanced functionality and personalization.
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
                                <h4 className="font-bold text-foreground">Targeting Cookies</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Used to deliver advertisements more relevant to you and your interests.
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
                            Back
                        </Button>
                        <Button onClick={handleSaveSettings}>
                            Save Preferences
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-background/95 backdrop-blur-md border-t border-border shadow-hard animate-slide-up">
            <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                    <h3 className="font-display text-lg font-bold mb-2">
                        We value your privacy
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We use cookies to enhance your browsing experience, serve personalized
                        content, and analyze our traffic. By clicking "Accept All", you
                        consent to our use of cookies.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => setShowSettings(true)}
                        className="whitespace-nowrap"
                    >
                        Cookie Settings
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleRejectAll}
                        className="whitespace-nowrap"
                    >
                        Reject All
                    </Button>
                    <Button onClick={handleAcceptAll} className="whitespace-nowrap">
                        Accept All
                    </Button>
                </div>
            </div>
        </div>
    );
}
