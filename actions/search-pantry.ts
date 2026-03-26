'use server';

import { searchByIngredients } from "@/lib/api";
import { translateRecipesList } from "@/lib/services/translation";
import { Recipe } from "@/lib/types/recipe";
import { devLog } from "@/lib/utils/logger";

import { z } from "zod";

const PantrySearchSchema = z.object({
    ingredients: z.array(z.string().max(50)).max(20),
    locale: z.string().max(10).optional().default("en"),
});

export async function searchPantryAction(ingredients: string[], locale: string): Promise<Recipe[]> {
    try {
        const validated = PantrySearchSchema.safeParse({ ingredients, locale });
        if (!validated.success) {
            devLog.error("Invalid input for searchPantryAction");
            return [];
        }

        const validIngredients = validated.data.ingredients;
        const validLocale = validated.data.locale;

        const recipes = await searchByIngredients(validIngredients);

        if (validLocale && validLocale !== 'en' && recipes.length > 0) {
            return await translateRecipesList(recipes, validLocale);
        }

        return recipes;
    } catch (error: unknown) {
        devLog.error("Server Action searchPantryAction error", error);
        return [];
    }
}
