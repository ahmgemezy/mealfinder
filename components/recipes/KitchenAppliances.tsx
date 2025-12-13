"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Recipe } from '@/lib/types/recipe';
import { KITCHEN_APPLIANCES, GENERIC_APPLIANCES, Appliance } from '@/lib/appliances';
import { useTranslations } from 'next-intl';

interface KitchenAppliancesProps {
    recipe: Recipe;
}

export default function KitchenAppliances({ recipe }: KitchenAppliancesProps) {
    const t = useTranslations('Recipe');

    const matchedAppliances = useMemo(() => {
        const textToSearch = `
            ${recipe.name} 
            ${recipe.instructions} 
            ${recipe.category} 
            ${recipe.tags.join(' ')}
        `.toLowerCase();

        const matches = KITCHEN_APPLIANCES.filter(appliance => {
            return appliance.keywords.some(keyword => textToSearch.includes(keyword.toLowerCase()));
        });

        // If very few matches, add some generic ones
        if (matches.length < 2) {
            // Add generics that aren't already included (though generics have no keywords, so unlikely to conflict)
            const needed = 3 - matches.length;
            matches.push(...GENERIC_APPLIANCES.slice(0, needed));
        }

        // Remove duplicates just in case
        return Array.from(new Set(matches));
    }, [recipe]);

    const getAmazonLink = (term: string) => {
        const encodedTerm = encodeURIComponent(term);
        return `https://www.amazon.com/s?k=${encodedTerm}&i=kitchen&tag=dishshuffle-20`;
    };

    if (matchedAppliances.length === 0) return null;

    return (
        <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🔪</span>
                <h2 className="font-display text-2xl md:text-3xl font-bold">
                    {t('kitchenGear', { defaultValue: 'Recommended Kitchen Gear' })}
                </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {matchedAppliances.map((appliance) => (
                    <a
                        key={appliance.name}
                        href={getAmazonLink(appliance.searchTerm)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border/50 hover:border-primary-500 hover:shadow-lg transition-all group text-center"
                    >
                        <div className="relative w-24 h-24 mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Image
                                src={appliance.image}
                                alt={appliance.name}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h3 className="font-bold text-foreground mb-1 group-hover:text-primary-600 transition-colors">
                            {appliance.name}
                        </h3>
                        <span className="text-xs text-muted-foreground group-hover:text-primary-500">
                            Shop on Amazon ↗
                        </span>
                    </a>
                ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4 opacity-70">
                *As an Amazon Associate we earn from qualifying purchases.
            </p>
        </section>
    );
}
