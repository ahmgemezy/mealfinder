"use client";

import { Recipe } from "@/lib/types/recipe";
import { getRecipeUrl } from "@/lib/utils/slugs";
import Image from "next/image";
import Link from "next/link";
import { Clock, Flame, ChefHat } from "lucide-react";
import { useTranslations } from "next-intl";

interface PantryResultsProps {
    recipes: Recipe[];
    searchedIngredients: string[];
}

export default function PantryResults({ recipes }: PantryResultsProps) {
    const t = useTranslations("SmartPantry");

    if (recipes.length === 0) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ChefHat className="text-orange-500" />
                    {t("resultsTitle")}
                </h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {t("matchesFound", { count: recipes.length })}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                    <Link
                        key={recipe.id}
                        href={getRecipeUrl(recipe.name, recipe.id)}
                        className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <Image
                                src={recipe.thumbnail || "/placeholder-recipe.jpg"}
                                alt={recipe.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                            {/* Badges */}
                            <div className="absolute bottom-3 left-3 flex gap-2">
                                {recipe.readyInMinutes && (
                                    <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white text-xs font-medium flex items-center gap-1">
                                        <Clock size={12} /> {recipe.readyInMinutes}m
                                    </span>
                                )}
                                {recipe.calories && (
                                    <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white text-xs font-medium flex items-center gap-1">
                                        <Flame size={12} /> {Math.round(recipe.calories)} kcal
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                                {recipe.name}
                            </h3>

                            {/* Ingredient Match Logic */}
                            {/* 
                  Note: Standard Recipe type doesn't have "usedIngredients" count from standardized API output yet.
                  Ideally we'd enrich the Recipe type to include match info, but for now we'll imply relevance.
               */}
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                {t("topCategory")}: <span className="text-orange-600 font-medium">{recipe.category || "General"}</span>
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {recipe.area} Cuisine
                                </span>
                                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                                    <ChefHat size={16} className="text-orange-500 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
