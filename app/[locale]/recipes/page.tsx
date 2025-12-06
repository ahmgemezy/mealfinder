"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/navigation";
import RecipeCard from "@/components/ui/RecipeCard";
import { RecipeCardSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { Recipe } from "@/lib/types/recipe";
import { useTranslations } from "next-intl";
import {
    searchMeals,
    filterByMultiple,
    filterByCategory,
    filterByArea,
    filterByDiet,
    getMultipleRandomMeals,
    getCategories,
    getAreas,
    loadMoreSearchResults,
    loadMoreCategoryResults,
    loadMoreAreaResults,
    loadMoreDietResults,
} from "@/lib/api";
import { SPOONACULAR_DIETS, MEALDB_CATEGORIES, MEALDB_AREAS } from "@/lib/constants";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const dynamic = "force-dynamic";

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
    const [, setPage] = useState(1);
    const RECIPES_PER_PAGE = 24;
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Pagination state for Spoonacular API
    const [spoonacularOffset, setSpoonacularOffset] = useState(20); // Start at 20 since first batch was offset 0
    const [hasMoreFromApi, setHasMoreFromApi] = useState(true);

    // Processing ref to prevent concurrent executions
    const isProcessingRef = useRef(false);

    // Request ID to handle race conditions
    const filterRequestIdRef = useRef(0);

    const loadMoreRecipes = useCallback(async () => {
        // Capture current request ID
        const currentRequestId = filterRequestIdRef.current;

        // Prevent concurrent execution
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        // Handle filtered results pagination
        if (searchQuery || selectedCategory || selectedArea || selectedDiet) {
            // First, show more from already-loaded recipes
            if (displayedRecipes.length < recipes.length) {
                setIsLoadingMore(true);
                await new Promise(resolve => setTimeout(resolve, 300));

                if (currentRequestId !== filterRequestIdRef.current) {
                    isProcessingRef.current = false;
                    setIsLoadingMore(false);
                    return;
                }

                const nextBatch = recipes.slice(
                    displayedRecipes.length,
                    displayedRecipes.length + RECIPES_PER_PAGE
                );

                if (nextBatch.length > 0) {
                    setDisplayedRecipes(prev => {
                        if (currentRequestId !== filterRequestIdRef.current) return prev;
                        const currentIds = new Set(prev.map(r => r.id));
                        const uniqueNextBatch = nextBatch.filter(r => r?.id && !currentIds.has(r.id));
                        return [...prev, ...uniqueNextBatch];
                    });
                }
                setIsLoadingMore(false);
                isProcessingRef.current = false;
                return;
            }

            // If we've shown all loaded recipes and there might be more from API, fetch them
            if (hasMoreFromApi) {
                setIsLoadingMore(true);
                try {
                    const existingIds = recipes.map(r => r.id);
                    let result: { recipes: Recipe[]; hasMore: boolean } = { recipes: [], hasMore: false };

                    // Call the appropriate load more function based on active filter
                    if (searchQuery) {
                        result = await loadMoreSearchResults(searchQuery, spoonacularOffset, existingIds);
                    } else if (selectedDiet) {
                        result = await loadMoreDietResults(selectedDiet, spoonacularOffset, existingIds);
                    } else if (selectedCategory && !selectedArea) {
                        result = await loadMoreCategoryResults(selectedCategory, spoonacularOffset, existingIds);
                    } else if (selectedArea && !selectedCategory) {
                        result = await loadMoreAreaResults(selectedArea, spoonacularOffset, existingIds);
                    } else if (selectedCategory && selectedArea) {
                        // For combined filters, try category pagination
                        result = await loadMoreCategoryResults(selectedCategory, spoonacularOffset, existingIds);
                        // Filter by area client-side
                        result.recipes = result.recipes.filter(r => r.area === selectedArea);
                    }

                    if (currentRequestId !== filterRequestIdRef.current) {
                        isProcessingRef.current = false;
                        setIsLoadingMore(false);
                        return;
                    }

                    if (result.recipes.length > 0) {
                        setRecipes(prev => [...prev, ...result.recipes]);
                        setDisplayedRecipes(prev => [...prev, ...result.recipes]);
                        setSpoonacularOffset(prev => prev + 20);
                    }
                    setHasMoreFromApi(result.hasMore);
                } catch (error) {
                    console.error("Error loading more filtered recipes:", error);
                } finally {
                    setIsLoadingMore(false);
                    isProcessingRef.current = false;
                }
                return;
            }

            isProcessingRef.current = false;
            return;
        }

        // Standard infinite scroll for random recipes (no filters)
        if (displayedRecipes.length >= recipes.length) {
            setIsLoadingMore(true);
            try {
                const existingIds = displayedRecipes.map(r => r.id);
                const moreRecipes = await getMultipleRandomMeals(RECIPES_PER_PAGE, existingIds);

                if (currentRequestId !== filterRequestIdRef.current) {
                    isProcessingRef.current = false;
                    setIsLoadingMore(false);
                    return;
                }

                if (moreRecipes.length > 0) {
                    setRecipes(prev => {
                        if (currentRequestId !== filterRequestIdRef.current) return prev;
                        const currentIds = new Set(prev.map(r => r.id));
                        const uniqueNew = moreRecipes.filter(r => r?.id && !currentIds.has(r.id));
                        return [...prev, ...uniqueNew];
                    });

                    setDisplayedRecipes(prev => {
                        if (currentRequestId !== filterRequestIdRef.current) return prev;
                        const currentIds = new Set(prev.map(r => r.id));
                        const uniqueNew = moreRecipes.filter(r => r?.id && !currentIds.has(r.id));
                        return [...prev, ...uniqueNew];
                    });
                }
            } catch (error) {
                console.error("Error loading more recipes:", error);
            } finally {
                setIsLoadingMore(false);
                isProcessingRef.current = false;
            }
        } else {
            isProcessingRef.current = false;
        }
    }, [searchQuery, selectedCategory, selectedArea, selectedDiet, displayedRecipes, recipes, RECIPES_PER_PAGE, spoonacularOffset, hasMoreFromApi]);

    // Refs for stable access in event listener
    const isLoadingRef = useRef(isLoading);
    const isLoadingMoreRef = useRef(isLoadingMore);
    const loadMoreRecipesRef = useRef(loadMoreRecipes);

    useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
    useEffect(() => { isLoadingMoreRef.current = isLoadingMore; }, [isLoadingMore]);
    useEffect(() => { loadMoreRecipesRef.current = loadMoreRecipes; }, [loadMoreRecipes]);

    const fetchRecipes = useCallback(async () => {
        // Increment request ID to invalidate any pending operations
        filterRequestIdRef.current += 1;
        const currentRequestId = filterRequestIdRef.current;

        isProcessingRef.current = false; // Reset processing lock

        setIsLoading(true);
        setPage(1);

        // Reset pagination state for new search/filter
        setSpoonacularOffset(20); // First batch is offset 0, next will be 20
        setHasMoreFromApi(true);

        // Clear existing recipes immediately to show skeleton loading state
        // This prevents "junk data" (previous results) from being visible while searching
        setRecipes([]);
        setDisplayedRecipes([]);

        try {
            let fetchedRecipes: Recipe[] = [];

            if (searchQuery) {
                // Search takes priority
                fetchedRecipes = await searchMeals(searchQuery);
            } else if (selectedDiet) {
                // Diet filter (Spoonacular-specific)
                fetchedRecipes = await filterByDiet(selectedDiet);
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

            // Check if this request is still valid
            if (currentRequestId !== filterRequestIdRef.current) {
                return;
            }

            // Client-side deduplication safety net
            const uniqueRecipes: Recipe[] = [];
            const seenIds = new Set<string>();

            fetchedRecipes.forEach(recipe => {
                if (recipe?.id && !seenIds.has(recipe.id)) {
                    uniqueRecipes.push(recipe);
                    seenIds.add(recipe.id);
                }
            });

            setRecipes(uniqueRecipes);
            // Initial display: first batch or all if less than batch size
            setDisplayedRecipes(uniqueRecipes.slice(0, RECIPES_PER_PAGE));
        } catch (error) {
            console.error("Error fetching recipes:", error);
            // Only update error state if request is still valid
            if (currentRequestId === filterRequestIdRef.current) {
                setRecipes([]);
                setDisplayedRecipes([]);
            }
        } finally {
            // Only turn off loading if this is the latest request
            if (currentRequestId === filterRequestIdRef.current) {
                setIsLoading(false);
            }
        }
    }, [searchQuery, selectedCategory, selectedArea, selectedDiet, RECIPES_PER_PAGE]);

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
    }, [searchQuery, fetchRecipes]);

    useEffect(() => {
        // Reset processing ref when filters change
        isProcessingRef.current = false;
        fetchRecipes();
    }, [selectedCategory, selectedArea, selectedDiet, fetchRecipes]);

    // Infinite scroll implementation
    useEffect(() => {
        const handleScroll = () => {
            // Check if user scrolled to near bottom (within 300px)
            const scrollPosition = window.innerHeight + window.scrollY;
            const pageHeight = document.documentElement.scrollHeight;

            if (scrollPosition >= pageHeight - 300 &&
                !isLoadingMoreRef.current &&
                !isLoadingRef.current) {
                loadMoreRecipesRef.current();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []); // Stable listener





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

    // Inject ItemList JSON-LD structured data for SEO
    useEffect(() => {
        // Remove any existing structured data script
        const existingScript = document.querySelector('script[data-schema="itemlist"]');
        if (existingScript) {
            existingScript.remove();
        }

        // Only add if we have recipes to show
        if (displayedRecipes.length === 0) return;

        const itemListSchema = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: selectedCategory
                ? `${selectedCategory} Recipes`
                : selectedArea
                    ? `${selectedArea} Recipes`
                    : searchQuery
                        ? `Recipes for "${searchQuery}"`
                        : "Browse Recipes",
            description: "Discover delicious recipes from around the world on Dish Shuffle",
            numberOfItems: displayedRecipes.length,
            itemListElement: displayedRecipes.slice(0, 10).map((recipe, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                    "@type": "Recipe",
                    name: recipe.name,
                    url: `https://dishshuffle.com/en/recipes/${recipe.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}-${recipe.id}`,
                    image: recipe.thumbnail,
                    author: {
                        "@type": "Organization",
                        name: "Dish Shuffle"
                    }
                }
            }))
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-schema', 'itemlist');
        script.textContent = JSON.stringify(itemListSchema);
        document.head.appendChild(script);

        return () => {
            script.remove();
        };
    }, [displayedRecipes, selectedCategory, selectedArea, searchQuery]);

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
                                <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950 text-primary-500 dark:text-primary-400 rounded-full text-sm font-medium">
                                    {t('searchPrefix')} {searchQuery}
                                </span>
                            )}
                            {selectedCategory && (
                                <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950 text-primary-500 dark:text-primary-400 rounded-full text-sm font-medium">
                                    {selectedCategory}
                                </span>
                            )}
                            {selectedArea && (
                                <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950 text-primary-500 dark:text-primary-400 rounded-full text-sm font-medium">
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
                                {t('foundRecipes', { count: recipes.length })}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {displayedRecipes.map((recipe) => (
                                recipe?.id ? (
                                    <RecipeCard key={recipe.id} recipe={recipe} />
                                ) : null
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
                                        <RecipeCardSkeleton key={`loading - ${i} `} />
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
