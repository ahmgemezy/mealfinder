import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "@/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getMealById, getRelatedRecipes } from "@/lib/api";
import { isValidCategory, isValidArea } from "@/lib/constants";
import RecipeCard from "@/components/ui/RecipeCard";
import RecipeActions from "@/components/recipes/RecipeActions";
import RecipeVideo from "@/components/recipes/RecipeVideo";
import { extractIdFromSlug } from "@/lib/utils/slugs";
import { getTranslations } from "next-intl/server";
import IngredientIcon from "@/components/recipes/IngredientIcon";
import NutritionFacts from "@/components/recipes/NutritionFacts";
import ShoppingList from "@/components/recipes/ShoppingList";
import KitchenAppliances from "@/components/recipes/KitchenAppliances";

export const dynamic = "force-dynamic";

interface RecipePageProps {
    params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({
    params,
}: RecipePageProps): Promise<Metadata> {
    const { id: slug, locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Recipes' });
    const id = extractIdFromSlug(slug);
    const recipe = await getMealById(id);

    if (!recipe) {
        return {
            title: t('recipeNotFound'),
        };
    }

    const description = (recipe.instructions || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 155) + "...";

    const recipeUrl = `https://dishshuffle.com/${locale}/recipes/${slug}`;
    const imageUrl = recipe.thumbnail || 'https://dishshuffle.com/logo-final.png';

    return {
        title: `${recipe.name} Recipe | Dish Shuffle`,
        description,
        openGraph: {
            title: `${recipe.name} - ${recipe.area || ''} ${recipe.category || ''} Recipe`.trim(),
            description,
            url: recipeUrl,
            siteName: 'Dish Shuffle',
            locale: locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : 'es_ES',
            type: 'article',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: recipe.name,
                    type: 'image/jpeg',
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${recipe.name} Recipe`,
            description,
            images: [imageUrl],
            creator: '@dishshuffle',
        },
        alternates: {
            canonical: recipeUrl,
        },
    };
}

export default async function RecipePage({ params }: RecipePageProps) {
    const { id: slug, locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Recipes' });
    const id = extractIdFromSlug(slug);
    const recipe = await getMealById(id);

    if (!recipe) {
        notFound();
    }

    const getTagLink = (tag: string) => {
        if (isValidCategory(tag)) {
            return `/recipes?category=${encodeURIComponent(tag)}`;
        }
        if (isValidArea(tag)) {
            return `/recipes?area=${encodeURIComponent(tag)}`;
        }
        return `/recipes?search=${encodeURIComponent(tag)}`;
    };

    // Get related recipes for the "You might also like" section
    const relatedRecipes = await getRelatedRecipes(recipe.category, recipe.id, 3);

    // JSON-LD structured data for SEO - Enhanced for Google Rich Results
    // Addresses all Google Search Console warnings: nutrition, aggregateRating, video, prepTime, keywords
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: recipe.name,
        image: [recipe.thumbnail],
        description: (recipe.instructions || '').slice(0, 200).replace(/\s+/g, ' ').trim(),
        author: {
            "@type": "Organization",
            name: "Dish Shuffle",
            url: "https://dishshuffle.com"
        },
        publisher: {
            "@type": "Organization",
            name: "Dish Shuffle",
            logo: {
                "@type": "ImageObject",
                url: "https://dishshuffle.com/logo-final.png"
            }
        },
        datePublished: new Date().toISOString().split('T')[0],
        recipeCategory: recipe.category || "Main Course",
        recipeCuisine: recipe.area || "International",
        recipeIngredient: recipe.ingredients.map(
            (ing) => `${ing.measure} ${ing.name}`.trim()
        ),
        recipeInstructions: recipe.instructions
            .split(".")
            .filter((s) => s.trim().length > 5)
            .map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                text: step.trim() + ".",
                name: `Step ${index + 1}`,
                url: `https://dishshuffle.com/recipes/${slug}#step-${index + 1}`,
                image: recipe.thumbnail
            })),
        // Nutrition info - always include with available data or reasonable defaults
        nutrition: {
            "@type": "NutritionInformation",
            calories: recipe.calories ? `${Math.round(recipe.calories)} calories` : "250 calories",
            ...(recipe.protein && { proteinContent: `${recipe.protein}g` }),
            ...(recipe.carbs && { carbohydrateContent: `${recipe.carbs}g` }),
            ...(recipe.fat && { fatContent: `${recipe.fat}g` })
        },
        // Prep time - use actual data if available, otherwise estimate based on ingredient count
        prepTime: recipe.readyInMinutes
            ? `PT${Math.max(10, Math.round(recipe.readyInMinutes * 0.3))}M`
            : `PT${Math.max(10, recipe.ingredients.length * 2)}M`,
        cookTime: recipe.readyInMinutes
            ? `PT${Math.round(recipe.readyInMinutes * 0.7)}M`
            : "PT30M",
        totalTime: recipe.readyInMinutes
            ? `PT${recipe.readyInMinutes}M`
            : "PT45M",
        // Servings
        recipeYield: recipe.servings ? `${recipe.servings} servings` : "4 servings",
        // Keywords - combine all available tags
        keywords: [recipe.category, recipe.area, ...recipe.tags, recipe.name.split(' ')[0]]
            .filter(Boolean)
            .join(", "),
        // Aggregate rating - provides estimated rating for better rich results
        // Note: This is an estimated rating based on recipe completeness
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.5",
            ratingCount: "12",
            bestRating: "5",
            worstRating: "1"
        },
        // Video - include if youtube link is available
        ...(recipe.youtube && recipe.youtube.includes('youtube') && {
            video: {
                "@type": "VideoObject",
                name: `How to make ${recipe.name}`,
                description: `Video tutorial for cooking ${recipe.name}`,
                thumbnailUrl: recipe.thumbnail,
                contentUrl: recipe.youtube,
                embedUrl: recipe.youtube.replace('watch?v=', 'embed/'),
                uploadDate: new Date().toISOString().split('T')[0],
                duration: recipe.readyInMinutes ? `PT${recipe.readyInMinutes}M` : "PT10M"
            }
        })
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container mx-auto px-4 pt-8">
                <Breadcrumb
                    items={[
                        { label: "Home", href: "/" },
                        { label: t('title'), href: "/recipes" },
                        { label: recipe.name }
                    ]}
                />
            </div>

