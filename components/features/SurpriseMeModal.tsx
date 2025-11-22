"use client";

import { useState, useEffect } from "react";
import { getRandomMeal } from "@/lib/api/mealdb";
import { Recipe } from "@/lib/types/recipe";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useSurpriseMe } from "@/lib/contexts/SurpriseMeContext";
import { getRecipeUrl } from "@/lib/utils/slugs";
import { useRouter } from "@/navigation";

export default function SurpriseMeModal() {
    const { isOpen, closeModal } = useSurpriseMe();
    const router = useRouter();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRandomMeal = async () => {
        setIsLoading(true);
        try {
            const meal = await getRandomMeal();
            setRecipe(meal);
        } catch (error) {
            console.error("Error fetching random meal:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && !recipe) {
            fetchRandomMeal();
        }
    }, [isOpen]);

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
                        <h2 className="font-display text-2xl font-bold">Surprise Me!</h2>
                    </div>
                    <button
                        onClick={closeModal}
                        className="text-muted-foreground hover:text-foreground transition-colors"
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
                                <p className="text-muted-foreground">Finding a delicious recipe...</p>
                            </div>
                        </div>
                    ) : recipe ? (
                        <div className="space-y-6" translate="yes">
                            {/* Image */}
                            <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden">
                                <Image
                                    src={recipe.thumbnail}
                                    alt={recipe.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Title & Meta */}
                            <div>
                                <h3 className="font-display text-3xl font-bold mb-3">{recipe.name}</h3>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-4 py-2 bg-primary-500/10 text-primary-600 rounded-full text-sm font-medium">
                                        {recipe.category}
                                    </span>
                                    <span className="px-4 py-2 bg-accent-500/10 text-accent-600 rounded-full text-sm font-medium">
                                        {recipe.area}
                                    </span>
                                </div>
                            </div>

                            {/* Ingredients Preview */}
                            <div>
                                <h4 className="font-display text-xl font-bold mb-3">Key Ingredients</h4>
                                <div className="flex flex-wrap gap-2">
                                    {recipe.ingredients.slice(0, 6).map((ingredient, index) => (
                                        <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                                            {ingredient.name}
                                        </span>
                                    ))}
                                    {recipe.ingredients.length > 6 && (
                                        <span className="px-3 py-1 bg-primary-500/10 text-primary-600 rounded-full text-sm font-medium">
                                            +{recipe.ingredients.length - 6} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Instructions Preview */}
                            <div>
                                <h4 className="font-display text-xl font-bold mb-3">Recipe Preview</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    {recipe.instructions.substring(0, 200)}...
                                </p>
                                <p className="text-sm text-primary-600 font-medium mt-2">
                                    Click "View Full Recipe" to see complete instructions and all ingredients
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-muted-foreground">Failed to load recipe. Please try again.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                    <Button variant="outline" onClick={closeModal}>
                        Close
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (recipe) {
                                closeModal();
                                router.push(getRecipeUrl(recipe.name, recipe.id));
                            }
                        }}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Full Recipe
                    </Button>
                    <Button onClick={fetchRandomMeal} isLoading={isLoading}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Get Another Meal
                    </Button>
                </div>
            </div>
        </div>
    );
}
