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

    // Map locales to Google Translate ISO codes
    // Google Translate expects 'pt' for Portuguese, not 'pt-br'
    const supportedLocales: Record<string, string> = {
        'pt-br': 'pt',
        // Add others if needed (e.g. 'zh-cn' -> 'zh')
    };

    const isoTarget = supportedLocales[targetLang.toLowerCase()] || targetLang;

    try {
        const res = await translate(text, {
            to: isoTarget,
            rejectOnPartialFail: false
        });
        return res.text;
    } catch (error) {
        console.error(`Translation error (${targetLang} -> ${isoTarget}):`, error);
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
        const res = await translate(text, {
            to: 'en',
            rejectOnPartialFail: false
        });
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
        // Optimization: Join all ingredients into one string to translate in a single request
        // Delimiter must be something that won't be translated or confuse the parser
        const delimiter = ' ||| ';
        const combinedText = ingredients.join(delimiter);

        const translatedText = await translateToEnglish(combinedText);

        // Split back into array
        return translatedText.split(delimiter).map(s => s.trim());
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

        if (cached && !error && cached.instructions) { // Ensure incomplete translations (from list view) don't block full translation
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

        // Prepare Ingredients for Batch Translation
        // Format: "Name ||| Measure $$$ Name ||| Measure" to keep structure
        const delimiter = ' ||| ';
        const itemDelimiter = ' $$$ ';

        const ingredientsText = recipe.ingredients
            .map(ing => `${ing.name}${delimiter}${ing.measure}`)
            .join(itemDelimiter);

        // Parallelize translations (reduced to 3 calls max)
        const [translatedTitle, translatedInstructions, translatedIngredientsText] = await Promise.all([
            translateText(recipe.name, locale),
            translateText(recipe.instructions, locale),
            translateText(ingredientsText, locale)
        ]);

        // Parse translated ingredients back
        const translatedIngredients = translatedIngredientsText
            .split(itemDelimiter)
            .map((item, index) => {
                const parts = item.split(delimiter);
                // Fallback to original if split fails (mismatched delimiters in translation)
                const original = recipe.ingredients[index];

                if (parts.length >= 2) {
                    return {
                        ...original,
                        name: parts[0].trim(),
                        measure: parts[1].trim()
                    };
                } else {
                    // Try to recover gracefully
                    return {
                        ...original,
                        name: item.trim(),
                        // keep original measure if lost
                    };
                }
            });

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

/**
 * Efficiently translates a list of Recipes (Titles Only) for the Index page.
 * Uses batching and caching.
 * @param recipes List of recipes
 * @param locale Target locale
 */
export async function translateRecipesList(recipes: Recipe[], locale: string): Promise<Recipe[]> {
    if (!locale || locale === 'en' || !recipes.length) return recipes;

    try {
        const recipeIds = recipes.map(r => r.id);

        // 1. Bulk Check Cache
        const { data: cachedList, error } = await supabase
            .from('recipe_translations')
            .select('recipe_id, title')
            .in('recipe_id', recipeIds)
            .eq('locale', locale);

        const cachedMap = new Map<string, string>();
        if (cachedList && !error) {
            cachedList.forEach((row: { recipe_id: string, title: string }) => {
                if (row.title) cachedMap.set(row.recipe_id, row.title);
            });
        }

        // 2. Identify missing translations
        const missingRecipes = recipes.filter(r => !cachedMap.has(r.id));

        if (missingRecipes.length > 0) {
            devLog.log(`[Translation] List: Translating ${missingRecipes.length} titles for ${locale}`);

            // Batch prepare
            const titles = missingRecipes.map(r => r.name);
            const delimiter = ' ||| ';
            const joinedTitles = titles.join(delimiter);

            // Translate
            const translatedBlock = await translateText(joinedTitles, locale);
            const translatedTitles = translatedBlock.split(delimiter);

            // 3. Fire-and-forget Cache Updates
            const updates = missingRecipes.map((recipe, index) => {
                const tTitle = translatedTitles[index]?.trim() || recipe.name;
                cachedMap.set(recipe.id, tTitle); // Update local map for immediate return

                return {
                    recipe_id: recipe.id,
                    locale: locale,
                    title: tTitle,
                    instructions: null, // Explicitly null to mark as partial
                    ingredients: []    // Explicitly empty
                };
            });

            // Insert new partial records. 
            // IMPORTANT: stick to ignoreDuplicates=true to prevent overwriting 
            // a Full Translation that might have happened in parallel.
            const { error: upsertError } = await supabase
                .from('recipe_translations')
                .upsert(updates, { onConflict: 'recipe_id,locale', ignoreDuplicates: true });

            if (upsertError) {
                console.error('[Translation] List cache upsert error:', upsertError);
            }
        }

        // 4. Return merged results
        return recipes.map(r => ({
            ...r,
            name: cachedMap.get(r.id) || r.name
        }));

    } catch (error) {
        console.error('[Translation] List translation error:', error);
        return recipes;
    }
}

import { BlogPost, DBBlogPost } from '@/lib/types/blog';

// Helper for concurrency control
async function pMap<T, R>(
    collection: T[],
    mapper: (item: T) => Promise<R>,
    concurrency: number
): Promise<R[]> {
    const results: R[] = new Array(collection.length);
    const executing: Promise<void>[] = [];

    for (const [index, item] of collection.entries()) {
        const p = mapper(item).then(result => {
            results[index] = result;
        });
        executing.push(p);

        if (executing.length >= concurrency) {
            await Promise.race(executing);
            // Remove completed promises (this is a simplified logic, for strict order preserving we used array index above)
            // Actually Promise.race just tells us *one* finished, we need to find which one.
            // Simpler: Just chunks.
        }
    }
    await Promise.all(executing);
    return results;
}

// Simple batch helper
async function processInBatches<T, R>(items: T[], batchSize: number, fn: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(fn));
        results.push(...batchResults);
    }
    return results;
}


