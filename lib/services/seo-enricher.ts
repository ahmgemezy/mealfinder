/**
 * SEO Enricher Service
 * 
 * Uses JINA.ai to generate SEO metadata for recipes:
 * - FAQ structured data (highest SEO impact)
 * - Enhanced meta descriptions
 * - Long-tail keywords
 * - Internal linking suggestions
 * 
 * This service NEVER modifies original recipe data.
 */

"use server";

import { createClient } from "@supabase/supabase-js";
import { Recipe } from "@/lib/types/recipe";



// ============================================================================
// Configuration
// ============================================================================

const JINA_SEARCH_URL = "https://s.jina.ai/";
const JINA_READER_URL = "https://r.jina.ai/";

// Initialize Supabase client for caching
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================================================
// Types
// ============================================================================

export interface FAQItem {
    question: string;
    answer: string;
}

export interface SEOEnrichment {
    recipeId: string;
    faq: FAQItem[];
    metaDescription: string;
    keywords: string[];
    culturalSnippet: string;
    relatedRecipes: string[];
    relatedBlogPosts: string[];
    enrichedAt: string;
    intro?: string;
}

interface JinaSearchResult {
    title: string;
    url: string;
    content: string;
    description?: string;
}

// ============================================================================
// JINA.ai API Functions
// ============================================================================

async function searchWithJina(query: string): Promise<JinaSearchResult[]> {
    const apiKey = process.env.JINA_API_KEY;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    try {
        const response = await fetch(
            `${JINA_SEARCH_URL}${encodeURIComponent(query)}`,
            { headers }
        );
        if (!response.ok) return [];
        const data = await response.json();
        return (data.data || []).slice(0, 3).map((item: Record<string, unknown>) => ({
            title: (item.title as string) || "",
            url: (item.url as string) || "",
            content: (item.content as string) || "",
            description: (item.description as string) || "",
        }));
    } catch {
        return [];
    }
}

async function readWithJina(url: string): Promise<string> {
    const apiKey = process.env.JINA_API_KEY;
    const headers: Record<string, string> = { Accept: "text/plain" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    try {
        const response = await fetch(`${JINA_READER_URL}${url}`, { headers });
        if (!response.ok) return "";
        return (await response.text()).slice(0, 8000);
    } catch {
        return "";
    }
}

// ============================================================================
// OpenAI Integration for Processing
// ============================================================================

// ============================================================================
// OpenAI Integration for Processing
// ============================================================================

import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

// Lazy initialization of OpenAI client to prevent build crashes
let openaiInstance: OpenAI | null = null;

function getOpenAI() {
    if (!openaiInstance) {
        openaiInstance = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
        });
    }
    return openaiInstance;
}

// Helper to check if OpenAI is actually configured
function isOpenAIConfigured() {
    return !!process.env.OPENAI_API_KEY;
}

async function openaiChat(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    maxTokens = 2048
): Promise<string> {
    const instance = getOpenAI();
    try {
        const response = await instance.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            max_tokens: maxTokens,
        });

        return response.choices[0]?.message?.content || "";
    } catch (e) {
        console.error(`Status: OpenAI API error`, e);
        throw new Error(`OpenAI API error: ${e instanceof Error ? e.message : String(e)}`);
    }
}

// ============================================================================
// SEO Enrichment Functions
// ============================================================================

// ============================================================================
// SEO Enrichment Functions
// ============================================================================

// Schema for FAQ Response
const FAQSchema = z.object({
    faqs: z.array(z.object({
        question: z.string(),
        answer: z.string(),
    })),
});

/**
 * Generate FAQ questions and answers for a recipe
 */
