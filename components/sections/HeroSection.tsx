"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import { Link } from "@/navigation";
import { useSurpriseMe } from "@/lib/contexts/SurpriseMeContext";
import { useTranslations } from "next-intl";

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

export default function HeroSection() {
    const { openModal } = useSurpriseMe();
    const t = useTranslations('Hero');

    return (
        <section className="relative overflow-hidden min-h-[600px] flex items-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-bg.png"
                    alt="Delicious food background"
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                />
                {/* Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
            </div>

            {/* Decorative blobs - subtle overlay */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-accent-500/20 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

            <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8 animate-fade-in">
                        <span className="w-2 h-2 rounded-full bg-accent-300 animate-pulse" />
                        {t('subtitle')}
                    </div>

                    <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-white tracking-tight leading-tight animate-slide-up">
                        {t('title')}
                    </h1>

                    <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed animate-slide-up animation-delay-100">
                        {t('subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up animation-delay-200">
                        <Button
                            size="lg"
                            onClick={openModal}
                            className="w-full sm:w-auto bg-white text-primary-500 hover:bg-primary-50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-bold text-lg px-8 py-4 h-auto rounded-full"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            {t('surprise')}
                        </Button>
                        <Link href="/recipes">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold text-lg px-8 py-4 h-auto rounded-full"
                            >
                                {t('cta')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