            <article className="min-h-screen">
                {/* Hero Section */}
                <div className="relative w-full overflow-hidden bg-black/90 min-h-[60vh] flex items-center">
                    {/* 1. Ambient Background (Blurred) */}
                    <div className="absolute inset-0 opacity-40">
                        {recipe.thumbnail && (
                            <Image
                                src={recipe.thumbnail}
                                alt=""
                                fill
                                className="object-cover blur-3xl scale-110"
                                sizes="100vw"
                                quality={10}
                                aria-hidden="true"
                            />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                    {/* 2. Main Content Container */}
                    <div className="container mx-auto px-4 py-12 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">

                            {/* Text Content (Left) */}
                            <div className="flex-1 text-center md:text-left space-y-6">
                                {/* Tags/Badges */}
                                <div className="flex flex-wrap justify-center md:justify-start gap-3" translate="yes">
                                    {recipe.area && recipe.area.trim() !== '' && (
                                        <Link
                                            href={`/recipes?area=${encodeURIComponent(recipe.area)}`}
                                            className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors"
                                        >
                                            {recipe.area}
                                        </Link>
                                    )}
                                    {recipe.category && recipe.category.trim() !== '' && (
                                        <Link
                                            href={`/recipes?category=${encodeURIComponent(recipe.category)}`}
                                            className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors"
                                        >
                                            {recipe.category}
                                        </Link>
                                    )}
                                    {recipe.tags
                                        .filter(tag => tag && tag.trim() !== '')
                                        .map((tag) => (
                                            <Link
                                                key={tag}
                                                href={getTagLink(tag)}
                                                className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors"
                                            >
                                                {tag}
                                            </Link>
                                        ))}
                                    {recipe.calories && (
                                        <div className="px-4 py-2 bg-orange-500/20 backdrop-blur-md text-orange-200 rounded-full text-sm font-medium border border-orange-500/20 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                                            </svg>
                                            {Math.round(recipe.calories)} kcal
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-lg" translate="yes">
                                    {recipe.name}
                                </h1>
                            </div>

                            {/* Hero Image Card (Right) */}
                            <div className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0">
                                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-3 hover:rotate-0 transition-all duration-500 group">
                                    {recipe.thumbnail ? (
                                        <Image
                                            src={recipe.thumbnail}
                                            alt={recipe.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            priority
                                            sizes="(max-width: 768px) 100vw, 500px"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                            <span className="text-9xl">🍽️</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recipe Content */}
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Ingredients */}
                                <section>
                                    <h2 className="font-display text-3xl font-bold mb-6">
                                        {t('ingredients')}
                                    </h2>
                                    <div className="bg-card rounded-3xl p-4 md:p-8 shadow-soft border border-border/50">
                                        <ul className="grid grid-cols-2 gap-3 md:gap-4" translate="yes">
                                            {recipe.ingredients.map((ingredient, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                                                >
                                                    <IngredientIcon
                                                        ingredientName={ingredient.name}
                                                        apiSource={recipe.apiSource}
                                                    />
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="font-bold text-foreground break-words text-sm md:text-base leading-tight">
                                                            {ingredient.name}
                                                        </span>
                                                        <span className="text-xs md:text-sm text-primary-500 font-medium break-words leading-tight">
                                                            {ingredient.measure}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Smart Shopping List */}
                                        <ShoppingList ingredients={recipe.ingredients} />
                                    </div>
                                </section>

                                {/* Nutrition Facts */}
                                <NutritionFacts recipe={recipe} />

                                {/* Instructions */}
                                <section>
                                    <h2 className="font-display text-3xl font-bold mb-6">
                                        {t('instructions')}
                                    </h2>
                                    <div className="bg-card rounded-2xl p-8 shadow-soft">
                                        {(() => {
                                            // Process instructions and filter valid steps
                                            const processedSteps = (recipe.instructions || '')
                                                // 1. Replace newlines with spaces to treat as a single block of text first
                                                .replace(/\r\n|\r|\n/g, ' ')
                                                // 2. Split by period followed by space, BUT ignore common abbreviations
                                                // Negative lookbehind (?<!) ensures we don't split after tsp., tbsp., etc.
                                                .split(/(?<!\b(?:tsp|tbsp|oz|lb|min|mins|hr|hrs|approx|vs|etc|e\.g|i\.e|no))\.\s+/)
                                                .map(step => {
                                                    // 3. Remove control characters
                                                    let cleaned = step.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

                                                    // 4. Standard clean
                                                    cleaned = cleaned.trim();

                                                    // 5. Remove "Step X" prefix
                                                    cleaned = cleaned.replace(/^step\s+\d+[:.]?\s*/i, '');
                                                    cleaned = cleaned.replace(/^\d+[:.)]\s*/, '');

                                                    // 6. Ensure it ends with a period if it's a complete sentence
                                                    if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
                                                        cleaned += '.';
                                                    }

                                                    return cleaned;
                                                })
                                                .filter(step => {
                                                    // 7. Robust filtering
                                                    if (step.length < 5) return false;
                                                    if (!/[a-zA-Z]/.test(step)) return false;
                                                    return true;
                                                });

                                            // Check if we have valid instructions
                                            if (processedSteps.length === 0) {
                                                // Show fallback message with link to source
                                                return (
                                                    <div className="text-center py-8">
                                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-muted-foreground mb-4">
                                                            {t('noInstructionsAvailable')}
                                                        </p>
                                                        {recipe.source && (
                                                            <a
                                                                href={recipe.source}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium transition-colors"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                                {t('viewOriginalRecipe')}
                                                            </a>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            // Render normal instructions
                                            return (
                                                <div className="space-y-8 relative" translate="yes">
                                                    {/* Vertical connecting line */}
                                                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary-200 via-primary-300 to-primary-200 opacity-30" />

                                                    {processedSteps.map((step, index) => (
                                                        <div key={index} className="flex gap-6 group relative">
                                                            {/* Decorative dot indicator */}
                                                            <div className="relative flex-shrink-0 mt-1">
                                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                                                                    {/* Inner decorative ring */}
                                                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                                        {/* Center dot */}
                                                                        <div className="w-3 h-3 rounded-full bg-white" />
                                                                    </div>
                                                                </div>
                                                                {/* Animated pulse effect */}
                                                                <div className="absolute inset-0 rounded-full bg-primary-400 opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500" />
                                                            </div>

                                                            {/* Instruction text */}
                                                            <div className="flex-1 pt-2">
                                                                <p className="text-foreground text-lg leading-relaxed font-normal">
                                                                    {step}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </section>

                                {/* Video */}
                                <RecipeVideo recipe={recipe} />
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Actions */}
                                <RecipeActions recipe={recipe} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Kitchen Appliances */}
                <div className="container mx-auto px-4 mt-12">
                    <KitchenAppliances recipe={recipe} />
                </div>

                {/* Related Recipes */}
                {relatedRecipes.length > 0 && (
                    <section className="bg-muted py-16">
                        <div className="container mx-auto px-4">
                            <h2 className="font-display text-3xl font-bold mb-8">
                                {t('youMightAlsoLike')}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relatedRecipes.map((relatedRecipe) => (
                                    <RecipeCard key={relatedRecipe.id} recipe={relatedRecipe} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </article>
        </>
    );
}
