"use client";

import Button from "@/components/ui/Button";
import { Link } from "@/navigation";
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

export default function CTASection() {
  const t = useTranslations("CTA");

  return (
    <section className="my-20">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-primary-600 via-primary-500 to-accent-500 p-16 text-center shadow-hard">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">
              {t("title")}
            </h2>
            <p className="text-xl mb-8 text-white/90">{t("subtitle")}</p>
            <Link href="/recipes">
              <Button
                size="lg"
                className="bg-white text-primary-500 hover:bg-white/90 shadow-hard"
              >
                <SparklesIcon className="w-5 h-5" />
                {t("button")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
