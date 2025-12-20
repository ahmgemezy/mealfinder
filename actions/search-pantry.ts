'use server';

import { searchByIngredients } from "@/lib/api";
import { translateRecipesList } from "@/lib/services/translation";
import { Recipe } from "@/lib/types/recipe";

export async function searchPantryAction(ingredients: string[], locale: string): Promise<Recipe[]> {
    try {
        const recipes = await searchByIngredients(ingredients);

        if (locale && locale !== 'en' && recipes.length > 0) {
            return await translateRecipesList(recipes, locale);
        }

        return recipes;
    } catch (error) {
        console.error("Server Action searchPantryAction error", error);
        return [];
    }
}
