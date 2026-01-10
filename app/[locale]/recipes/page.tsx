import { Metadata } from "next";
import RecipesList from "@/components/recipes/RecipesList";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-static";

interface RecipesPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
    params,
    searchParams
}: RecipesPageProps): Promise<Metadata> {
    const { locale } = await params;
    const { category, area, search } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Recipes' });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dishshuffle.com";
    let canonical = `${baseUrl}/${locale}/recipes`;

    // Add canonical for filtered pages to prevent duplicate content
    if (typeof category === 'string' && category) {
        canonical += `?category=${encodeURIComponent(category)}`;
    } else if (typeof area === 'string' && area) {
        canonical += `?area=${encodeURIComponent(area)}`;
    }

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
