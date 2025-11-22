"use client";

import React from "react";
import { Recipe } from "@/lib/types/recipe";
import { useFavorites } from "@/lib/hooks/useFavorites";

interface FavoriteButtonProps {
    recipe: Recipe;
    className?: string;
    variant?: "default" | "minimal";
}

export default function FavoriteButton({
    recipe,
    className = "",
    variant = "default",
}: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const isFav = isFavorite(recipe.id);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(recipe);
    };

    if (variant === "minimal") {
        return (
            <button
                onClick={handleClick}
                className={`group relative p-2 rounded-full transition-all duration-300 ${isFav
                        ? "text-red-500 bg-red-50 dark:bg-red-950/30"
                        : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    } ${className}`}
                aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            >
                <svg
                    className={`w-6 h-6 transition-transform duration-300 ${isFav ? "scale-110 fill-current" : "scale-100 group-hover:scale-110"
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={`group relative flex items-center justify-center w-10 h-10 rounded-full shadow-md transition-all duration-300 ${isFav
                    ? "bg-white text-red-500 scale-110"
                    : "bg-white/90 text-gray-400 hover:text-red-500 hover:scale-110"
                } ${className}`}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
            <svg
                className={`w-6 h-6 transition-transform duration-300 ${isFav ? "fill-current" : ""
                    }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
}
