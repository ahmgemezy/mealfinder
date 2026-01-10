import { Metadata } from "next";
import RecipesList from "@/components/recipes/RecipesList";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-static";

export async function generateStaticParams() {
    return [
        { locale: "en" },
        { locale: "fr" },
        { locale: "es" },
        { locale: "pt-br" },
        { locale: "de" },
        { locale: "ar" },
    ];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Recipes' });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dishshuffle.com";
    const canonical = `${baseUrl}/${locale}/recipes`;

    return {
        title: t('title'),
        description: t('subtitle'),
        alternates: {
            canonical: canonical,
        },
        openGraph: {
            title: t('title'),
            description: t('subtitle'),
            url: canonical,
        }
    };
}

export default function RecipesPage() {
    return <RecipesList />;
}
