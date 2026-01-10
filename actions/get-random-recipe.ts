import { getRandomMeal } from "@/lib/api";
import { translateRecipe } from "@/lib/services/translation";
import { Recipe } from "@/lib/types/recipe";

export async function getRandomRecipeAction(locale: string): Promise<Recipe | null> {
    try {
        const recipe = await getRandomMeal();
        if (!recipe) return null;

        if (locale && locale !== "en") {
            return await translateRecipe(recipe, locale);
        }

        return recipe;
    } catch (error) {
        console.error("Error in getRandomRecipeAction:", error);
        return null;
    }
}
