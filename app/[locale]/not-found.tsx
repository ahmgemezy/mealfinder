"use client";

import { Link } from "@/navigation";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export default function NotFound() {
    const t = useTranslations("NotFound");

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
            {/* Floating Food Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <span className="absolute text-6xl opacity-10 animate-float-1" style={{ top: '10%', left: '5%' }}>🍕</span>
                <span className="absolute text-5xl opacity-10 animate-float-2" style={{ top: '20%', right: '10%' }}>🍔</span>
                <span className="absolute text-7xl opacity-10 animate-float-3" style={{ top: '60%', left: '8%' }}>🥗</span>
                <span className="absolute text-4xl opacity-10 animate-float-4" style={{ top: '70%', right: '15%' }}>🍜</span>
                <span className="absolute text-5xl opacity-10 animate-float-5" style={{ top: '40%', left: '80%' }}>🍰</span>
                <span className="absolute text-6xl opacity-10 animate-float-1" style={{ top: '85%', left: '50%' }}>🌮</span>
                <span className="absolute text-4xl opacity-10 animate-float-2" style={{ top: '15%', left: '60%' }}>🍣</span>
            </div>

            {/* Main Content */}
            <div className="text-center relative z-10">
                {/* Animated Plate with Utensils */}
                <div className="relative inline-block mb-8">
                    {/* Fork */}
                    <span className="absolute -left-16 top-1/2 -translate-y-1/2 text-6xl md:text-8xl animate-wiggle-left origin-bottom">
                        🍴
                    </span>

                    {/* Plate with 404 */}
                    <div className="relative animate-bounce-plate">
                        <span className="text-[120px] md:text-[160px] leading-none">🍽️</span>
                        <span className="absolute inset-0 flex items-center justify-center font-display text-4xl md:text-5xl font-bold text-primary-500 mt-2">
                            404
                        </span>
                    </div>

                    {/* Knife */}
                    <span className="absolute -right-12 top-1/2 -translate-y-1/2 text-6xl md:text-8xl animate-wiggle-right origin-bottom">
                        🔪
                    </span>
                </div>

                {/* Text Content */}
                <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 gradient-text">
                    {t("title")}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-3 max-w-md mx-auto">
                    {t("description")}
                </p>
                <p className="text-lg text-muted-foreground mb-8 max-w-sm mx-auto">
                    {t("suggestion")}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/">
                        <Button size="lg" variant="primary">
                            <span className="mr-2">🏠</span>
                            {t("goHome")}
                        </Button>
                    </Link>
                    <Link href="/recipes">
                        <Button size="lg" variant="outline">
                            <span className="mr-2">📖</span>
                            {t("browseRecipes")}
                        </Button>
                    </Link>
                </div>

                {/* Fun Tagline */}
                <p className="mt-12 text-sm text-muted-foreground animate-pulse">
                    {t("funTagline")}
                </p>
            </div>
        </div>
    );
}