async function generateFAQ(recipe: Recipe, sourceKnowledge: string): Promise<FAQItem[]> {
    // 1. Primary Strategy: Use Jina Knowledge + Recipe Data
    const primaryPrompt = `You are an SEO expert creating FAQ schema content for a recipe page.

Recipe: ${recipe.name}
Category: ${recipe.category || "General"}
Cuisine: ${recipe.area || "International"}
Ingredients: ${recipe.ingredients.map((i) => i.name).join(", ")}
Instructions: ${recipe.instructions?.substring(0, 5000) || "Follow standard preparation."}

RESEARCH KNOWLEDGE (For Context Only):
${sourceKnowledge.slice(0, 5000)}

Generate 5-7 frequently asked questions.
Use the Research Knowledge to find *common questions* people ask about this dish.

ANSWERING RULES:
1. Cooking Steps/Ingredients: MUST be based on the provided Recipe Data.
2. Storage/Reheating/Substitutions: You MAY use your general culinary knowledge if the recipe doesn't explicitly state it (e.g., "Can I freeze pesto?" is a valid question to answer with general knowledge).

Focus on:
- Storage & Shelf Life (e.g. "How long does this last?")
- Usage/Serving (e.g. "What to serve with...?")
- Dietary/Substitutions (e.g. "Can I make this vegan?")

Keep answers concise (50-100 words). Be helpful and accurate.`;

    if (!isOpenAIConfigured()) return [];

    try {
        const completion = await getOpenAI().chat.completions.create({
            model: "gpt-4o-2024-08-06",
            messages: [
                { role: "system", content: "You are an SEO and culinary expert." },
                { role: "user", content: primaryPrompt },
            ],
            response_format: zodResponseFormat(FAQSchema, "faq_response"),
        });

        const content = completion.choices[0].message.content;
        if (content) {
            const parsed = JSON.parse(content);
            const result = FAQSchema.parse(parsed);
            if (result && result.faqs && result.faqs.length > 0) {
                return result.faqs;
            }
        }
    } catch (e) {
        // Fall through to fallback
        console.warn("   ⚠️ Primary FAQ generation failed:", e);
    }

    // 2. Fallback Strategy: Pure Internal Knowledge (if Jina failed or strict prompt yielded nothing)
    console.log("   ⚠️ Primary FAQ generation returned 0 items. Attempting OpenAI Fallback...");
    const fallbackPrompt = `Generate 5 standard culinary FAQs for "${recipe.name}".
    
    Since specific recipe details might be sparse, focus on GENERAL Best Practices for this type of dish:
    1. Storage (How to store, how long it lasts in fridge/freezer)
    2. Serving Suggestions (What pairs well with it)
    3. Common Variations (e.g. "Can I add spicy peppers?")
    
    Recipe Ingredients for context: ${recipe.ingredients.map((i) => i.name).join(", ")}`;

    if (!isOpenAIConfigured()) return [];

    try {
        const completion = await getOpenAI().chat.completions.create({
            model: "gpt-4o-2024-08-06",
            messages: [
                { role: "system", content: "You are a helpful culinary assistant." },
                { role: "user", content: fallbackPrompt }
            ],
            response_format: zodResponseFormat(FAQSchema, "faq_response"),
        });

        const content = completion.choices[0].message.content;
        if (content) {
            const parsed = JSON.parse(content);
            const result = FAQSchema.parse(parsed);
            return result.faqs || [];
        }
        return [];

    } catch (e) {
        console.error("   ❌ FAQ Fallback request failed:", e);
        return [];
    }
}


/**
 * Generate CTR-optimized meta description
 */
async function generateMetaDescription(recipe: Recipe): Promise<string> {
    const prompt = `Create a compelling meta description for this recipe page.
    
Recipe: ${recipe.name}
Category: ${recipe.category || "Main Course"}
Cuisine: ${recipe.area || "International"}
Cook Time: ${recipe.readyInMinutes || "N/A"} minutes
Ingredients Overview: ${recipe.ingredients.slice(0, 5).map(i => i.name).join(", ")}...

Requirements:
- ACURRACY: Must reflect the actual recipe details above.
- Maximum 155 characters.
- Include primary keyword (recipe name).
- Add time if available.
- Create urgency or interest.

Example:
"Learn how to make ${recipe.name} in ${recipe.readyInMinutes || 30} minutes. A delicious ${recipe.area || "homemade"} ${recipe.category || "dish"} perfect for dinner!"

Output ONLY the meta description, no quotes.`;

    try {
        const response = await openaiChat([
            { role: "user", content: prompt },
        ]);
        return response.trim().slice(0, 160);
    } catch {
        return `Learn how to make ${recipe.name}. ${recipe.area || "Delicious"} ${recipe.category || "recipe"} ready in ${recipe.readyInMinutes || 30} minutes.`;
    }
}

