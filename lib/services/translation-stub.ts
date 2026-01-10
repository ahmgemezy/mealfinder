/**
 * Translation stub for Cloudflare Workers deployment
 * Returns original text without translation to reduce bundle size
 * Translations should be pre-cached in Supabase
 */

import { devLog } from "@/lib/utils/logger";
import { supabase } from "@/lib/supabase";
import { Recipe } from "@/lib/types/recipe";

/**
 * Stub: Returns original text (no translation)
 */
export async function translateText(
  text: string,
  _targetLang: string
): Promise<string> {
  return text;
}

/**
 * Stub: Returns original text
 */
export async function translateToEnglish(text: string): Promise<string> {
  return text;
}

/**
 * Stub: Returns original ingredients
 */
export async function translateIngredientsToEnglish(
  ingredients: string[]
): Promise<string[]> {
  return ingredients;
}

/**
 * Server-Side Recipe Translation - Only uses Supabase cache, no live translation
 */
export async function translateRecipe(
  recipe: Recipe,
  locale: string
): Promise<Recipe> {
  if (!locale || locale === "en" || !recipe) return recipe;

  try {
    // Only check cache - no live translation on Cloudflare
    const { data: cached, error } = await supabase
      .from("recipe_translations")
      .select("*")
      .eq("recipe_id", recipe.id)
      .eq("locale", locale)
      .maybeSingle();

    if (cached && !error && cached.instructions) {
      return {
        ...recipe,
        name: cached.title || recipe.name,
        instructions: cached.instructions || recipe.instructions,
        ingredients: Array.isArray(cached.ingredients)
          ? cached.ingredients
          : recipe.ingredients,
      };
    }

    // Return original if no cache
    devLog.log(
      `[Translation] No cache for ${recipe.name} (${locale}), returning English`
    );
    return recipe;
  } catch (error) {
    console.error("Translation cache lookup error:", error);
    return recipe;
  }
}

/**
 * Stub: Returns original recipes
 */
export async function translateRecipeList(
  recipes: Recipe[],
  locale: string
): Promise<Recipe[]> {
  if (!locale || locale === "en") return recipes;

  // Try to get cached translations for all recipes
  try {
    const recipeIds = recipes.map((r) => r.id);
    const { data: cached } = await supabase
      .from("recipe_translations")
      .select("*")
      .in("recipe_id", recipeIds)
      .eq("locale", locale);

    if (cached && cached.length > 0) {
      const cacheMap = new Map(cached.map((c) => [c.recipe_id, c]));
      return recipes.map((recipe) => {
        const translation = cacheMap.get(recipe.id);
        if (translation) {
          return {
            ...recipe,
            name: translation.title || recipe.name,
          };
        }
        return recipe;
      });
    }
  } catch (error) {
    console.error("Batch translation cache lookup error:", error);
  }

  return recipes;
}

/**
 * Stub: Returns original recipe
 */
export async function translateRecipeWithFullTranslation(
  recipe: Recipe,
  locale: string
): Promise<Recipe> {
  return translateRecipe(recipe, locale);
}

/**
 * Stub: Returns original recipe
 */
export async function translateRecipeWithMetaAndInstructions(
  recipe: Recipe,
  locale: string
): Promise<Recipe> {
  return translateRecipe(recipe, locale);
}