/**
 * Translates a list of Blog Posts (Title and Excerpt)
 * Currently performs on-the-fly translation without database caching.
 */
export async function translateBlogPosts<T extends BlogPost | DBBlogPost>(posts: T[], locale: string): Promise<T[]> {
    if (!locale || locale === 'en' || !posts.length) return posts;

    try {
        devLog.log(`[Translation] Blog: Translating ${posts.length} posts for ${locale}`);

        // Batch prepare to save requests
        // Format: Title ||| Excerpt $$$ Title ||| Excerpt
        const delimiter = ' ||| ';
        const itemDelimiter = ' $$$ ';

        const combinedText = posts
            .map(p => `${p.title || ''}${delimiter}${p.excerpt || ''}`)
            .join(itemDelimiter);

        const translatedText = await translateText(combinedText, locale);

        // Parse back
        const translatedItems = translatedText.split(itemDelimiter);

        return posts.map((post, index) => {
            const parts = translatedItems[index]?.split(delimiter);

            // Fallback to original if something broke
            if (!parts || parts.length < 2) return post;

            return {
                ...post,
                title: parts[0].trim(),
                excerpt: parts[1].trim()
            };
        });

    } catch (error) {
        console.error('[Translation] Blog translation error:', error);
        return posts;
    }
}

import { FAQItem } from '@/lib/services/seo-enricher';

/**
 * Translates a list of FAQ Items (Question and Answer)
 * On-the-fly translation.
 */
export async function translateFAQ(faq: FAQItem[], locale: string): Promise<FAQItem[]> {
    if (!locale || locale === 'en' || !faq.length) return faq;

    try {
        devLog.log(`[Translation] FAQ: Translating ${faq.length} items for ${locale}`);

        // Batch prepare
        const delimiter = ' ||| ';
        const itemDelimiter = ' $$$ ';

        const combinedText = faq
            .map(item => `${item.question}${delimiter}${item.answer}`)
            .join(itemDelimiter);

        const translatedText = await translateText(combinedText, locale);
        const translatedItems = translatedText.split(itemDelimiter);

        return faq.map((item, index) => {
            const parts = translatedItems[index]?.split(delimiter);

            if (!parts || parts.length < 2) return item;

            return {
                question: parts[0].trim(),
                answer: parts[1].trim()
            };
        });

    } catch (error) {
        console.error('[Translation] FAQ translation error:', error);
        return faq;
    }
}

/**
 * Translates a SINGLE blog post including its full content (Markdown).
 * Used for the Blog Detail page.
 */
export async function translateBlogPostFull<T extends BlogPost | DBBlogPost>(post: T, locale: string): Promise<T> {
    if (!locale || locale === 'en') return post;

    try {
        devLog.log(`[Translation] translating full blog post: ${post.title}`);

        // Format: Title ||| Excerpt (translate strictly these two first)
        const metaDelimiter = ' ||| ';
        const metaText = `${post.title || ''}${metaDelimiter}${post.excerpt || ''}`;
        const translatedMeta = await translateText(metaText, locale);
        const [title, excerpt] = translatedMeta.split(metaDelimiter);

        // Translate content - split by paragraphs
        const contentChunks = post.content.split('\n\n');

        // Parallelize content translation with concurrency limit of 5
        const translatedChunks = await processInBatches(contentChunks, 5, async (chunk) => {
            if (!chunk.trim()) return chunk;
            return await translateText(chunk, locale);
        });

        const content = translatedChunks.join('\n\n');

        return {
            ...post,
            title: title?.trim() || post.title,
            excerpt: excerpt?.trim() || post.excerpt,
            content
        };
    } catch (error) {
        console.error('[Translation] Full blog post translation error:', error);
        return post;
    }
}