/**
 * Generate long-tail keywords
 */
async function generateKeywords(recipe: Recipe): Promise<string[]> {
    const baseKeywords = [
        recipe.name.toLowerCase(),
        `${recipe.name.toLowerCase()} recipe`,
        `how to make ${recipe.name.toLowerCase()}`,
        `easy ${recipe.name.toLowerCase()}`,
    ];

    if (recipe.area) {
        baseKeywords.push(`${recipe.area.toLowerCase()} ${recipe.name.toLowerCase()}`);
        baseKeywords.push(`authentic ${recipe.area.toLowerCase()} recipe`);
    }

    if (recipe.category) {
        baseKeywords.push(`${recipe.category.toLowerCase()} recipe`);
    }

    if (recipe.readyInMinutes && recipe.readyInMinutes <= 30) {
        baseKeywords.push(`quick ${recipe.name.toLowerCase()}`);
        baseKeywords.push(`${recipe.readyInMinutes} minute ${recipe.category?.toLowerCase() || "recipe"}`);
    }

    return [...new Set(baseKeywords)].slice(0, 10);
}

/**
 * Generate cultural context snippet
 */
async function generateCulturalSnippet(recipe: Recipe): Promise<string> {
    if (!recipe.area || recipe.area.trim() === "") {
        return "";
    }

    const prompt = `Write a brief cultural context for this recipe (2-3 sentences max).

Recipe: ${recipe.name}
Cuisine: ${recipe.area}

Using your internal expert knowledge of world cuisines, write about the origin or tradition of this dish.
If the dish is generic, focus on the key ingredients' role in that cuisine.
Keep it under 100 words. Output ONLY the snippet.`;

    try {
        const response = await openaiChat([{ role: "user", content: prompt }]);
        return response.trim().slice(0, 300);
    } catch {
        return "";
    }
}

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Get cached SEO enrichment from Supabase
 */
export async function getCachedEnrichment(
    recipeId: string
): Promise<SEOEnrichment | null> {
    if (!supabaseUrl || !supabaseServiceKey) return null;

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data, error } = await supabase
            .from("recipe_seo_enrichments")
            .select("*")
            .eq("recipe_id", recipeId)
            .single();

        if (error || !data) return null;

        // Check if cache is stale (older than 14 days)
        const enrichedAt = new Date(data.enriched_at);
        const now = new Date();
        const daysDiff = (now.getTime() - enrichedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff > 14) return null; // Cache expired

        return {
            recipeId: data.recipe_id,
            faq: data.faq || [],
            metaDescription: data.meta_description || "",
            keywords: data.keywords || [],
            culturalSnippet: data.cultural_snippet || "",
            relatedRecipes: data.related_recipes || [],
            relatedBlogPosts: data.related_posts || [],
            enrichedAt: data.enriched_at,
            intro: data.intro || "",
        };
    } catch {
        return null;
    }
}

/**
 * Save SEO enrichment to Supabase cache
 */
export async function cacheEnrichment(
    enrichment: SEOEnrichment
): Promise<boolean> {
    if (!supabaseUrl || !supabaseServiceKey) return false;

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { error } = await supabase.from("recipe_seo_enrichments").upsert(
            {
                recipe_id: enrichment.recipeId,
                faq: enrichment.faq,
                meta_description: enrichment.metaDescription,
                keywords: enrichment.keywords,
                cultural_snippet: enrichment.culturalSnippet,
                related_recipes: enrichment.relatedRecipes,
                related_posts: enrichment.relatedBlogPosts,
                enriched_at: new Date().toISOString(),
                intro: enrichment.intro,
            },
            { onConflict: "recipe_id" }
        );

        return !error;
    } catch {
        return false;
    }
}

// ============================================================================
// Main Enrichment Function
// ============================================================================

/**
 * Generate unique Chef's Introduction
 */
