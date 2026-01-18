import translate from 'google-translate-api-x';
import { devLog } from '@/lib/utils/logger';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
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

        // Safety check for library response
        if (!res || !res.text) {
            throw new Error('Empty response from translation service');
        }

        return res.text;
    } catch (error) {
        // Reduce log noise for common transient errors
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("Cannot read properties of null") || msg.includes("Too Many Requests")) {
            console.warn(`[Silent Translation Fail] (${targetLang}): ${msg}`);
        } else {
            console.error(`Translation error (${targetLang}). Text len: ${text.length}. Error:`, error);
        }
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

        // 4. Save to Cache
        const { error: insertError } = await supabaseAdmin // Use admin to bypass RLS
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
            const { error: upsertError } = await supabaseAdmin // Use admin to bypass RLS
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
        // 1. Bulk Check Cache
        const slugs = posts.map(p => p.slug);
        const { data: cachedList, error } = await supabase
            .from('blog_translations')
            .select('post_slug, title, excerpt')
            .in('post_slug', slugs)
            .eq('locale', locale);

        const cachedMap = new Map<string, { title: string, excerpt: string }>();
        if (cachedList && !error) {
            cachedList.forEach((row: { post_slug: string, title: string, excerpt: string }) => {
                if (row.title) cachedMap.set(row.post_slug, { title: row.title, excerpt: row.excerpt });
            });
        }

        // 2. Identify missing translations
        const missingPosts = posts.filter(p => !cachedMap.has(p.slug));

        if (missingPosts.length > 0) {
            devLog.log(`[Translation] Blog: Translating ${missingPosts.length} posts for ${locale}`);

            // Batch processing to avoid hitting API limits (safe limit ~2000 chars)
            const BATCH_SIZE = 5;
            const delimiter = ' ||| ';
            const itemDelimiter = ' $$$ ';

            const chunkedPosts = [];
            for (let i = 0; i < missingPosts.length; i += BATCH_SIZE) {
                chunkedPosts.push(missingPosts.slice(i, i + BATCH_SIZE));
            }

            const translatedChunks = await Promise.all(chunkedPosts.map(async (chunk) => {
                try {
                    const combinedText = chunk
                        .map(p => `${p.title || ''}${delimiter}${p.excerpt || ''}`)
                        .join(itemDelimiter);

                    const translatedText = await translateText(combinedText, locale);
                    const translatedItems = translatedText.split(itemDelimiter);

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const batchUpdates: any[] = [];

                    const translatedChunk = chunk.map((post, index) => {
                        const parts = translatedItems[index]?.split(delimiter);

                        // Fallback to original if something broke
                        const tTitle = (parts && parts.length >= 2) ? parts[0].trim() : post.title;
                        const tExcerpt = (parts && parts.length >= 2) ? parts[1].trim() : post.excerpt;

                        // Add to update queue
                        batchUpdates.push({
                            post_slug: post.slug,
                            locale: locale,
                            title: tTitle,
                            excerpt: tExcerpt,
                            // Content is null for list view translations
                        });

                        // Update local map instantly
                        cachedMap.set(post.slug, { title: tTitle, excerpt: tExcerpt });

                        return {
                            ...post,
                            title: tTitle,
                            excerpt: tExcerpt
                        };
                    });

                    // Fire and forget upsert for this chunk
                    if (batchUpdates.length > 0) {
                        // ignoreDuplicates: true is safer if another request is also writing
                        await supabaseAdmin // Use admin to bypass RLS
                            .from('blog_translations')
                            .upsert(batchUpdates, { onConflict: 'post_slug,locale', ignoreDuplicates: true });
                    }

                    return translatedChunk;

                } catch (err) {
                    console.error('[Translation] Batch chunk error:', err);
                    return chunk; // Fallback for this chunk
                }
            }));
        }

        // 4. Return merged results using the map (source of truth)
        return posts.map(post => {
            const cached = cachedMap.get(post.slug);
            if (cached) {
                return { ...post, title: cached.title, excerpt: cached.excerpt };
            }
            return post;
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
        // 1. Check Cache
        const { data: cached, error } = await supabase
            .from('blog_translations')
            .select('*')
            .eq('post_slug', post.slug)
            .eq('locale', locale)
            .maybeSingle();

        if (cached && !error && cached.content) {
            // devLog.log(`[Translation] Blog Cache hit for ${post.title}`);
            return {
                ...post,
                title: cached.title || post.title,
                excerpt: cached.excerpt || post.excerpt,
                content: cached.content
            };
        }

        devLog.log(`[Translation] translating full blog post: ${post.title} (Cache Miss)`);

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

        // 3. Save to Cache (Upsert)
        const { error: upsertError } = await supabaseAdmin // Use admin to bypass RLS
            .from('blog_translations')
            .upsert({
                post_slug: post.slug,
                locale: locale,
                title: title?.trim() || post.title,
                excerpt: excerpt?.trim() || post.excerpt,
                content: content
            }, { onConflict: 'post_slug,locale' });

        if (upsertError) {
            console.error('[Translation] Full blog cache error:', upsertError);
        }

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



import { SEOEnrichment } from '@/lib/services/seo-enricher';

/**
 * Translates and caches SEO Enrichment data (Intro, FAO, etc.)
 */
export async function translateSEOEnrichment(
    enrichment: SEOEnrichment,
    locale: string
): Promise<SEOEnrichment> {
    if (!locale || locale === 'en' || !enrichment) return enrichment;

    try {
        // 1. Check Cache
        const { data: cached, error } = await supabase
            .from('recipe_seo_translations')
            .select('*')
            .eq('recipe_id', enrichment.recipeId)
            .eq('locale', locale)
            .maybeSingle();

        if (cached && !error) {
            // devLog.log(`[Translation] SEO Cache hit for ${enrichment.recipeId} (${locale})`);
            return {
                ...enrichment,
                intro: cached.intro || enrichment.intro,
                faq: cached.faq || enrichment.faq,
                metaDescription: cached.meta_description || enrichment.metaDescription,
                keywords: cached.keywords || enrichment.keywords,
                culturalSnippet: cached.cultural_snippet || enrichment.culturalSnippet,
            };
        }

        // 2. Translate if not in cache (Cache Miss)
        devLog.log(`[Translation] SEO Cache miss for ${enrichment.recipeId} (${locale}). Translating...`);

        // Prepare text for batch translation
        // We'll translate Intro and Meta Description. 
        // FAQ is handled separately via translateFAQ (which we can optionally cache here too)

        const introText = enrichment.intro || "";
        const metaDescText = enrichment.metaDescription || "";
        const culturalText = enrichment.culturalSnippet || "";

        // Batch translate core text fields
        const delimiter = ' ||| ';
        const combinedText = `${introText}${delimiter}${metaDescText}${delimiter}${culturalText}`;

        const [translatedCombined, translatedFaq] = await Promise.all([
            translateText(combinedText, locale),
            translateFAQ(enrichment.faq, locale)
        ]);

        const [tIntro, tMeta, tCultural] = translatedCombined.split(delimiter);

        // 3. Save to Cache
        const { error: upsertError } = await supabaseAdmin
            .from('recipe_seo_translations')
            .upsert({
                recipe_id: enrichment.recipeId,
                locale: locale,
                intro: tIntro?.trim() || introText,
                meta_description: tMeta?.trim() || metaDescText,
                cultural_snippet: tCultural?.trim() || culturalText,
                faq: translatedFaq,
                keywords: enrichment.keywords // We typically don't translate keywords automatically as search behavior varies, keeping original for now
            }, { onConflict: 'recipe_id,locale' });

        if (upsertError) {
            console.error('[Translation] SEO cache upsert error:', upsertError);
        }

        return {
            ...enrichment,
            intro: tIntro?.trim() || introText,
            metaDescription: tMeta?.trim() || metaDescText,
            culturalSnippet: tCultural?.trim() || culturalText,
            faq: translatedFaq
        };

    } catch (error) {
        console.error('[Translation] SEO translation error:', error);
        return enrichment;
    }
}
