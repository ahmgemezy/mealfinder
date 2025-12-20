"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ShoppingListProps {
    ingredients: Array<{
        name: string;
        measure: string;
    }>;
}

export default function ShoppingList({ ingredients }: ShoppingListProps) {
    const t = useTranslations('Recipe');
    const [isOpen, setIsOpen] = useState(false);

    // Helper to clean ingredient name for better search results
    // e.g., "1kg Chicken Breast" -> "Chicken Breast"
    const getCleanTerm = (name: string) => {
        // Remove common measurements if they are part of the name string (unlikely with structured data but good safety)
        // This is a simple pass; Amazon's search is robust enough to handle "chopped onion"
        return name.replace(/\(.*\)/g, '').trim();
    };

    const getAmazonLink = (item: string) => {
        const term = encodeURIComponent(getCleanTerm(item));
        // Uses general Amazon search defaulting to Grocery if available, with your affiliate tag placeholder
        return `https://www.amazon.com/s?k=${term}&i=grocery&tag=dishshuffle-20`;
    };

    return (
        <div className="mt-8 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-xl">
                        🛒
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-emerald-950 dark:text-emerald-50 notranslate">
                            {t('shopIngredients')}
                        </h3>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 notranslate">
                            {t('shopIngredientsDesc')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-emerald-600"
                >
                    <svg className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            <div className={`${isOpen ? 'block' : 'hidden md:block'} space-y-3`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ingredients.map((ing, idx) => (
                        <a
                            key={idx}
                            href={getAmazonLink(ing.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-card border border-emerald-100 dark:border-emerald-900/30 hover:shadow-md hover:border-emerald-300 transition-all group"
                        >
                            <span className="font-medium text-sm truncate pr-2 text-foreground">
                                {ing.name}
                            </span>
                            <span className="text-xs text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Buy on Amazon ↗
                            </span>
                        </a>
                    ))}
                </div>

                <p className="text-xs text-emerald-600/70 text-center mt-4">
                    *Links open in Amazon Fresh/Grocery. We may earn a commission.
                </p>
            </div>
        </div>
    );
}
