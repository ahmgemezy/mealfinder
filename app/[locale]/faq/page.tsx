import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FAQClient from "./FAQClient";
import { Link } from "@/navigation";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dishshuffle.com";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "FAQ" });

    return {
        title: t("title"),
        description: t("subtitle"),
        openGraph: {
            title: t("title"),
            description: t("subtitle"),
            url: `${baseUrl}/${locale}/faq`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: t("title"),
            description: t("subtitle"),
        },
        alternates: {
            canonical: `${baseUrl}/${locale}/faq`,
            languages: {
                en: `${baseUrl}/en/faq`,
                fr: `${baseUrl}/fr/faq`,
                es: `${baseUrl}/es/faq`,
            },
        },
    };
}

export default async function FAQPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "FAQ" });

    // Generate FAQ structured data for Google
    const categories = [
        {
            key: "cooking",
            questions: [
                "howToBoilEgg",
                "howToCookPasta",
                "howToCookRice",
                "howToCookSteak",
                "bakingPowderVsSoda",
            ],
        },
        {
            key: "safety",
            questions: [
                "shouldWashChicken",
                "howLongFoodLeftOut",
                "frozenVsFresh",
                "cheeseGoneBad",
                "restMeatAfterCooking",
            ],
        },
        {
            key: "substitutions",
            questions: [
                "butterSaltedOrUnsalted",
                "freshVsDriedHerbs",
                "oliveOilForBaking",
                "wholeWheatFlour",
                "eggSubstitutes",
            ],
        },
        {
            key: "planning",
            questions: [
                "whatIsMealPlanning",
                "howOftenMealPlan",
                "mealPlanSaveMoney",
                "mealPrepStorage",
                "portionSizes",
            ],
        },
        {
            key: "platform",
            questions: [
                "howToSaveRecipes",
                "howToSearchRecipes",
                "surpriseMeFeature",
                "recipesFromWhere",
                "canIShareRecipes",
            ],
        },
    ];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: categories.flatMap((category) =>
            category.questions.map((questionKey) => ({
                "@type": "Question",
                name: t(`questions.${questionKey}.q`),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: t(`questions.${questionKey}.a`),
                },
            }))
        ),
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                        {t("title")}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t("subtitle")}
                    </p>
                </div>

                {/* FAQ Content */}
                <FAQClient />

                {/* CTA Section */}
                <div className="mt-16 text-center p-8 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 rounded-2xl border border-primary-200 dark:border-primary-800">
                    <h2 className="font-display text-2xl font-bold mb-3 text-foreground">
                        Still have questions?
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Explore our recipe collection or try the Surprise Me feature to discover something new!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/recipes"
                            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg hover:shadow-xl"
                        >
                            Browse Recipes
                        </Link>
                        <Link
                            href="/"
                            className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
