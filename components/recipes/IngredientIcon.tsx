"use client";

import Image from "next/image";
import { useState } from "react";

interface IngredientIconProps {
    ingredientName: string;
    apiSource?: 'mealdb' | 'spoonacular';
}

export default function IngredientIcon({ ingredientName, apiSource = 'mealdb' }: IngredientIconProps) {
    const [imageError, setImageError] = useState(false);

    const getImageSource = () => {
        if (apiSource === 'mealdb') {
            return `https://www.themealdb.com/images/ingredients/${ingredientName}-Small.png`;
        }
        // For Spoonacular, try different formatting approaches
        return `https://img.spoonacular.com/ingredients_100x100/${encodeURIComponent(ingredientName.toLowerCase().replace(/\s+/g, '-'))}.jpg`;
    };


    const getEmojiForIngredient = (name: string): string => {
        const lowerName = name.toLowerCase();

        // Common ingredient emojis
        if (lowerName.includes('egg')) return '🥚';
        if (lowerName.includes('milk') || lowerName.includes('cream')) return '🥛';
        if (lowerName.includes('butter')) return '🧈';
        if (lowerName.includes('oil')) return '🫒';
        if (lowerName.includes('sugar') || lowerName.includes('honey')) return '🍯';
        if (lowerName.includes('salt')) return '🧂';
        if (lowerName.includes('pepper')) return '🌶️';
        if (lowerName.includes('flour') || lowerName.includes('bread')) return '🌾';
        if (lowerName.includes('rice')) return '🍚';
        if (lowerName.includes('pasta')) return '🍝';
        if (lowerName.includes('cheese')) return '🧀';
        if (lowerName.includes('meat') || lowerName.includes('beef') || lowerName.includes('pork')) return '🥩';
        if (lowerName.includes('chicken')) return '🍗';
        if (lowerName.includes('fish') || lowerName.includes('salmon') || lowerName.includes('tuna')) return '🐟';
        if (lowerName.includes('shrimp') || lowerName.includes('prawn')) return '🦐';
        if (lowerName.includes('tomato')) return '🍅';
        if (lowerName.includes('potato')) return '🥔';
        if (lowerName.includes('carrot')) return '🥕';
        if (lowerName.includes('onion')) return '🧅';
        if (lowerName.includes('garlic')) return '🧄';
        if (lowerName.includes('lemon') || lowerName.includes('lime')) return '🍋';
        if (lowerName.includes('apple')) return '🍎';
        if (lowerName.includes('banana')) return '🍌';
        if (lowerName.includes('strawberry')) return '🍓';
        if (lowerName.includes('grape')) return '🍇';
        if (lowerName.includes('orange')) return '🍊';
        if (lowerName.includes('avocado')) return '🥑';
        if (lowerName.includes('broccoli')) return '🥦';
        if (lowerName.includes('mushroom')) return '🍄';
        if (lowerName.includes('corn')) return '🌽';
        if (lowerName.includes('pea')) return '🫛';
        if (lowerName.includes('bean')) return '🫘';
        if (lowerName.includes('nut') || lowerName.includes('almond') || lowerName.includes('walnut')) return '🥜';
        if (lowerName.includes('chocolate')) return '🍫';
        if (lowerName.includes('vanilla')) return '🌼';
        if (lowerName.includes('cinnamon') || lowerName.includes('spice')) return '🌿';
        if (lowerName.includes('herb') || lowerName.includes('basil') || lowerName.includes('parsley')) return '🌿';
        if (lowerName.includes('water') || lowerName.includes('stock') || lowerName.includes('broth')) return '💧';

        // Default fallback
        return '🥘';
    };

    if (imageError) {
        // Fallback: show emoji
        return (
            <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl p-1 md:p-1.5 shadow-sm border border-primary-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-2xl" role="img" aria-label={ingredientName}>
                    {getEmojiForIngredient(ingredientName)}
                </span>
            </div>
        );
    }

    return (
        <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0 bg-white rounded-xl p-1 md:p-1.5 shadow-sm border border-border group-hover:scale-105 transition-transform">
            <Image
                src={getImageSource()}
                alt={ingredientName}
                fill
                className="object-contain p-0.5 md:p-1"
                sizes="(max-width: 768px) 48px, 56px"
                onError={() => setImageError(true)}
            />
        </div>
    );
}
