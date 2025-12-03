import React from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import { Recipe } from "@/lib/types/recipe";
import FavoriteButton from "./FavoriteButton";
import { getRecipeUrl } from "@/lib/utils/slugs";

export interface RecipeCardProps {
    recipe: Recipe;
    priority?: boolean;
}

export default function RecipeCard({ recipe, priority = false }: RecipeCardProps) {
    return (
        <Link
            href={getRecipeUrl(recipe.name, recipe.id)}
            className="group block bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-border/50"
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                {recipe.thumbnail ? (
                    <Image
                        src={recipe.thumbnail}
                        alt={recipe.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        priority={priority}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                        <span className="text-6xl">🍽️</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                <div className="absolute top-3 right-3 z-10">
                    <FavoriteButton recipe={recipe} variant="minimal" className="bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2 text-xs font-medium mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <span className="px-2 py-1 rounded-full bg-primary-500/80 backdrop-blur-sm">
                            {recipe.area}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                            {recipe.category}
                        </span>
                    </div>
                    <h3 className="font-display text-xl font-bold leading-tight mb-1 line-clamp-2 group-hover:text-primary-200 transition-colors">
                        {recipe.name}
                    </h3>
                </div>
            </div>

            <div className="p-5 pt-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {recipe.readyInMinutes ? `${recipe.readyInMinutes}m` : '30m'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {recipe.servings ? `${recipe.servings} servings` : `${recipe.ingredients.length} ingredients`}
                        </span>
                        {recipe.calories && (
                            <span className="flex items-center gap-1.5 text-orange-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                                </svg>
                                {Math.round(recipe.calories)} kcal
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
