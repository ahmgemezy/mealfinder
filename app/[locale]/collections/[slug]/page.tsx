import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCollectionBySlug, getAllCollectionSlugs } from '@/lib/collections';
import { translateRecipesList } from '@/lib/services/translation';
import RecipeCard from '@/components/ui/RecipeCard';
import Breadcrumb from '@/components/ui/Breadcrumb';

// Force static generation for these pages
export const dynamic = 'force-static';
export const revalidate = 86400; // Recalculate daily

interface CollectionPageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

export async function generateStaticParams() {
    const slugs = getAllCollectionSlugs();
    const locales = ['en', 'fr', 'es', 'pt-br', 'de', 'ar']; // Should import from config but hardcoding for safety now

    const params = [];
    for (const slug of slugs) {
        for (const locale of locales) {
            params.push({ slug, locale });
        }
    }
    return params;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
    const { slug, locale } = await params;
    const data = await getCollectionBySlug(slug);

    if (!data) {
        return {
            title: 'Collection Not Found',
        };
    }

    const { definition } = data;
    const title = `${definition.title} | Dish Shuffle`;

    return {
        title,
        description: definition.description,
        keywords: definition.keywords,
        openGraph: {
            title,
            description: definition.description,
            type: 'website',
        },
        alternates: {
            canonical: `https://dishshuffle.com/${locale}/collections/${slug}`,
        }
    };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
    const { slug, locale } = await params;
    const data = await getCollectionBySlug(slug);

    if (!data) {
        notFound();
    }

    const { definition, recipes: rawRecipes } = data;

    // Translate recipe titles if needed
    let recipes = rawRecipes;
    if (locale && locale !== 'en') {
        recipes = await translateRecipesList(rawRecipes, locale);
    }

    // Schema.org ItemList for SEO
    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": recipes.map((recipe, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://dishshuffle.com/${locale}/recipes/${recipe.id}`, // Simplified URL logic, ideally use slug generator
            "name": recipe.name
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
            />

            <div className="container mx-auto px-4 pt-8 pb-16">
                <Breadcrumb
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Collections', href: '#' }, // non-link for now
                        { label: definition.title },
                    ]}
                />

                <div className="py-12 text-center max-w-3xl mx-auto">
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-foreground">
                        {definition.title}
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        {definition.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>

                {recipes.length === 0 && (
                    <div className="text-center py-20 bg-muted/30 rounded-3xl">
                        <span className="text-4xl block mb-4">🍽️</span>
                        <p className="text-lg text-muted-foreground">Coming soon! We are gathering delicious recipes for this collection.</p>
                    </div>
                )}
            </div>
        </>
    );
}
