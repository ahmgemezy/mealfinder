'use server';

import {
    searchMeals,
    filterByMultiple,
    getMultipleRandomMeals
} from "@/lib/api";
import { translateRecipesList } from "@/lib/services/translation";
import { Recipe } from "@/lib/types/recipe";

interface GetRecipesParams {
    locale: string;
    searchQuery?: string;
    category?: string;
    area?: string;
    diet?: string;
    page?: number;
}

export async function getRecipesAction({
    locale,
    searchQuery,
    category,
    area,
    diet,
    page = 1
}: GetRecipesParams) {
    const RECIPES_PER_PAGE = 24;
    let recipes: Recipe[] = [];
    let totalItems = 0;

    try {
        if (searchQuery) {
            recipes = await searchMeals(searchQuery);
            totalItems = recipes.length;
        } else if (category || area || diet) {
            const offset = (page - 1) * RECIPES_PER_PAGE;
            // filterByMultiple handles MealDB (fetches all) and Spoonacular (paginated) logic internally
            // But we need to verify what it returns. 
            // RecipesList assumes it returns everything for Cat/Area.
            const result = await filterByMultiple(
                category || undefined,
                area || undefined,
                diet || undefined,
                offset
            );
            recipes = result.recipes;
            totalItems = result.totalCount;
        } else {
            // Random Browse
            recipes = await getMultipleRandomMeals(RECIPES_PER_PAGE);
            // Logic from RecipesList: allow endless next
            totalItems = 10000;
        }

        // Deduplicate
        const uniqueRecipes: Recipe[] = [];
        const seenIds = new Set<string>();
        recipes.forEach(r => {
            if (r?.id && !seenIds.has(r.id)) {
                uniqueRecipes.push(r);
                seenIds.add(r.id);
            }
        });
        recipes = uniqueRecipes;

        // Pagination Logic (Mirroring RecipesList.tsx)
        const isRandom = !searchQuery && !category && !area && !diet;
        const isServerSidePaginated = !!diet;

        let paginatedRecipes = recipes;

        if (isRandom || isServerSidePaginated) {
            // No slicing needed, API returned the page
            paginatedRecipes = recipes;
        } else {
            // Client-side pagination for generic MealDB results (returned all)
            const startIndex = (page - 1) * RECIPES_PER_PAGE;
            const endIndex = startIndex + RECIPES_PER_PAGE;
            paginatedRecipes = recipes.slice(startIndex, endIndex);
            // totalItems is already recipes.length
        }

        // TRANSLATE
        if (locale && locale !== 'en') {
            paginatedRecipes = await translateRecipesList(paginatedRecipes, locale);
        }

        return {
            recipes: paginatedRecipes,
            totalItems
        };

    } catch (error) {
        console.error("Server Action fetch recipes error", error);
        return { recipes: [], totalItems: 0 };
    }
}
