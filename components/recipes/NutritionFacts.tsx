import React from 'react';
import { Recipe } from '@/lib/types/recipe';

interface NutritionFactsProps {
    recipe: Recipe;
}

export default function NutritionFacts({ recipe }: NutritionFactsProps) {
    // Only show if we have nutrition data (Spoonacular)
    if (!recipe.calories && !recipe.protein && !recipe.carbs && !recipe.fat) {
        return null;
    }

    return (
        <section className="mt-8">
            <h2 className="font-display text-3xl font-bold mb-6">
                Nutrition Facts
            </h2>
            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Calories */}
                    <div className="flex flex-col items-center justify-center p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                        <span className="text-sm font-medium text-muted-foreground mb-1">Calories</span>
                        <span className="text-2xl font-bold text-orange-600">
                            {recipe.calories ? Math.round(recipe.calories) : '-'}
                        </span>
                        <span className="text-xs text-muted-foreground">kcal</span>
                    </div>

                    {/* Protein */}
                    <div className="flex flex-col items-center justify-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <span className="text-sm font-medium text-muted-foreground mb-1">Protein</span>
                        <span className="text-2xl font-bold text-blue-600">
                            {recipe.protein ? Math.round(recipe.protein) : '-'}
                        </span>
                        <span className="text-xs text-muted-foreground">g</span>
                    </div>

                    {/* Carbs */}
                    <div className="flex flex-col items-center justify-center p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                        <span className="text-sm font-medium text-muted-foreground mb-1">Carbs</span>
                        <span className="text-2xl font-bold text-green-600">
                            {recipe.carbs ? Math.round(recipe.carbs) : '-'}
                        </span>
                        <span className="text-xs text-muted-foreground">g</span>
                    </div>

                    {/* Fat */}
                    <div className="flex flex-col items-center justify-center p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                        <span className="text-sm font-medium text-muted-foreground mb-1">Fat</span>
                        <span className="text-2xl font-bold text-yellow-600">
                            {recipe.fat ? Math.round(recipe.fat) : '-'}
                        </span>
                        <span className="text-xs text-muted-foreground">g</span>
                    </div>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                    * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
                </p>
            </div>
        </section>
    );
}
