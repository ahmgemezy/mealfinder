"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/navigation";
import RecipeCard from "@/components/ui/RecipeCard";
import { RecipeCardSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { Recipe } from "@/lib/types/recipe";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useTranslations } from "next-intl";
import { SPOONACULAR_CATEGORIES, SPOONACULAR_CUISINES, SPOONACULAR_DIETS, MEALDB_CATEGORIES, MEALDB_AREAS } from "@/lib/constants";
import { searchMeals, filterByCategory, filterByArea, filterByMultiple, getMultipleRandomMeals, getCategories, getAreas } from "@/lib/api";

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
    const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState(
        searchParams.get("search") || ""
    );
    const [selectedCategory, setSelectedCategory] = useState(
        searchParams.get("category") || ""
    );
    const [selectedArea, setSelectedArea] = useState(
        searchParams.get("area") || ""
    );
    const [selectedDiet, setSelectedDiet] = useState(
        searchParams.get("diet") || ""
    );
    const [categories, setCategories] = useState<string[]>([]);
    const [areas, setAreas] = useState<string[]>([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(true);
    const [page, setPage] = useState(1);
    const RECIPES_PER_PAGE = 24;
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load categories and areas dynamically based on API provider
    useEffect(() => {
        const loadFilters = async () => {
            setIsLoadingFilters(true);
            try {
                const [fetchedCategories, fetchedAreas] = await Promise.all([
                    getCategories(),
                    getAreas(),
                ]);
                setCategories(fetchedCategories);
                setAreas(fetchedAreas);
            } catch (error) {
                console.error("Error loading filters:", error);
                // Fallback to static lists
                setCategories(MEALDB_CATEGORIES);
                setAreas(MEALDB_AREAS);
            } finally {
                setIsLoadingFilters(false);
            }
        };
        loadFilters();
    }, []);

    // Debounced search: trigger search 500ms after user stops typing
    useEffect(() => {
        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Only trigger search if there's a query and it's from user typing (not initial load)
        if (searchQuery && searchQuery.length > 0) {
            searchTimeoutRef.current = setTimeout(() => {
                fetchRecipes();
            }, 500);
        }

        // Cleanup timeout on unmount
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    useEffect(() => {
        fetchRecipes();
    }, [selectedCategory, selectedArea, selectedDiet]);

    // Infinite scroll implementation
    useEffect(() => {
        const handleScroll = () => {
            // Check if user scrolled to near bottom (within 300px)
            const scrollPosition = window.innerHeight + window.scrollY;
            const pageHeight = document.documentElement.scrollHeight;

            if (scrollPosition >= pageHeight - 300 && !isLoadingMore && !isLoading) {
                loadMoreRecipes();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [displayedRecipes, recipes, isLoadingMore, isLoading]);

    const loadMoreRecipes = async () => {
        // Don't load more if we're showing filtered results (search or filters active)
        if (searchQuery || selectedCategory || selectedArea || selectedDiet) {
            return;
        }

        // Don't load more if all recipes are already displayed
        if (displayedRecipes.length >= recipes.length) {
            setIsLoadingMore(true);
            try {
                // Fetch more random recipes
                const moreRecipes = await getMultipleRandomMeals(RECIPES_PER_PAGE);

                // Deduplicate: filter out recipes that already exist based on ID
                const existingIds = new Set(displayedRecipes.map(r => r.id));
                const uniqueNewRecipes = moreRecipes.filter(recipe => !existingIds.has(recipe.id));

                // Only add if we have unique recipes
                if (uniqueNewRecipes.length > 0) {
                    setRecipes(prev => [...prev, ...uniqueNewRecipes]);
                    setDisplayedRecipes(prev => [...prev, ...uniqueNewRecipes]);
                }
            } catch (error) {
                console.error("Error loading more recipes:", error);
            } finally {
                setIsLoadingMore(false);
            }
        }
    };

    const fetchRecipes = async () => {
        setIsLoading(true);
        setPage(1);
        try {
            let fetchedRecipes: Recipe[] = [];

            if (searchQuery) {
                // Search takes priority
                fetchedRecipes = await searchMeals(searchQuery);
            } else if (selectedCategory && selectedArea) {
                // Combined filter: use optimized filterByMultiple
                fetchedRecipes = await filterByMultiple(selectedCategory, selectedArea);
            } else if (selectedCategory) {
                // Filter by category only
                fetchedRecipes = await filterByCategory(selectedCategory);
            } else if (selectedArea) {
                // Filter by area only
                fetchedRecipes = await filterByArea(selectedArea);
            } else {
                // Default: fetch initial batch of random recipes
                fetchedRecipes = await getMultipleRandomMeals(RECIPES_PER_PAGE);
            }

            setRecipes(fetchedRecipes);
            setDisplayedRecipes(fetchedRecipes);
        } catch (error) {
            console.error("Error fetching recipes:", error);
            setRecipes([]);
            setDisplayedRecipes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Search is now handled by debounced useEffect
        // Just trigger it immediately on form submit
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        fetchRecipes();
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("");
        setSelectedArea("");
        setSelectedDiet("");
        setPage(1);
        router.push("/recipes");
    };

    const hasActiveFilters = searchQuery || selectedCategory || selectedArea || selectedDiet;

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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('category')}</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setSearchQuery(""); // Clear search when filtering
                                }}
                                disabled={isLoadingFilters}
                                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                <option value="">{isLoadingFilters ? 'Loading...' : t('allCategories')}</option>
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
                                disabled={isLoadingFilters}
                                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                <option value="">{isLoadingFilters ? 'Loading...' : t('allCuisines')}</option>
                                {areas.map((area) => (
                                    <option key={area} value={area}>
                                        {area}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">🥗 Diet</label>
                            <select
                                value={selectedDiet}
                                onChange={(e) => {
                                    setSelectedDiet(e.target.value);
                                    setSearchQuery(""); // Clear search when filtering
                                }}
                                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Diets</option>
                                {SPOONACULAR_DIETS.map((diet) => (
                                    <option key={diet} value={diet}>
                                        {diet}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {hasActiveFilters && (
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
                            {selectedDiet && (
                                <span className="px-3 py-1 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                                    🥗 {selectedDiet}
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
                {isLoading && displayedRecipes.length === 0 ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4 animate-bounce">🍳</div>
                            <h2 className="font-display text-2xl font-bold mb-2 gradient-text">
                                {t('preparingRecipes', { defaultValue: 'Preparing delicious recipes for you...' })}
                            </h2>
                            <p className="text-muted-foreground">
                                {t('justAMoment', { defaultValue: 'This will only take a moment' })}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <RecipeCardSkeleton key={i} />
                            ))}
                        </div>
                    </>
                ) : displayedRecipes.length > 0 ? (
                    <div className="relative">
                        {/* Loading overlay when filtering/searching */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
                                <div className="bg-card p-6 rounded-xl shadow-lg flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-lg font-medium text-foreground">
                                        {t('searching', { defaultValue: 'Searching...' })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Only show count when there are active filters */}
                        {hasActiveFilters && (
                            <div className="mb-6 text-muted-foreground">
                                {t('foundRecipes', { count: displayedRecipes.length })}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {displayedRecipes.map((recipe) => (
                                <RecipeCard key={`${recipe.id}-${recipe.name}`} recipe={recipe} />
                            ))}
                        </div>

                        {/* Loading indicator for infinite scroll */}
                        {isLoadingMore && !hasActiveFilters && (
                            <>
                                <div className="mt-8 mb-4 flex items-center justify-center gap-3">
                                    <div className="w-6 h-6 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-lg font-medium text-muted-foreground">
                                        {t('loadingMore', { defaultValue: 'Loading more recipes...' })}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <RecipeCardSkeleton key={`loading-${i}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
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
