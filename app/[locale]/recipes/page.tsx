"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/navigation";
import RecipeCard from "@/components/ui/RecipeCard";
import { RecipeCardSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { Recipe } from "@/lib/types/recipe";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useTranslations } from "next-intl";
import { RECIPE_CATEGORIES, RECIPE_AREAS } from "@/lib/constants";
import { searchMeals, filterByCategory, filterByArea, getMultipleRandomMeals } from "@/lib/api/mealdb";

import { Suspense } from "react";

export default function RecipesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <RecipesContent />
        </Suspense>
    );
}

function RecipesContent() {
    const t = useTranslations('Recipes');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(
        searchParams.get("search") || ""
    );
    const [selectedCategory, setSelectedCategory] = useState(
        searchParams.get("category") || ""
    );
    const [selectedArea, setSelectedArea] = useState(
        searchParams.get("area") || ""
    );

    const categories = RECIPE_CATEGORIES;
    const areas = RECIPE_AREAS;

    useEffect(() => {
        fetchRecipes();
    }, [selectedCategory, selectedArea]);

    const fetchRecipes = async () => {
        setIsLoading(true);
        try {
            let recipes: Recipe[] = [];

            if (searchQuery) {
                // Search takes priority
                recipes = await searchMeals(searchQuery);
            } else if (selectedCategory && selectedArea) {
                // Combined filter: fetch by category first, then filter by area client-side
                const categoryRecipes = await filterByCategory(selectedCategory);
                recipes = categoryRecipes.filter(recipe => recipe.area === selectedArea);
            } else if (selectedCategory) {
                // Filter by category only
                recipes = await filterByCategory(selectedCategory);
            } else if (selectedArea) {
                // Filter by area only
                recipes = await filterByArea(selectedArea);
            } else {
                // Default: fetch random recipes
                recipes = await getMultipleRandomMeals(12);
            }

            setRecipes(recipes);
        } catch (error) {
            console.error("Error fetching recipes:", error);
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchRecipes();
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("");
        setSelectedArea("");
        router.push("/recipes");
    };



    return (
        <div className="min-h-screen py-8 md:py-12">
            <div className="container mx-auto px-4">
                <Breadcrumb
                    items={[
                        { label: "Home", href: "/" }, // Breadcrumb labels are usually static or passed as props, but here we might want to translate "Home"
                        { label: t('title') }
                    ]}
                />

                {/* Header */}
                <div className="mb-12">
                    <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 gradient-text">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-card rounded-2xl p-6 shadow-soft mb-8">
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('searchPlaceholder')}
                                className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <Button type="submit" size="lg">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </Button>
                        </div>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('category')}</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setSearchQuery(""); // Clear search when filtering
                                }}
                                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">{t('allCategories')}</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">{t('cuisine')}</label>
                            <select
                                value={selectedArea}
                                onChange={(e) => {
                                    setSelectedArea(e.target.value);
                                    setSearchQuery(""); // Clear search when filtering
                                }}
                                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">{t('allCuisines')}</option>
                                {areas.map((area) => (
                                    <option key={area} value={area}>
                                        {area}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(searchQuery || selectedCategory || selectedArea) && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {t('activeFilters')}
                            </span>
                            {searchQuery && (
                                <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
                                    {t('searchPrefix')} {searchQuery}
                                </span>
                            )}
                            {selectedCategory && (
                                <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
                                    {selectedCategory}
                                </span>
                            )}
                            {selectedArea && (
                                <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
                                    {selectedArea}
                                </span>
                            )}
                            <button
                                onClick={clearFilters}
                                className="text-sm text-muted-foreground hover:text-foreground underline"
                            >
                                {t('clearAll')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Results */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <RecipeCardSkeleton key={i} />
                        ))}
                    </div>
                ) : recipes.length > 0 ? (
                    <>
                        <div className="mb-6 text-muted-foreground">
                            {t('foundRecipes', { count: recipes.length })}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="font-display text-2xl font-bold mb-2">
                            {t('noRecipes')}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {t('noRecipesDesc')}
                        </p>
                        <Button onClick={clearFilters} variant="outline">
                            {t('clearFilters')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
