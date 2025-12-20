"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/navigation"; // Assuming usePathname is available from navigation or next/navigation
import RecipeCard from "@/components/ui/RecipeCard";
import { RecipeCardSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { Recipe } from "@/lib/types/recipe";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { getRecipesAction } from "@/actions/get-recipes";
import {
    getCategories,
    getAreas,
} from "@/lib/api";
import { SPOONACULAR_DIETS, MEALDB_CATEGORIES, MEALDB_AREAS } from "@/lib/constants";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function RecipesList() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <RecipesContent />
        </Suspense>
    );
}

function RecipesContent() {
    const t = useTranslations('Recipes');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // URL-Driven State
    const searchQuery = searchParams.get("search") || searchParams.get("q") || "";
    const selectedCategory = searchParams.get("category") || "";
    const selectedArea = searchParams.get("area") || "";
    const selectedDiet = searchParams.get("diet") || "";
    // Allow parsing page from URL, default to 1
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [totalItems, setTotalItems] = useState(0); // Track total count for pagination
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [areas, setAreas] = useState<string[]>([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(true);
    const RECIPES_PER_PAGE = 24;

    // Processing ref to prevent concurrent executions
    const isProcessingRef = useRef(false);
    // Request ID to handle race conditions
    const filterRequestIdRef = useRef(0);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const locale = useLocale();

    // Update URL Helper
    const updateUrl = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        // Reset page to 1 on filter change properly (unless page is explicitly passed)
        if (!updates.page && (updates.category !== undefined || updates.area !== undefined || updates.diet !== undefined || updates.search !== undefined)) {
            params.delete("page");
        }

        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    const fetchRecipes = useCallback(async () => {
        // Increment request ID to invalidate any pending operations
        filterRequestIdRef.current += 1;
        const currentRequestId = filterRequestIdRef.current;

        isProcessingRef.current = false; // Reset processing lock
        setIsLoading(true);

        // Clear recipes to show skeleton
        setRecipes([]);

        try {
            const { recipes: fetchedRecipes, totalItems: fetchedTotal } = await getRecipesAction({
                locale,
                searchQuery: searchQuery || undefined,
                category: selectedCategory || undefined,
                area: selectedArea || undefined,
                diet: selectedDiet || undefined,
                page: currentPage
            });

            // Check if this request is still valid
            if (currentRequestId !== filterRequestIdRef.current) {
                return;
            }

            setRecipes(fetchedRecipes);
            setTotalItems(fetchedTotal);

        } catch (error) {
            console.error("Error fetching recipes:", error);
            if (currentRequestId === filterRequestIdRef.current) {
                setRecipes([]);
            }
        } finally {
            if (currentRequestId === filterRequestIdRef.current) {
                setIsLoading(false);
            }
        }
    }, [searchQuery, selectedCategory, selectedArea, selectedDiet, currentPage, locale]);

    // Load categories and areas
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
                setCategories([...MEALDB_CATEGORIES]);
                setAreas([...MEALDB_AREAS]);
            } finally {
                setIsLoadingFilters(false);
            }
        };
        loadFilters();
    }, []);

    // Fetch recipes when URL params change
    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    // Debounced Search Input Handler (Standard input, not controlled by URL yet)
    const [localSearch, setLocalSearch] = useState(searchQuery);

    // Sync local search with URL when URL changes (e.g. back button)
    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        // Only update URL if local state differs and user stopped typing
        if (localSearch !== searchQuery) {
            searchTimeoutRef.current = setTimeout(() => {
                updateUrl({ search: localSearch, page: "1" });
            }, 500);
        }

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [localSearch, updateUrl, searchQuery]);


    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        updateUrl({ search: localSearch, page: "1" });
    };

    const clearFilters = () => {
        setLocalSearch("");
        router.push("/recipes");
    };

    const hasActiveFilters = searchQuery || selectedCategory || selectedArea || selectedDiet;

    // Generate Pagination Link
    const getPageLink = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        return `${pathname}?${params.toString()}`;
    };

    return (
        <div className="min-h-screen py-8 md:py-12">
            <div className="container mx-auto px-4">
                <Breadcrumb
                    items={[
                        { label: "Home", href: "/" },
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
                    <form onSubmit={handleSearchSubmit} className="mb-6">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                placeholder={t('searchPlaceholder')}
                                className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <Button type="submit" size="lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </Button>
                        </div>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('category')}</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => updateUrl({ category: e.target.value, search: null })} // Clear search on filter
                                disabled={isLoadingFilters}
                                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                <option value="">{isLoadingFilters ? 'Loading...' : t('allCategories')}</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">{t('cuisine')}</label>
                            <select
                                value={selectedArea}
                                onChange={(e) => updateUrl({ area: e.target.value, search: null })}
                                disabled={isLoadingFilters}
                                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                <option value="">{isLoadingFilters ? 'Loading...' : t('allCuisines')}</option>
                                {areas.map((area) => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">🥗 Diet</label>
                            <select
                                value={selectedDiet}
                                onChange={(e) => updateUrl({ diet: e.target.value, search: null })}
                                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Diets</option>
                                {SPOONACULAR_DIETS.map((diet) => (
                                    <option key={diet} value={diet}>{diet}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-muted-foreground">{t('activeFilters')}</span>
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
                            <button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-foreground underline">
                                {t('clearAll')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Results */}
                {isLoading ? (
                    <div className="space-y-8">
                        <div className="flex flex-col items-center justify-center gap-4 py-12 animate-in fade-in duration-500">
                            <div className="relative">
                                {/* Steam Animation */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-70">
                                    <div className="w-1.5 h-3 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-3 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                                </div>
                                {/* Bouncing Pot */}
                                <div className="text-6xl animate-bounce [animation-duration:2s]">
                                    🍲
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-xl font-display font-bold text-primary-600 dark:text-primary-400 animate-pulse">
                                    {t('preparingRecipes')}
                                </p>
                                <p className="text-muted-foreground font-medium">{t('justAMoment')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-50">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <RecipeCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                ) : recipes.length > 0 ? (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-display font-bold">
                                {hasActiveFilters
                                    ? t('resultsCount', { count: totalItems, defaultValue: `Found ${totalItems} recipes` })
                                    : t('latestRecipes', { defaultValue: 'Latest Recipes' })}
                            </h2>
                            <div className="text-muted-foreground">
                                {hasActiveFilters && totalItems > RECIPES_PER_PAGE && (
                                    <span>
                                        {t('showingRange', {
                                            start: (currentPage - 1) * RECIPES_PER_PAGE + 1,
                                            end: Math.min(currentPage * RECIPES_PER_PAGE, totalItems),
                                            total: totalItems,
                                            defaultValue: `Showing ${(currentPage - 1) * RECIPES_PER_PAGE + 1}-${Math.min(currentPage * RECIPES_PER_PAGE, totalItems)} of ${totalItems}`
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recipes.map((recipe) => (
                                recipe?.id ? <RecipeCard key={recipe.id} recipe={recipe} /> : null
                            ))}
                        </div>

                        {/* Standard Pagination Configured for Bots */}
                        {totalItems > RECIPES_PER_PAGE && (
                            <div className="mt-12 flex justify-center flex-wrap gap-2">
                                {/* Previous Button */}
                                {currentPage > 1 && (
                                    <Link
                                        href={getPageLink(currentPage - 1)}
                                        className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors font-medium flex items-center"
                                        aria-label={t('previousPage')}
                                    >
                                        ←
                                    </Link>
                                )}

                                {/* Numbered Pages */}
                                {(() => {
                                    const totalPages = Math.ceil(totalItems / RECIPES_PER_PAGE);
                                    const windowSize = 5; // Show 5 numbers at a time
                                    const range: (number | string)[] = [];

                                    if (totalPages <= windowSize + 2) {
                                        // Show all pages if total is small
                                        for (let i = 1; i <= totalPages; i++) range.push(i);
                                    } else {
                                        // Complex logic for sliding window
                                        const leftSiblingIndex = Math.max(currentPage - 1, 1);
                                        const rightSiblingIndex = Math.min(currentPage + 1, totalPages);
                                        const shouldShowLeftDots = leftSiblingIndex > 2;
                                        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

                                        if (!shouldShowLeftDots && shouldShowRightDots) {
                                            const leftItemCount = 3 + 2 * 1;
                                            for (let i = 1; i <= leftItemCount; i++) range.push(i);
                                            range.push('...');
                                            range.push(totalPages);
                                        } else if (shouldShowLeftDots && !shouldShowRightDots) {
                                            const rightItemCount = 3 + 2 * 1;
                                            range.push(1);
                                            range.push('...');
                                            for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) range.push(i);
                                        } else {
                                            range.push(1);
                                            range.push('...');
                                            for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) range.push(i);
                                            range.push('...');
                                            range.push(totalPages);
                                        }
                                    }

                                    return range.map((page, index) => {
                                        if (page === '...') {
                                            return (
                                                <span key={`dots-${index}`} className="px-4 py-2 text-muted-foreground">
                                                    ...
                                                </span>
                                            );
                                        }
                                        const pageNum = page as number;
                                        const isActive = pageNum === currentPage;
                                        return (
                                            <Link
                                                key={pageNum}
                                                href={getPageLink(pageNum)}
                                                className={`px-4 py-2 rounded-lg border transition-colors font-medium ${isActive
                                                    ? 'bg-primary-600 text-white border-primary-600'
                                                    : 'bg-card border-border hover:bg-accent'
                                                    }`}
                                                aria-current={isActive ? 'page' : undefined}
                                            >
                                                {pageNum}
                                            </Link>
                                        );
                                    });
                                })()}

                                {/* Next Button */}
                                {currentPage < Math.ceil(totalItems / RECIPES_PER_PAGE) && (
                                    <Link
                                        href={getPageLink(currentPage + 1)}
                                        className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors font-medium flex items-center"
                                        aria-label={t('nextPage')}
                                    >
                                        →
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="font-display text-2xl font-bold mb-2">{t('noRecipes')}</h3>
                        <p className="text-muted-foreground mb-6">{t('noRecipesDesc')}</p>
                        <Button onClick={clearFilters} variant="outline">{t('clearFilters')}</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