async function generateRecipeIntro(recipe: Recipe): Promise<string> {
    const prompt = `Write a unique 50-80 word "Chef's Introduction" for this recipe.
    
Recipe: ${recipe.name}
Category: ${recipe.category}
Cuisine: ${recipe.area}

Focus on:
- Why this dish is special/delicious
- Provide a "chef's tip" or flavor note
- Create a welcoming tone (e.g., "This vibrant pasta dish combines...")
- Use varied sentence structure

Output ONLY the text paragraph.`;

    try {
        const response = await openaiChat([{ role: "user", content: prompt }]);
        return response.trim();
    } catch {
        // Fallback generic intro if API fails
        return `Discover how to make the perfect ${recipe.name}. This ${recipe.area} classic is part of our ${recipe.category} collection and is sure to impress your family and friends with its delicious flavors.`;
    }
}

/**
 * Enrich a recipe with SEO metadata
 * Returns cached data if available, otherwise generates new enrichment
 */
export async function enrichRecipeSEO(
    recipe: Recipe
): Promise<SEOEnrichment | null> {
    // 1. Check cache first
    const cached = await getCachedEnrichment(recipe.id);
    if (cached) {
        return cached;
    }

    // 2. Start Jina Research in background (independent of other tasks EXCEPT FAQ)
    const jinaResearchPromise = (async () => {
        try {
            console.log(`   Running Jina FAQ research...`);
            const searchQuery = `${recipe.name} recipe FAQ common questions mistakes`;
            const searchResults = await searchWithJina(searchQuery);

            if (searchResults.length > 0) {
                // Parallelize reading the top 2 results
                const contents = await Promise.all(
                    searchResults.slice(0, 2).map(result => readWithJina(result.url))
                );

                return searchResults.slice(0, 2).map((result, index) =>
                    `\nSOURCE: ${result.title}\n${contents[index]}\n`
                ).join("");
            }
            return "";
        } catch (e) {
            console.warn(`   ⚠️ Jina FAQ research failed, falling back to internal knowledge:`, e);
            return "";
        }
    })();

    // 3. Generate enrichments in parallel
    // We start the independent ones immediately without waiting for Jina
    const metaPromise = generateMetaDescription(recipe);
    const keywordsPromise = generateKeywords(recipe);
    const culturalSnippetPromise = generateCulturalSnippet(recipe);
    const introPromise = generateRecipeIntro(recipe);

    // FAQ depends on Jina, so we chain it
    const faqPromise = jinaResearchPromise.then(sourceContent =>
        generateFAQ(recipe, sourceContent)
    );

    const [faq, metaDescription, keywords, culturalSnippet, intro] = await Promise.all([
        faqPromise,
        metaPromise,
        keywordsPromise,
        culturalSnippetPromise,
        introPromise,
    ]);

    const enrichment: SEOEnrichment = {
        recipeId: recipe.id,
        faq,
        metaDescription,
        keywords,
        culturalSnippet,
        intro: intro || "",
        relatedRecipes: [], // Could be populated by similarity search
        relatedBlogPosts: [], // Could be populated by tag matching
        enrichedAt: new Date().toISOString(),
    };

    // 4. Cache the result
    await cacheEnrichment(enrichment);

    return enrichment;
}

/**
 * Get SEO enrichment for recipe page (safe for use in pages)
 * Returns null if no enrichment available (won't block page render)
 */
export async function getRecipeSEO(
    recipe: Recipe
): Promise<SEOEnrichment | null> {
    try {
        // Only return cached data in production to avoid slow page loads
        // Try to get cached data first
        let cached = await getCachedEnrichment(recipe.id);

        if (cached) {
            // CACHE HEALING: If cache exists but misses 'intro' (Chef's Tips), generate it!
            if (!cached.intro || cached.intro.trim() === "") {
                console.log(`🩹 Healing Cache for: ${recipe.name} (Missing Intro)`);
                const newIntro = await generateRecipeIntro(recipe);

                // Update object in memory
                cached.intro = newIntro;

                // Update DB in background (don't block response too long if possible, 
                // but for now await to ensure consistency)
                await cacheEnrichment(cached);
            }
            return cached;
        }

        // If not cached, generate it ON THE FLY (Runtime Enrichment)
        // This ensures every page viewed by a user/bot gets enriched
        console.log(`⚡️ Runtime Enrichment triggered for: ${recipe.name}`);
        return await enrichRecipeSEO(recipe);
    } catch {
        return null;
    }
}
