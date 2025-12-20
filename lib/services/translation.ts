import translate from 'google-translate-api-x';
import { devLog } from '@/lib/utils/logger';
import { supabase } from '@/lib/supabase';
import { Recipe } from '@/lib/types/recipe';

/**
 * Generic translation function
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text || !text.trim()) return text;
    if (targetLang === 'en') return text; // Assuming input is English

    try {
        const res = await translate(text, { to: targetLang });
        return res.text;
    } catch (error) {
        console.error(`Translation error (${targetLang}):`, error);
        return text;
    }
}

/**
 * Translates text to English if it's not already English.
 * Uses google-translate-api-x (free proxy) to avoid API keys.
 * 
 * @param text The text to translate
 * @returns The translated text in English
 */
export async function translateToEnglish(text: string): Promise<string> {
    if (!text || text.trim() === '') return text;

    try {
        const res = await translate(text, { to: 'en' });
        if (res.text && res.text !== text) {
            devLog.log(`Translated "${text}" to "${res.text}"`);
            return res.text;
        }
        return text;
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Fallback to original text
    }
}

/**
 * Translates an array of ingredients to English
 * @param ingredients Array of ingredient names
 * @returns Array of translated ingredient names
 */
export async function translateIngredientsToEnglish(ingredients: string[]): Promise<string[]> {
    if (!ingredients || ingredients.length === 0) return [];

    try {
        // Parallel translation
        const translated = await Promise.all(
            ingredients.map(async (ing) => {
                return await translateToEnglish(ing);
            })
        );
        return translated;
    } catch (error) {
        console.error('Bulk translation error:', error);
        return ingredients;
    }
}

/**
 * Server-Side Recipe Translation with Supabase Caching
 */
export async function translateRecipe(recipe: Recipe, locale: string): Promise<Recipe> {
    // 1. Fast exit for English or missing data
    if (!locale || locale === 'en' || !recipe) return recipe;

    try {
        // 2. Check Cache
        const { data: cached, error } = await supabase
            .from('recipe_translations')
            .select('*')
            .eq('recipe_id', recipe.id)
            .eq('locale', locale)
            .maybeSingle();

        if (cached && !error) {
            // devLog.log(`[Translation] Cache hit for ${recipe.id} (${locale})`);
            return {
                ...recipe,
                name: cached.title || recipe.name,
                instructions: cached.instructions || recipe.instructions,
                ingredients: Array.isArray(cached.ingredients) ? cached.ingredients : recipe.ingredients,
            };
        }

        // 3. Translate if not in cache
        devLog.log(`[Translation] Cache miss for ${recipe.name} (${locale}). Translating...`);

        // Parallelize translations
        const [translatedTitle, translatedInstructions, translatedIngredients] = await Promise.all([
            translateText(recipe.name, locale),
            translateText(recipe.instructions, locale),
            Promise.all(recipe.ingredients.map(async (ing) => ({
                ...ing,
                name: await translateText(ing.name, locale),
                measure: await translateText(ing.measure, locale)
            })))
        ]);

        // 4. Save to Cache (Fire and Forget to not block return if it fails? No, better wait to ensure consistency)
        const { error: insertError } = await supabase
            .from('recipe_translations')
            .upsert({
                recipe_id: recipe.id,
                locale: locale,
                title: translatedTitle,
                instructions: translatedInstructions,
                ingredients: translatedIngredients
            }, { onConflict: 'recipe_id,locale' });

        if (insertError) {
            console.error('[Translation] Failed to cache translation:', insertError);
        }

        return {
            ...recipe,
            name: translatedTitle,
            instructions: translatedInstructions,
            ingredients: translatedIngredients
        };

    } catch (error) {
        console.error('[Translation] Critical error in translateRecipe:', error);
        return recipe; // Fallback to original English
    }
}
