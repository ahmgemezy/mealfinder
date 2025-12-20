import translate from 'google-translate-api-x';
import { devLog } from '@/lib/utils/logger';

/**
 * Translates text to English if it's not already English.
 * Uses google-translate-api-x (free proxy) to avoid API keys.
 * 
 * @param text The text to translate
 * @returns The translated text in English
 */
export async function translateToEnglish(text: string): Promise<string> {
    // Simple check: if text is empty or looks like English (basic ASCII), return properly.
    // Actually, we should just let Google detect. But avoiding network calls for obvious English avoids latency.
    // However, "smart" detection is hard. Let's just trust Google.
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
