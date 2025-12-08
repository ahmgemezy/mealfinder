"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getRandomMeal } from "@/lib/api";
import { Recipe } from "@/lib/types/recipe";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useSurpriseMe } from "@/lib/contexts/SurpriseMeContext";
import { getRecipeUrl } from "@/lib/utils/slugs";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/lib/contexts/ToastContext";

export default function SurpriseMeModal() {
    const t = useTranslations('SurpriseMe');
    const { isOpen, closeModal } = useSurpriseMe();
    const router = useRouter();
    const { addToast } = useToast();
    const [isNavigating, setIsNavigating] = useState(false);
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchRandomMeal = useCallback(async () => {
        // Cancel any previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setIsLoading(true);
        try {
            const meal = await getRandomMeal();

            // Check if request was aborted
            if (abortController.signal.aborted) {
                return;
            }

            setRecipe(meal);
        } catch (error) {
            // Ignore abort errors
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }

            console.error("Error fetching random meal:", error);
            addToast("Failed to load random recipe. Please try again.", "error");
        } finally {
            if (!abortController.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, [addToast]);

    useEffect(() => {
        if (isOpen) {
            setIsNavigating(false);
            // Reset recipe when modal opens to prevent stale data
            setRecipe(null);
            fetchRandomMeal();
        } else {
            // Cancel request when modal closes
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        }

        // Cleanup on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [isOpen, fetchRandomMeal]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
            onClick={closeModal}
        >
            <div
                className="bg-card w-full max-w-4xl rounded-3xl shadow-hard border border-border overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🎲</span>
                        <h2 className="font-display text-2xl font-bold">{t('title')}</h2>
                    </div>
                    <button
                        onClick={closeModal}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={t('close')}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
                                <p className="text-muted-foreground">{t('findingRecipe')}</p>
                            </div>
                        </div>
                    ) : recipe ? (
                        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6" translate="yes">
                            {/* Image - Left Side */}
                            <div className="relative w-full h-64 md:h-auto md:min-h-[400px] rounded-2xl overflow-hidden flex-shrink-0">
                                {recipe.thumbnail ? (
                                    <Image
                                        src={recipe.thumbnail}
                                        alt={recipe.name}
                                        fill
                                        className="object-cover"
                                        priority
                                        onError={(e) => {
                                            // Hide broken image and show fallback
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : null}
                                {/* Fallback placeholder - always rendered behind the image */}
                                <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center -z-10">
                                    <span className="text-8xl">🍽️</span>
                                </div>
                            </div>

                            {/* Content - Right Side */}
                            <div className="space-y-4 flex flex-col">
                                {/* Title & Meta */}
                                <div lang="en">
                                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">{recipe.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {recipe.category && recipe.category.trim() !== '' && (
                                            <span className="px-3 py-1.5 bg-primary-500/10 text-primary-500 rounded-full text-sm font-medium">
                                                {recipe.category}
                                            </span>
                                        )}
                                        {recipe.area && recipe.area.trim() !== '' && (
                                            <span className="px-3 py-1.5 bg-accent-500/10 text-accent-500 rounded-full text-sm font-medium">
                                                {recipe.area}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Ingredients Preview */}
                                <div>
                                    <h4 className="font-display text-lg font-bold mb-2">{t('keyIngredients')}</h4>
                                    <div className="flex flex-wrap gap-2" lang="en">
                                        {recipe.ingredients.slice(0, 6).map((ingredient, index) => (
                                            <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                                                {ingredient.name}
                                            </span>
                                        ))}
                                        {recipe.ingredients.length > 6 && (
                                            <span className="px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full text-sm font-medium">
                                                {t('moreIngredients', { count: recipe.ingredients.length - 6 })}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Instructions Preview */}
                                <div className="flex-1">
                                    <h4 className="font-display text-lg font-bold mb-2">{t('recipePreview')}</h4>
                                    <p className="text-muted-foreground leading-relaxed text-sm" lang="en">
                                        {recipe.instructions.substring(0, 200)}...
                                    </p>
                                    <p className="text-xs text-primary-500 font-medium mt-2">
                                        {t('clickToView')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-muted-foreground">{t('failedToLoad')}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t border-border bg-muted/30 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <Button variant="outline" onClick={closeModal} className="w-full sm:w-auto">
                        {t('close')}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (recipe) {
                                setIsNavigating(true);
                                router.push(getRecipeUrl(recipe.name, recipe.id));
                            }
                        }}
                        className="w-full sm:w-auto"
                        isLoading={isNavigating}
                    >
                        {!isNavigating && (
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        )}
                        {t('viewFullRecipe')}
                    </Button>
                    <Button onClick={fetchRandomMeal} isLoading={isLoading} className="w-full sm:w-auto">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {t('getAnotherMeal')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
